---
applyTo: '**/*.tsx'
---

# React Component Patterns

## Core Rules

- Functional components with arrow functions only
- Props interface defined and exported
- Hooks at the top of the component
- Early returns for loading/error states
- TailwindCSS for styling, cn() for conditionals
- shadcn/ui for base components

## Component Template

```tsx
import { type FC } from 'react';
import { cn } from '@/lib/utils';

interface UserCardProps {
  user: User;
  className?: string;
  onSelect?: (user: User) => void;
}

export const UserCard: FC<UserCardProps> = ({ user, className, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!user) return null;

  return (
    <div className={cn('rounded-lg border p-4', className)}>
      <h3 className="text-lg font-semibold">{user.name}</h3>
      <p className="text-sm text-muted-foreground">{user.email}</p>
      {onSelect && (
        <Button onClick={() => onSelect(user)} variant="outline" size="sm">
          Select
        </Button>
      )}
    </div>
  );
};
```

## State Management

```tsx
// ✅ Zustand for global state
import { create } from 'zustand';

interface AuthStore {
  user: User | null;
  token: string | null;
  login: (credentials: LoginData) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  login: async (credentials) => {
    const { user, token } = await authService.login(credentials);
    set({ user, token });
  },
  logout: () => set({ user: null, token: null }),
}));

// ✅ TanStack Query for server state
import { useQuery, useMutation } from '@tanstack/react-query';

export const useUsers = () =>
  useQuery({
    queryKey: ['users'],
    queryFn: () => userService.list(),
  });
```

## Forms

```tsx
// ✅ react-hook-form + Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(1, 'Name is required').max(100),
});

type FormData = z.infer<typeof schema>;

export const UserForm: FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await createUser(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('name')} error={errors.name?.message} />
      <Input {...register('email')} error={errors.email?.message} />
      <Button type="submit">Create</Button>
    </form>
  );
};
```
