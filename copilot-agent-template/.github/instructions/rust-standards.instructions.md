---
applyTo: '**/*.rs'
---

# Rust Standards

## Core Rules

- `Result<T, E>` with `thiserror` for error handling
- `tokio` for async runtime
- `serde` for serialization/deserialization
- `SQLx` with compile-time checked queries
- Zero-copy where possible
- Clippy clean (no warnings)

## Naming Conventions

```rust
// Variables and functions: snake_case
let user_name = "John";
fn fetch_user_data() -> Result<User, AppError> { ... }

// Types, traits, enums: PascalCase
struct UserProfile { ... }
trait Repository { ... }
enum UserRole { Admin, User }

// Constants: SCREAMING_SNAKE_CASE
const MAX_RETRIES: u32 = 3;

// Modules: snake_case
mod user_service;
mod auth_handler;
```

## Patterns

```rust
// ✅ Error handling with thiserror
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("User not found: {0}")]
    NotFound(String),
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("Unauthorized")]
    Unauthorized,
}

// ✅ Async handler
async fn get_user(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<User>, AppError> {
    let user = sqlx::query_as!(User, "SELECT * FROM users WHERE id = $1", id)
        .fetch_optional(&pool)
        .await?
        .ok_or(AppError::NotFound(id.to_string()))?;
    Ok(Json(user))
}

// ✅ Serde serialization
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserResponse {
    pub id: Uuid,
    pub user_name: String,
    pub created_at: DateTime<Utc>,
}
```

## Anti-Patterns to Avoid

```rust
// ❌ unwrap() in production code
let user = get_user(id).unwrap();

// ❌ String for errors
fn process() -> Result<(), String> { ... }

// ❌ Ignoring results
let _ = dangerous_operation(); // Only if intentional and commented

// ✅ Use ? operator for propagation
let user = get_user(id)?;
```
