---
mode: "agent"
description: "Perform a security audit on the codebase or specific module"
---

# Security Audit

Perform a comprehensive security audit.

## Checklist

### Authentication & Authorization
- [ ] Password hashing (bcrypt/argon2)
- [ ] JWT validation and expiry
- [ ] Role-based access control
- [ ] Session management

### Input Validation
- [ ] All inputs validated (Zod/Pydantic)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output sanitization)
- [ ] CSRF protection

### Data Protection
- [ ] Secrets in env vars (not code)
- [ ] Sensitive data encrypted at rest
- [ ] HTTPS enforced
- [ ] PII handling compliance

### Dependencies
- [ ] No known vulnerabilities (npm audit / pip-audit)
- [ ] Dependencies up to date
- [ ] Lockfiles committed

### Infrastructure
- [ ] Rate limiting on public APIs
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Error messages don't leak internals

## Target

{{TARGET_MODULE}}
