# Next.js Multi-Tenant SaaS Starter with Supabase

A production-ready starter template for building multi-tenant SaaS applications using Next.js 14, Supabase, and Tailwind CSS. Features secure tenant isolation, real-time capabilities, and scalable architecture.

## Features

- ✨ Modern Stack: Next.js 14, Supabase, TypeScript, Tailwind CSS
- 🔐 Secure tenant isolation at database and application levels
- 🌍 Subdomain-based multi-tenancy
- ⚡️ Real-time updates with tenant-aware subscriptions
- 🎨 Beautiful UI with Tailwind and shadcn/ui components
- 🚀 Edge-ready with Next.js middleware
- 📱 Responsive and mobile-friendly
- 🔒 Row Level Security (RLS) policies for data protection
- 👥 Team collaboration features
- 📊 Dashboard analytics (coming soon)

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nextjs-supabase-multitenant.git
cd nextjs-supabase-multitenant
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up Supabase:
- Create a new project at [supabase.com](https://supabase.com)
- Copy your project URL and anon key
- Set up your database by running the migrations:
  ```bash
  pnpm supabase migration up
  ```

4. Configure environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your Supabase credentials and other settings.

5. Start the development server:
```bash
pnpm dev
```

## Project Structure

```
├── src/
│   ├── app/                    # Next.js 14 app directory
│   │   ├── _sites/            # Tenant-specific routes
│   │   ├── api/               # API routes
│   │   └── auth/              # Authentication pages
│   ├── components/            # React components
│   │   ├── projects/         # Project-related components
│   │   └── providers/        # Context providers
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   ├── styles/               # Global styles
│   └── types/                # TypeScript type definitions
├── supabase/
│   └── migrations/           # Database migrations
├── public/                   # Static assets
└── docs/                     # Documentation
```

## Key Features Explained

### Tenant Isolation

We use a combination of techniques to ensure complete tenant isolation:

1. **Database Level**:
   - Separate schema per tenant
   - Row Level Security (RLS) policies
   - Tenant context in JWT claims

2. **Application Level**:
   - Middleware for tenant resolution
   - Context providers for tenant state
   - Automatic tenant injection in queries

### Real-time Features

Tenant-aware real-time subscriptions are implemented using Supabase's real-time features:

```typescript
const subscription = supabase
  .channel('table_db_changes')
  .on(
    'postgres_changes',
    { event: '*', schema: `tenant_${tenantId}` },
    (payload) => {
      // Handle changes
    }
  )
  .subscribe()
```

### Authentication Flow

1. User signs up/logs in through Supabase Auth
2. System checks tenant membership
3. Middleware validates tenant access
4. RLS policies enforce data access

## Development

### Database Migrations

Create a new migration:
```bash
pnpm db:migration:new your_migration_name
```

Apply migrations:
```bash
pnpm db:migrate
```

### Adding New Features

1. Create feature branch:
```bash
git checkout -b feature/your-feature
```

2. Implement changes following our architectural patterns
3. Add tests
4. Submit PR

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Configure custom domains for your tenants

### Custom Domain Setup

1. Add wildcard DNS record:
```
*.yourdomain.com -> CNAME to your-vercel-project.vercel.app
```

2. Configure domains in Vercel
3. Update `NEXT_PUBLIC_ROOT_DOMAIN` in your environment variables

## Contributing

Please read our [Contributing Guide](CONTRIBUTING.md) before submitting PRs.

## License

MIT

## Support

- [Documentation](docs/ARCHITECTURE.md)
- [Issue Tracker](https://github.com/yourusername/nextjs-supabase-multitenant/issues)
- [Discussions](https://github.com/yourusername/nextjs-supabase-multitenant/discussions)