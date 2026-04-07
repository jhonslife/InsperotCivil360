# CLAUDE.md — {{PROJECT_NAME}} Project Context

> This file provides project context for Claude across all interfaces
> (Claude Code, Claude Desktop, VS Code Copilot, Cursor, Windsurf).
> See `.github/copilot-instructions.md` for full standards.

## Project

{{PROJECT_NAME}} — {{PROJECT_DESCRIPTION}}

## Architecture

```
src/                → Frontend application
backend/            → API server
docker/             → Docker Compose services
docs/               → Documentation
tests/              → Test suites
```

## Stack

- **Frontend**: React 18 + TypeScript + TailwindCSS + shadcn/ui + Zustand
- **Backend**: FastAPI + Pydantic v2 + SQLAlchemy + Alembic
- **Database**: PostgreSQL + Redis
- **Testing**: Vitest (TS), pytest (Python), Playwright (E2E)
- **Infrastructure**: Docker + GitHub Actions CI/CD

## Conventions

- Conventional Commits: `feat(scope): description`
- TypeScript: arrow functions, Zod validation, Repository pattern
- Python: PEP 484 type hints, black formatter, Google docstrings
- React: functional + hooks only, Zustand global state, TanStack Query

## Critical Rules

1. **NEVER remove imports without tracing** — verify source exists first
2. **ALWAYS implement missing functions** before removing references
3. Full type hints on all Python code
4. Input validation with Zod (TS) or Pydantic (Python)

## MCP Servers

github, context7, fetch, filesystem, git, memory, sequential-thinking, playwright

## Commands

```bash
# Frontend
cd src && pnpm dev                # Dev with hot reload
cd src && pnpm test               # Vitest
cd src && pnpm build              # Production build

# Backend
cd backend && make serve          # Run API locally
cd backend && make test           # Run pytest
cd backend && make lint           # Ruff + black

# Docker
docker compose -f docker/docker-compose.yml up -d
```
