-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create schemas
create schema if not exists shared;
create schema if not exists tenant_template;

-- Enable RLS on all tables by default
alter default privileges revoke execute on functions from public;

-- Shared tables
create table shared.tenants (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    slug text not null unique,
    plan text not null default 'free',
    custom_domain text unique,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create table shared.users (
    id uuid primary key default uuid_generate_v4(),
    email text not null unique,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create table shared.tenant_users (
    tenant_id uuid references shared.tenants(id) on delete cascade,
    user_id uuid references shared.users(id) on delete cascade,
    role text not null check (role in ('owner', 'admin', 'member')),
    created_at timestamp with time zone default now(),
    primary key (tenant_id, user_id)
);

-- Template tables (copied for each tenant)
create table tenant_template.projects (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    description text,
    status text not null default 'active',
    created_by uuid not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- RLS Policies

-- Tenants table policies
alter table shared.tenants enable row level security;

create policy "Tenants are viewable by their members"
    on shared.tenants for select
    using (
        exists (
            select 1 from shared.tenant_users
            where tenant_users.tenant_id = tenants.id
            and tenant_users.user_id = auth.uid()
        )
    );

create policy "Tenants can be created by authenticated users"
    on shared.tenants for insert
    with check (
        auth.role() = 'authenticated'
    );

-- Tenant users table policies
alter table shared.tenant_users enable row level security;

create policy "Tenant users are viewable by tenant members"
    on shared.tenant_users for select
    using (
        exists (
            select 1 from shared.tenant_users as tu
            where tu.tenant_id = tenant_users.tenant_id
            and tu.user_id = auth.uid()
        )
    );

create policy "Tenant owners can manage users"
    on shared.tenant_users for all
    using (
        exists (
            select 1 from shared.tenant_users as tu
            where tu.tenant_id = tenant_users.tenant_id
            and tu.user_id = auth.uid()
            and tu.role = 'owner'
        )
    );

-- Template table policies
alter table tenant_template.projects enable row level security;

create policy "Projects are viewable by tenant members"
    on tenant_template.projects for select
    using (
        exists (
            select 1 from shared.tenant_users
            where tenant_users.tenant_id = current_tenant_id()
            and tenant_users.user_id = auth.uid()
        )
    );

create policy "Projects can be inserted by tenant members"
    on tenant_template.projects for insert
    with check (
        exists (
            select 1 from shared.tenant_users
            where tenant_users.tenant_id = current_tenant_id()
            and tenant_users.user_id = auth.uid()
        )
    );

create policy "Projects can be updated by creators or admins"
    on tenant_template.projects for update
    using (
        exists (
            select 1 from shared.tenant_users
            where tenant_users.tenant_id = current_tenant_id()
            and tenant_users.user_id = auth.uid()
            and (
                tenant_users.role = 'admin'
                or auth.uid() = projects.created_by
            )
        )
    );

-- Functions

create or replace function current_tenant_id()
returns uuid
language sql stable
as $$
  select current_setting('app.tenant_id', true)::uuid;
$$;

create or replace function clone_tenant_schema(tenant_id uuid)
returns void
language plpgsql
as $$
declare
    table_name text;
begin
    -- Create schema for new tenant
    execute format('create schema if not exists tenant_%s', tenant_id);
    
    -- Clone template tables
    for table_name in 
        select tablename 
        from pg_tables 
        where schemaname = 'tenant_template'
    loop
        execute format(
            'create table tenant_%s.%s (like tenant_template.%s including all)',
            tenant_id, table_name, table_name
        );
        
        -- Copy RLS policies
        execute format(
            'alter table tenant_%s.%s enable row level security',
            tenant_id, table_name
        );
        
        -- Clone policies (this is a simplified version, in practice you'd need to handle all policy attributes)
        execute format(
            'create policy tenant_isolation on tenant_%s.%s for all
             using (current_tenant_id() = %L)',
            tenant_id, table_name, tenant_id
        );
    end loop;
end;
$$;