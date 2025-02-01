# Compliant Multi-Tenant Application Implementation Guide

This guide walks through creating a compliant multi-tenant application using Next.js 14 and Supabase, with a focus on using Cursor AI IDE for development.

## Prerequisites

1. Install required tools:
   ```bash
   # Install Node.js 18+ and pnpm
   pnpm install -g pnpm

   # Install Cursor AI IDE
   # Download from cursor.sh
   ```

2. Create Supabase account and project:
   - Visit supabase.com
   - Create new project
   - Save database password
   - Note project URL and anon key

## Project Setup

Use Cursor AI to help create the project. Open Cursor and press `Cmd/Ctrl + L` to open chat:

```
"Help me create a new Next.js 14 project with TypeScript, Tailwind CSS, and 
the following packages:
- @supabase/auth-helpers-nextjs
- @supabase/supabase-js
- @supabase/ssr
- zod (for validation)
- @tanstack/react-query
- shadcn/ui components"
```

### Project Structure

```
src/
├── app/                      # Next.js app router
│   ├── (auth)/              # Authentication routes
│   ├── (dashboard)/         # Protected dashboard routes
│   ├── api/                 # API routes
│   └── layout.tsx           # Root layout
├── components/              # React components
├── lib/                     # Utility functions
├── hooks/                   # Custom hooks
├── types/                   # TypeScript types
└── styles/                  # Global styles
```

## Step 1: Database Setup

1. Create initial migration using our compliance-ready schema:
   ```sql
   # Copy content from /docs/schema/0000_initial_schema.sql
   # Run in Supabase SQL editor
   ```

2. Configure RLS policies (use Cursor AI):
   ```
   "Help me create Row Level Security policies for the following tables:
   - tenants
   - users
   - tenant_users
   - roles
   - permissions
   Following 21 CFR Part 11 compliance requirements for audit trails and access control."
   ```

## Step 2: Authentication Setup

1. Create authentication components (use Cursor AI):
   ```
   "Create authentication components including:
   - SignIn
   - SignUp
   - ForgotPassword
   - ResetPassword
   Using Supabase auth and following compliance requirements for:
   - Password complexity
   - Multi-factor authentication
   - Session management
   - Audit logging"
   ```

2. Implement middleware (use Cursor AI):
   ```
   "Help me create a Next.js middleware that:
   - Handles tenant resolution from subdomain
   - Validates user authentication
   - Checks tenant access permissions
   - Implements audit logging
   - Follows compliance requirements"
   ```

## Step 3: Tenant Management

1. Create tenant management components:
   ```
   "Create React components for:
   - Tenant creation
   - Tenant settings
   - User invitation
   - Role assignment
   Include proper validation and error handling."
   ```

2. Implement tenant isolation:
   ```
   "Help me implement tenant isolation using:
   - Schema-based isolation
   - RLS policies
   - Tenant context providers
   Following compliance requirements."
   ```

## Step 4: User Management

1. Create user management components:
   ```
   "Create components for:
   - User profile
   - User settings
   - Password management
   - MFA setup
   Following compliance requirements for medical software."
   ```

2. Implement audit logging:
   ```
   "Help me implement comprehensive audit logging for:
   - User actions
   - System events
   - Data changes
   Following 21 CFR Part 11 requirements."
   ```

## Step 5: Role-Based Access Control

1. Create RBAC components:
   ```
   "Create components for:
   - Role management
   - Permission assignment
   - Access control lists
   Following ISO 13485 requirements."
   ```

2. Implement permission checks:
   ```
   "Help me implement permission checking:
   - Custom hooks
   - HOCs
   - API middleware
   With proper audit logging."
   ```

## Step 6: Compliance Features

1. Implement electronic signatures:
   ```
   "Create components and utilities for:
   - Electronic signatures
   - Digital certificates
   - Signature verification
   Following 21 CFR Part 11."
   ```

2. Create audit trail viewer:
   ```
   "Create components for:
   - Audit log viewing
   - Event filtering
   - Export capabilities
   Following compliance requirements."
   ```

## Using Cursor AI Effectively

### For Code Generation

1. **Be Specific About Compliance**
   ```
   "Create a user profile form component that:
   - Implements proper validation
   - Includes audit logging
   - Handles electronic signatures
   - Follows 21 CFR Part 11 requirements"
   ```

2. **Include Context**
   ```
   "Given our multi-tenant architecture and compliance requirements,
   help me implement a data access layer that:
   - Enforces tenant isolation
   - Implements audit logging
   - Handles error tracking
   - Follows ISO 13485 requirements"
   ```

### For Problem Solving

1. **Provide Full Context**
   ```
   "I'm implementing tenant isolation and getting this error:
   [error message]
   Current code:
   [code snippet]
   Requirements:
   - Must maintain compliance
   - Must handle audit logging
   - Must enforce access control"
   ```

2. **Ask for Explanations**
   ```
   "Can you explain how this tenant isolation code works,
   particularly focusing on:
   - Security implications
   - Compliance considerations
   - Performance impact
   - Potential vulnerabilities"
   ```

## Testing and Validation

1. Create test suite:
   ```
   "Help me create a comprehensive test suite that:
   - Tests tenant isolation
   - Validates compliance features
   - Checks security measures
   - Verifies audit logging
   Using Jest and Testing Library."
   ```

2. Implement validation protocol:
   ```
   "Create validation documentation and tests for:
   - Installation qualification
   - Operational qualification
   - Performance qualification
   Following medical device software requirements."
   ```

## Deployment Considerations

1. **Environment Setup**
   - Development environment with validation
   - Staging environment for testing
   - Production environment with compliance

2. **Monitoring Setup**
   - Application monitoring
   - Audit log monitoring
   - Compliance monitoring
   - Performance monitoring

## Next Steps

1. **Documentation**
   - User documentation
   - Technical documentation
   - Compliance documentation
   - Validation documentation

2. **Training**
   - Developer training
   - User training
   - Compliance training
   - Support training

## Common Issues and Solutions

1. **Tenant Isolation**
   - Issue: Data leakage between tenants
   - Solution: Implement proper RLS and schema isolation

2. **Performance**
   - Issue: Slow queries with audit logging
   - Solution: Optimize indexes and query patterns

3. **Compliance**
   - Issue: Missing audit trails
   - Solution: Implement comprehensive logging

## Maintenance

1. **Regular Tasks**
   - Audit log review
   - Performance monitoring
   - Security updates
   - Compliance checks

2. **Periodic Reviews**
   - Code review
   - Security review
   - Compliance review
   - Performance review

Remember to regularly refer to the compliance documentation in `/docs/COMPLIANCE_ANALYSIS.md` and follow the Cursor AI best practices in `/docs/CURSOR_AI_GUIDE.md` throughout development.