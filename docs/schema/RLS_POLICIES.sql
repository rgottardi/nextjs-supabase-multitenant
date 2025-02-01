-- Row Level Security Policies for Compliance
-- Following 21 CFR Part 11 and ISO requirements

-- Helper function to check if user has permission
create or replace function has_permission(
    required_permission text,
    check_tenant_id uuid default null
)
returns boolean as $$
declare
    user_has_permission boolean;
begin
    -- If no tenant_id provided, check across all user's tenants
    if check_tenant_id is null then
        select exists (
            select 1
            from public.user_roles ur
            join public.role_permissions rp on ur.role_id = rp.role_id
            join public.permissions p on rp.permission_id = p.id
            where ur.user_id = auth.uid()
            and p.name = required_permission
        ) into user_has_permission;
    else
        -- Check for specific tenant
        select exists (
            select 1
            from public.user_roles ur
            join public.role_permissions rp on ur.role_id = rp.role_id
            join public.permissions p on rp.permission_id = p.id
            where ur.user_id = auth.uid()
            and ur.tenant_id = check_tenant_id
            and p.name = required_permission
        ) into user_has_permission;
    end if;

    return user_has_permission;
end;
$$ language plpgsql security definer;

-- Tenants Table Policies
create policy "Tenant admins can create tenants"
    on public.tenants
    for insert
    with check (has_permission('create:tenants'));

create policy "Users can view their tenants"
    on public.tenants
    for select
    using (
        exists (
            select 1 
            from public.tenant_users 
            where tenant_users.tenant_id = id 
            and tenant_users.user_id = auth.uid()
        )
    );

create policy "Tenant admins can update their tenants"
    on public.tenants
    for update
    using (
        has_permission('update:tenants', id)
    );

-- Users Table Policies
create policy "Users can view themselves"
    on public.users
    for select
    using (id = auth.uid());

create policy "Users can view members of their tenants"
    on public.users
    for select
    using (
        exists (
            select 1 
            from public.tenant_users tu1
            where tu1.user_id = public.users.id
            and exists (
                select 1 
                from public.tenant_users tu2
                where tu2.tenant_id = tu1.tenant_id
                and tu2.user_id = auth.uid()
            )
        )
    );

create policy "Users can update their own profile"
    on public.users
    for update
    using (id = auth.uid())
    with check (id = auth.uid());

-- Tenant Users Table Policies
create policy "Tenant admins can manage members"
    on public.tenant_users
    for all
    using (
        has_permission('manage:members', tenant_id)
    );

create policy "Users can view tenant memberships"
    on public.tenant_users
    for select
    using (
        exists (
            select 1 
            from public.tenant_users tu
            where tu.tenant_id = tenant_users.tenant_id
            and tu.user_id = auth.uid()
        )
    );

-- Roles Table Policies
create policy "Tenant admins can manage roles"
    on public.roles
    for all
    using (
        has_permission('manage:roles', tenant_id)
    );

create policy "Users can view roles in their tenants"
    on public.roles
    for select
    using (
        exists (
            select 1 
            from public.tenant_users
            where tenant_users.tenant_id = roles.tenant_id
            and tenant_users.user_id = auth.uid()
        )
    );

-- Permissions Table Policies
create policy "Tenant admins can manage permissions"
    on public.permissions
    for all
    using (
        has_permission('manage:permissions', tenant_id)
    );

create policy "Users can view permissions in their tenants"
    on public.permissions
    for select
    using (
        exists (
            select 1 
            from public.tenant_users
            where tenant_users.tenant_id = permissions.tenant_id
            and tenant_users.user_id = auth.uid()
        )
    );

-- Role Permissions Table Policies
create policy "Tenant admins can manage role permissions"
    on public.role_permissions
    for all
    using (
        exists (
            select 1
            from public.roles r
            where r.id = role_id
            and has_permission('manage:roles', r.tenant_id)
        )
    );

create policy "Users can view role permissions in their tenants"
    on public.role_permissions
    for select
    using (
        exists (
            select 1
            from public.roles r
            join public.tenant_users tu on r.tenant_id = tu.tenant_id
            where r.id = role_id
            and tu.user_id = auth.uid()
        )
    );

-- User Roles Table Policies
create policy "Tenant admins can manage user roles"
    on public.user_roles
    for all
    using (
        has_permission('manage:roles', tenant_id)
    );

create policy "Users can view user roles in their tenants"
    on public.user_roles
    for select
    using (
        exists (
            select 1
            from public.tenant_users
            where tenant_users.tenant_id = user_roles.tenant_id
            and tenant_users.user_id = auth.uid()
        )
    );

-- Create default permissions
insert into public.permissions (name, description) values
    ('create:tenants', 'Can create new tenants'),
    ('update:tenants', 'Can update tenant settings'),
    ('manage:members', 'Can manage tenant members'),
    ('manage:roles', 'Can manage tenant roles'),
    ('manage:permissions', 'Can manage tenant permissions'),
    ('view:audit_logs', 'Can view audit logs'),
    ('export:data', 'Can export tenant data');

-- Create default roles
insert into public.roles (name, description) values
    ('tenant_admin', 'Full access to tenant resources'),
    ('tenant_user', 'Basic tenant user access');

-- Assign default permissions to roles
insert into public.role_permissions (role_id, permission_id)
select 
    r.id as role_id,
    p.id as permission_id
from 
    public.roles r,
    public.permissions p
where 
    r.name = 'tenant_admin';

-- Assign limited permissions to tenant_user role
insert into public.role_permissions (role_id, permission_id)
select 
    r.id,
    p.id
from 
    public.roles r,
    public.permissions p
where 
    r.name = 'tenant_user'
    and p.name in ('view:audit_logs');