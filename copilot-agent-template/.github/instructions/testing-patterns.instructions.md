---
applyTo: '**/*.test.*,**/*.spec.*,**/test_*.py,**/tests/**'
---

# Testing Patterns

## Core Rules

- Arrange-Act-Assert (AAA) pattern for all tests
- Descriptive test names: `describe('X') → it('should Y when Z')`
- Mocks only when necessary (prefer real implementations)
- Each test tests ONE thing
- Tests are independent (no shared mutable state)
- Minimum 80% coverage target

## TypeScript (Vitest)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  describe('getUser', () => {
    it('should return user when found', async () => {
      // Arrange
      const mockUser = { id: '1', name: 'John', email: 'john@test.com' };
      vi.spyOn(db, 'findUser').mockResolvedValue(mockUser);

      // Act
      const result = await service.getUser('1');

      // Assert
      expect(result).toEqual(mockUser);
      expect(db.findUser).toHaveBeenCalledWith('1');
    });

    it('should throw NotFound when user does not exist', async () => {
      // Arrange
      vi.spyOn(db, 'findUser').mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUser('999')).rejects.toThrow(NotFoundError);
    });
  });
});
```

## Python (pytest)

```python
import pytest
from unittest.mock import AsyncMock, patch

class TestUserService:
    """Tests for the UserService class."""

    @pytest.fixture
    def service(self) -> UserService:
        """Create a UserService instance for testing."""
        return UserService()

    @pytest.fixture
    def mock_user(self) -> dict:
        """Sample user data for testing."""
        return {"id": "1", "name": "John", "email": "john@test.com"}

    async def test_get_user_returns_user_when_found(
        self, service: UserService, mock_user: dict
    ) -> None:
        """Should return user data when the user exists."""
        # Arrange
        with patch.object(service.repo, "find", new_callable=AsyncMock) as mock_find:
            mock_find.return_value = mock_user

            # Act
            result = await service.get_user("1")

            # Assert
            assert result == mock_user
            mock_find.assert_called_once_with("1")

    async def test_get_user_raises_not_found(self, service: UserService) -> None:
        """Should raise NotFoundError when user does not exist."""
        # Arrange
        with patch.object(service.repo, "find", new_callable=AsyncMock) as mock_find:
            mock_find.return_value = None

            # Act & Assert
            with pytest.raises(NotFoundError):
                await service.get_user("999")
```

## E2E (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should login with valid credentials', async ({ page }) => {
    // Arrange
    await page.goto('/login');

    // Act
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Assert
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Welcome')).toBeVisible();
  });
});
```
