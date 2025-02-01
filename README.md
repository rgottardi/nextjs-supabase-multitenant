# Next.js Multi-Tenant Architecture with Supabase

This repository provides a production-ready template and comprehensive guide for building multi-tenant applications using Next.js and Supabase. It implements secure tenant isolation, efficient database management, and scalable authentication patterns.

## Core Features

- Row Level Security (RLS) for tenant data isolation
- Custom middleware for tenant resolution
- Optimized database schema design for multi-tenancy
- Type-safe database operations with generated types
- Real-time subscriptions with tenant isolation
- Automatic tenant routing and subdomain handling
- Role-based access control (RBAC) within tenants

## Architecture Overview

### Tenant Isolation Strategies

We implement a hybrid approach to tenant isolation:

1. **Database Level**: Using Supabase RLS policies and schema isolation
2. **Application Level**: Middleware-based tenant context resolution
3. **API Level**: Automatic tenant context injection in API routes

### Database Schema

The database follows a schema-per-tenant approach with shared tables:

```sql
-- Shared schemas
create schema shared;

-- Tenant-specific schema template
create schema tenant_template;

-- Core tables
create table shared.tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table shared.users (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table shared.tenant_users (
  tenant_id uuid references shared.tenants(id) on delete cascade,
  user_id uuid references shared.users(id) on delete cascade,
  role text not null,
  created_at timestamp with time zone default now(),
  primary key (tenant_id, user_id)
);
```

## Getting Started

1. Clone this repository
2. Install dependencies: `pnpm install`
3. Copy `.env.example` to `.env.local` and fill in your Supabase credentials
4. Run database migrations: `pnpm db:migrate`
5. Start the development server: `pnpm dev`

## Development Workflow

### Database Migrations

We use `supabase-cli` for database migrations:

```bash
# Create a new migration
pnpm db:migration:new

# Run migrations
pnpm db:migrate

# Generate types
pnpm db:types
```

### Adding New Features

1. Create feature branch: `git checkout -b feature/your-feature`
2. Implement changes following our architectural patterns
3. Add tests for new functionality
4. Submit PR for review

## Security Best Practices

- All database access is controlled through RLS policies
- JWT tokens include tenant context for additional security
- Regular security audits and updates
- Comprehensive input validation and sanitization
- Rate limiting and abuse prevention

## Performance Optimization

- Efficient database indexing strategies
- Caching with Redis (optional)
- Edge function deployment for global scalability
- Optimized real-time subscriptions

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT