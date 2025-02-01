-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pgjwt";

-- Create audit function
create or replace function audit_log_event() returns trigger as $$
declare
    audit_data jsonb;
begin
    audit_data = jsonb_build_object(
        'timestamp', current_timestamp,
        'action', TG_OP,
        'schema', TG_TABLE_SCHEMA,
        'table', TG_TABLE_NAME,
        'user_id', (nullif(current_setting('app.current_user_id', true), ''))::uuid,
        'tenant_id', (nullif(current_setting('app.current_tenant_id', true), ''))::uuid,
        'old_data', case when TG_OP = 'DELETE' then row_to_json(old)::jsonb else null end,
        'new_data', case when TG_OP != 'DELETE' then row_to_json(new)::jsonb else null end
    );
    
    insert into audit.logs (event_data) values (audit_data);
    return null;
end;
$$ language plpgsql security definer;

-- Create schemas
create schema if not exists audit;
create schema if not exists tenant_template;

-- Audit logs table
create table audit.logs (
    id uuid primary key default uuid_generate_v4(),
    event_data jsonb not null,
    created_at timestamp with time zone default now()
);

-- Create indexes on audit logs
create index idx_audit_logs_timestamp on audit.logs ((event_data->>'timestamp'));
create index idx_audit_logs_tenant_id on audit.logs ((event_data->>'tenant_id'));
create index idx_audit_logs_user_id on audit.logs ((event_data->>'user_id'));

-- Shared tables
create table public.tenants (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    slug text not null unique,
    features jsonb default '{}',
    settings jsonb default '{}',
    status text not null default 'active',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create table public.users (
    id uuid primary key default uuid_generate_v4(),
    email text not null unique,
    first_name text,
    last_name text,
    phone_number text,
    hashed_password text not null,
    mfa_enabled boolean default false,
    mfa_secret text,
    status text not null default 'active',
    password_changed_at timestamp with time zone default now(),
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create table public.tenant_users (
    tenant_id uuid references public.tenants(id) on delete cascade,
    user_id uuid references public.users(id) on delete cascade,
    created_at timestamp with time zone default now(),
    primary key (tenant_id, user_id)
);

create table public.roles (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid references public.tenants(id) on delete cascade,
    name text not null,
    description text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    unique (tenant_id, name)
);

create table public.permissions (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid references public.tenants(id) on delete cascade,
    name text not null,
    description text,
    created_at timestamp with time zone default now(),
    unique (tenant_id, name)
);

create table public.role_permissions (
    role_id uuid references public.roles(id) on delete cascade,
    permission_id uuid references public.permissions(id) on delete cascade,
    created_at timestamp with time zone default now(),
    primary key (role_id, permission_id)
);

create table public.user_roles (
    user_id uuid references public.users(id) on delete cascade,
    role_id uuid references public.roles(id) on delete cascade,
    tenant_id uuid references public.tenants(id) on delete cascade,
    created_at timestamp with time zone default now(),
    primary key (user_id, role_id)
);

-- Tenant template tables (cloned for each tenant)
create table tenant_template.documents (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    description text,
    version text not null,
    status text not null default 'draft',
    content jsonb not null default '{}',
    metadata jsonb default '{}',
    created_by uuid not null references public.users(id),
    updated_by uuid not null references public.users(id),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create table tenant_template.signatures (
    id uuid primary key default uuid_generate_v4(),
    document_id uuid references tenant_template.documents(id) on delete cascade,
    user_id uuid references public.users(id),
    signature_data text not null,
    signature_date timestamp with time zone default now(),
    reason text not null,
    metadata jsonb default '{}',
    created_at timestamp with time zone default now()
);

-- Create audit triggers for all tables
create or replace function create_audit_trigger(schema_name text, table_name text) returns void as $$
begin
    execute format('
        create trigger audit_trigger_row
        after insert or update or delete on %I.%I
        for each row execute procedure audit_log_event();
    ', schema_name, table_name);
end;
$$ language plpgsql;

-- Apply audit triggers
select create_audit_trigger('public', 'tenants');
select create_audit_trigger('public', 'users');
select create_audit_trigger('public', 'tenant_users');
select create_audit_trigger('public', 'roles');
select create_audit_trigger('public', 'permissions');
select create_audit_trigger('public', 'role_permissions');
select create_audit_trigger('public', 'user_roles');
select create_audit_trigger('tenant_template', 'documents');
select create_audit_trigger('tenant_template', 'signatures');

-- RLS Policies

-- Enable RLS on all tables
alter table public.tenants enable row level security;
alter table public.users enable row level security;
alter table public.tenant_users enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table tenant_template.documents enable row level security;
alter table tenant_template.signatures enable row level security;

-- Create policies
create policy "Users can view their own user data"
    on public.users for select
    using (id = auth.uid());

create policy "Users can update their own user data"
    on public.users for update
    using (id = auth.uid());

create policy "Users can view tenants they belong to"
    on public.tenants for select
    using (
        exists (
            select 1 
            from public.tenant_users 
            where tenant_users.tenant_id = tenants.id 
            and tenant_users.user_id = auth.uid()
        )
    );

create policy "Users can view their tenant memberships"
    on public.tenant_users for select
    using (user_id = auth.uid());

create policy "Users can view roles in their tenants"
    on public.roles for select
    using (
        exists (
            select 1 
            from public.tenant_users 
            where tenant_users.tenant_id = roles.tenant_id 
            and tenant_users.user_id = auth.uid()
        )
    );

-- Functions for tenant management
create or replace function create_tenant_schema(tenant_id uuid) returns void as $$
declare
    schema_name text := 'tenant_' || tenant_id::text;
    table_name text;
begin
    -- Create schema
    execute 'create schema if not exists ' || quote_ident(schema_name);
    
    -- Clone template tables
    for table_name in 
        select tablename 
        from pg_tables 
        where schemaname = 'tenant_template'
    loop
        execute format(
            'create table %I.%I (like tenant_template.%I including all)',
            schema_name,
            table_name,
            table_name
        );
        
        -- Add RLS policy
        execute format(
            'alter table %I.%I enable row level security',
            schema_name,
            table_name
        );
        
        -- Create tenant isolation policy
        execute format('
            create policy tenant_isolation_policy on %I.%I
            using (
                exists (
                    select 1 
                    from public.tenant_users 
                    where tenant_users.tenant_id = %L
                    and tenant_users.user_id = auth.uid()
                )
            )',
            schema_name,
            table_name,
            tenant_id
        );
        
        -- Create audit trigger
        execute format('
            create trigger audit_trigger_row
            after insert or update or delete on %I.%I
            for each row execute procedure audit_log_event();',
            schema_name,
            table_name
        );
    end loop;
end;
$$ language plpgsql;