# Compliant Multi-Tenant Application Implementation Guide (v2)

## Pre-Implementation Review

Before starting, familiarize yourself with:
1. `/docs/COMPLIANCE_ANALYSIS.md` - Understanding compliance requirements
2. `/docs/CURSOR_AI_GUIDE.md` - How to use Cursor AI effectively
3. `/docs/REAL_WORLD_CONSIDERATIONS.md` - Practical implementation challenges

## Prerequisites

1. Install required tools:
   ```bash
   # Install Node.js 18+ and pnpm
   pnpm install -g pnpm
   ```

2. Create Supabase account and project:
   - Visit supabase.com
   - Create new project
   - Save database password
   - Note project URL and anon key

## Step 1: Database Setup

### 1.1 Initial Schema
1. Navigate to Supabase SQL Editor
2. Copy the entire content of `/docs/schema/0000_initial_schema.sql`
3. Execute the SQL script
4. Verify all schemas and tables are created

### 1.2 RLS Policies
1. Open Supabase SQL Editor
2. Copy the content of `/docs/schema/RLS_POLICIES.sql`
3. Execute the SQL script
4. Verify policies using:
   ```sql
   select * from pg_policies;
   ```

### 1.3 Validation
Use Cursor AI to generate validation queries:
```
"Help me create SQL queries to verify:
1. All tables are created
2. RLS policies are applied
3. Audit logging is working
4. Default roles and permissions exist"
```

## Step 2: Project Setup

Use Cursor AI for project initialization:
```
"Help me create a new Next.js 14 project with:
1. TypeScript
2. Tailwind CSS
3. Supabase auth helpers
4. Required compliance features from /docs/COMPLIANCE_ANALYSIS.md"
```

## Step 3: Authentication Implementation

### 3.1 Core Auth Components
Create these components following compliance requirements:
1. SignIn (`src/components/auth/SignIn.tsx`)
2. SignUp (`src/components/auth/SignUp.tsx`)
3. MFA Setup (`src/components/auth/MFASetup.tsx`)
4. Password Reset (`src/components/auth/PasswordReset.tsx`)

Use Cursor AI:
```
"Create a compliant SignIn component that:
1. Implements MFA
2. Includes audit logging
3. Follows 21 CFR Part 11 requirements
4. Uses our existing database schema"
```

### 3.2 Middleware Setup
1. Create `src/middleware.ts` for:
   - Tenant resolution
   - Authentication checks
   - Audit logging
   - Compliance validation

## Step 4: Tenant Management

### 4.1 Tenant Components
Create core tenant management components:
1. TenantCreation
2. TenantSettings
3. UserInvitation
4. RoleAssignment

Use Cursor AI:
```
"Create a TenantCreation component that:
1. Uses our schema from /docs/schema/0000_initial_schema.sql
2. Implements audit logging
3. Follows compliance requirements
4. Handles validation"
```

### 4.2 Tenant Isolation
Implement isolation following our schema design:
1. Schema-per-tenant logic
2. RLS enforcement
3. Tenant context management

## Step 5: Role-Based Access Control

### 5.1 Role Management
Create RBAC components using our schema:
1. RoleManagement
2. PermissionAssignment
3. UserRoleAssignment

### 5.2 Permission Implementation
Implement permission checking:
1. Create permission hooks
2. Implement middleware checks
3. Add validation tests

## Step 6: Validation and Testing

### 6.1 Test Implementation
Follow `/docs/testing/VALIDATION_SUITE.md`:
1. Installation Qualification (IQ)
2. Operational Qualification (OQ)
3. Performance Qualification (PQ)

Use Cursor AI:
```
"Help me implement the IQ tests from our validation suite,
focusing on database and schema validation"
```

### 6.2 Compliance Validation
Implement compliance tests for:
1. 21 CFR Part 11
2. ISO 13485
3. Audit requirements

## Step 7: Documentation

### 7.1 Required Documentation
Create validation documentation:
1. System Description
2. Validation Plan
3. Risk Assessment
4. Test Results

### 7.2 User Documentation
Create guides for:
1. System Administration
2. Tenant Management
3. User Management
4. Compliance Procedures

## Step 8: Deployment

### 8.1 Environment Setup
Configure environments:
1. Development
2. Validation
3. Production

### 8.2 Deployment Validation
Follow validation suite for:
1. Installation verification
2. Configuration validation
3. Performance testing

## Common Issues and Solutions

### Database Issues
1. RLS Policy Problems
   ```sql
   -- Verify policy application
   select * from pg_policies;
   ```

2. Schema Creation Issues
   ```sql
   -- Check schema existence
   select * from information_schema.schemata;
   ```

### Authentication Issues
1. MFA Configuration
2. Session Management
3. Audit Logging

### Performance Issues
1. Query Optimization
2. Caching Strategy
3. Resource Management

## Maintenance Procedures

### Regular Tasks
1. Audit log review
2. Performance monitoring
3. Security updates
4. Compliance validation

### Periodic Reviews
1. Code review
2. Security assessment
3. Compliance audit
4. Performance review

## Next Steps

After implementation:
1. Conduct full validation
2. Document all testing
3. Prepare for audit
4. Plan maintenance

Remember to:
- Follow compliance requirements
- Document all changes
- Maintain audit trails
- Validate each step