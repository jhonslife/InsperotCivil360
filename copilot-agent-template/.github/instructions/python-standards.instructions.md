---
applyTo: '**/*.py'
---

# Python Standards

## Core Rules

- Full type hints on ALL functions (PEP 484)
- PEP 8 compliance, enforced with black + ruff
- Google docstring format for all public functions
- Use `pathlib.Path` instead of `os.path`
- Pydantic v2 for all data models
- `async/await` for I/O operations

## Naming Conventions

```python
# Variables and functions: snake_case
user_name = "John"
def fetch_user_data() -> User: ...

# Classes: PascalCase
class UserProfile: ...
class AuthService: ...

# Constants: SCREAMING_SNAKE_CASE
MAX_RETRIES = 3
API_BASE_URL = "/api/v1"

# Private: leading underscore
_internal_cache = {}
def _validate_input(data: dict) -> bool: ...

# Files: snake_case
# user_profile.py, api_client.py
```

## Patterns

```python
# ✅ Full type hints
from typing import Optional, List
from pydantic import BaseModel

class UserCreate(BaseModel):
    """Schema for creating a new user."""
    email: str
    name: str
    role: Optional[str] = None

async def get_user(user_id: str) -> Optional[User]:
    """Fetch a user by ID.

    Args:
        user_id: The UUID of the user to fetch.

    Returns:
        The user if found, None otherwise.

    Raises:
        DatabaseError: If the query fails.
    """
    return await db.users.get(user_id)

# ✅ Error handling
from fastapi import HTTPException, status

async def create_user(data: UserCreate) -> User:
    existing = await get_user_by_email(data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    return await db.users.create(data)

# ✅ Path handling
from pathlib import Path

config_path = Path(__file__).parent / "config" / "settings.yaml"
if config_path.exists():
    config = yaml.safe_load(config_path.read_text())
```

## Anti-Patterns to Avoid

```python
# ❌ No type hints
def process(data):
    return data["name"]

# ❌ os.path instead of pathlib
import os
path = os.path.join("config", "settings.yaml")

# ❌ Bare except
try:
    result = await fetch()
except:
    pass

# ❌ Mutable default arguments
def add_item(item, items=[]):  # ❌
    items.append(item)

def add_item(item, items: list | None = None):  # ✅
    if items is None:
        items = []
    items.append(item)
```
