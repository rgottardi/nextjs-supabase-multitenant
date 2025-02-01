# Getting Started: Multi-Tenant Application Setup

This guide walks through creating a compliant multi-tenant application from scratch.

## Initial Setup

### 1. Development Environment

1. **Required Software**
   ```bash
   # Install Node.js LTS (if not installed)
   Visit: https://nodejs.org

   # Install pnpm (if not installed)
   npm install -g pnpm

   # Install Cursor AI IDE
   Visit: https://cursor.sh
   ```

2. **Create Project Directory**
   ```bash
   # Create project directory
   mkdir my-tenant-app
   cd my-tenant-app
   ```

### 2. Next.js Project Creation

Open Cursor AI and use this prompt:
```
"Help me create a new Next.js 14 project with TypeScript and Tailwind CSS. Include:
- App Router
- Prettier
- ESLint
Include a proper .gitignore file for Next.js projects."
```

After the files are created, install dependencies:
```bash
pnpm install
```

### 3. Supabase Setup

1. **Create Supabase Account**
   - Visit [supabase.com](https://supabase.com)
   - Sign up for an account
   - Create a new organization (if needed)

2. **Create New Project**
   - Click "New Project"
   - Choose organization
   - Set project name
   - Set database password (save this!)
   - Choose region closest to you
   - Wait for project creation

3. **Save Credentials**
   Create `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### 4. Install Required Packages

Use Cursor AI:
```
"Help me add the following packages to my Next.js project:
- @supabase/auth-helpers-nextjs
- @supabase/supabase-js
- @supabase/ssr
- @tanstack/react-query
- zod
Also, set up shadcn/ui with the following components:
- Button
- Card
- Form
- Input
- Alert"
```

## Project Configuration

### 1. Type Generation Setup

1. Create `supabase/types.ts` for database types:
```
"Help me set up Supabase type generation with:
- Type-safe database definitions
- Auth types
- Helper types for RLS policies"
```

2. Add type generation script to `package.json`:
```
"Help me add scripts for:
- Supabase type generation
- Database migration
- Local development"
```

### 2. Database Schema Setup

1. **Create Initial Schema**
   - Open Supabase dashboard
   - Go to SQL Editor
   - Copy content from `/docs/schema/0000_initial_schema.sql`
   - Run the script
   - Verify tables are created

2. **Apply Security Policies**
   - Copy content from `/docs/schema/RLS_POLICIES.sql`
   - Run the script
   - Verify policies using provided queries

3. **Verify Setup**
```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema IN ('public', 'audit');

-- Check policies
SELECT * FROM pg_policies;
```

## Initial Application Structure

### 1. Project Organization

Use Cursor AI:
```
"Help me create a Next.js project structure with:
1. App Router setup
2. Components directory
3. Lib utilities
4. Hooks directory
5. Types directory"
```

### 2. Base Components

Create foundational components:

1. **Layout Structure**
```
"Create a root layout.tsx that:
- Includes Supabase provider
- Sets up authentication
- Handles theming
- Manages tenant context"
```

2. **Auth Components**
```
"Create authentication components for:
- Sign in
- Sign up
- Password reset
- MFA setup
Follow 21 CFR Part 11 requirements."
```

### 3. Basic Routes

Set up initial routes:
```
"Help me create Next.js routes for:
- Public landing page (/)
- Authentication pages (/auth/*)
- Dashboard (/dashboard)
- Tenant management (/admin)
Include proper middleware protection."
```

## Core Features Implementation

### 1. Authentication Setup

1. **Middleware**
```
"Create a Next.js middleware that:
- Handles authentication
- Manages tenant resolution
- Implements audit logging
Following our compliance requirements."
```

2. **Auth Hooks**
```
"Create React hooks for:
- User authentication
- Session management
- Tenant context
With proper TypeScript types."
```

### 2. Tenant Management

1. **Basic Tenant Setup**
```
"Create components for:
- Tenant creation
- Tenant settings
- User invitation
Using our database schema."
```

2. **Tenant Isolation**
```
"Help implement tenant isolation using:
- Schema-based separation
- RLS policies
- Tenant context"
```

### 3. User Management

1. **User Components**
```
"Create user management components for:
- User profile
- Role assignment
- Permission management
Following RBAC principles."
```

2. **Access Control**
```
"Implement access control with:
- Permission checking
- Role validation
- Audit logging"
```

## Testing Setup

### 1. Test Environment

```
"Help me set up a testing environment with:
- Jest configuration
- React Testing Library
- Supabase test helpers
Following our validation requirements."
```

### 2. Initial Tests

Create basic test suite:
```
"Create tests for:
- Authentication flow
- Tenant isolation
- RBAC functionality
Based on our validation suite."
```

## Next Steps

After basic setup:
1. Review compliance requirements
2. Implement advanced features
3. Set up CI/CD
4. Plan deployment strategy

## Common Issues

### Installation Problems
- Node.js version conflicts
- Package dependency issues
- TypeScript configuration

### Database Issues
- RLS policy conflicts
- Schema migration errors
- Type generation problems

### Authentication Issues
- Session management
- MFA configuration
- Token handling

Would you like to proceed with implementing any specific section or need clarification on any part?