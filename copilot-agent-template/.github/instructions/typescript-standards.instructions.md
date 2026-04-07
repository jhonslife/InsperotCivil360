---
applyTo: '**/*.ts,**/*.tsx'
---

# TypeScript Standards

## Core Rules

- Use `const` by default, `let` only when mutation is needed
- Explicit return types on exported functions
- Use `interface` for object shapes, `type` for unions/intersections
- Arrow functions for callbacks and React components
- No `any` type — use `unknown` if type is truly unknown
- Prefer `async/await` over raw Promises

## Naming Conventions

```typescript
// Variables and functions: camelCase
const userName = 'John';
const fetchUserData = async () => {};

// Types and interfaces: PascalCase
interface UserProfile {}
type ApiResponse<T> = {};

// Constants: SCREAMING_SNAKE_CASE
const MAX_RETRIES = 3;
const API_BASE_URL = '/api/v1';

// Enums: PascalCase with PascalCase members
enum UserRole {
  Admin = 'ADMIN',
  User = 'USER',
}

// Files: kebab-case
// user-profile.ts, api-client.ts
```

## Patterns

```typescript
// ✅ Explicit types
const getUser = async (id: string): Promise<User> => {
  const response = await api.get<User>(`/users/${id}`);
  return response.data;
};

// ✅ Zod validation for external data
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

type User = z.infer<typeof UserSchema>;

// ✅ Error handling
try {
  const user = await getUser(id);
} catch (error) {
  if (error instanceof ApiError) {
    handleApiError(error);
  }
  throw error;
}

// ✅ Null safety
const userName = user?.profile?.name ?? 'Anonymous';
```

## Anti-Patterns to Avoid

```typescript
// ❌ any type
const data: any = fetchData();

// ❌ Non-null assertion without check
const name = user!.name;

// ❌ Implicit any in callbacks
items.map((item) => item.name); // OK if type is inferred
items.map((item: any) => item.name); // ❌

// ❌ String concatenation for paths
const url = baseUrl + '/users/' + id; // ❌
const url = `${baseUrl}/users/${id}`; // ✅
```
