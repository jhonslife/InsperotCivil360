# {{PROJECT_NAME}} — Agent Ecosystem v1.0

> Neural Chain Architecture — 12 agents, 4-tier design

## Architecture Overview

```
User Request
     │
     ▼
┌─────────────────────────────────────────────────┐
│           TIER 1 — ORCHESTRATORS                │
│   NeuralChain │ Guardian │ Planejador           │
└───────┬──────────────┬──────────────┬───────────┘
        │              │              │
        ▼              ▼              ▼
┌──────────────┐                ┌──────────────────┐
│   TIER 2     │                │     TIER 3       │
│   Domain     │                │     Workers      │
│  Specialists │                │  (subagent-only) │
├──────────────┤                ├──────────────────┤
│ Frontend     │                │ Analyzer (R/O)   │
│ Backend      │                │ Implementer (R/W)│
│ Database     │                │ Reviewer (R/O)   │
│ DevOps       │                │                  │
│ Security     │                │                  │
│ QA           │                │                  │
└──────────────┘                └──────────────────┘
```

## Agent Registry

### Tier 1 — Orchestrators

| Agent          | Purpose                              | Invocation       |
| -------------- | ------------------------------------ | ----------------- |
| **NeuralChain**| 5-phase coordinated execution        | `@NeuralChain`    |
| **Guardian**   | Quality flywheel (O-D-P-E-V-L)      | `@Guardian`       |
| **Planejador** | Architecture planning & task decomposition | `@Planejador` |

### Tier 2 — Domain Specialists

| Agent        | Domain                        | Pattern                  |
| ------------ | ----------------------------- | ------------------------ |
| **Frontend** | React + TS + Tailwind         | `src/**/*.tsx`           |
| **Backend**  | Python + FastAPI + Services   | `backend/**/*.py`        |
| **Database** | PostgreSQL + Redis + Migrations | `**/*.prisma,**/*.sql` |
| **DevOps**   | Docker + CI/CD + Deploy       | `.github/workflows/**`  |
| **Security** | Auth + Compliance + Audit     | `**/auth/**,**/security/**` |
| **QA**       | Tests + Coverage + Debugging  | `**/*.test.*,**/test_*.py` |

### Tier 3 — Workers (subagent-only)

| Agent           | Role                             | Capabilities |
| --------------- | -------------------------------- | ------------ |
| **Analyzer**    | Read-only research & analysis    | R/O          |
| **Implementer** | Code writing, docs, fixes, tests | R/W          |
| **Reviewer**    | 4-perspective code review        | R/O          |

## Guardian Flywheel (Cyclical Improvement)

```
     ┌──────────┐
     │ OBSERVE  │ ← Scan recent changes, metrics, patterns
     └────┬─────┘
          ▼
     ┌──────────┐
     │ DIAGNOSE │ ← Identify anti-patterns, debt, opportunities
     └────┬─────┘
          ▼
     ┌──────────┐
     │ PRESCRIBE│ ← Create actionable improvement plan
     └────┬─────┘
          ▼
     ┌──────────┐
     │ EXECUTE  │ ← Hand off to domain agents
     └────┬─────┘
          ▼
     ┌──────────┐
     │ VERIFY   │ ← Validate improvements, update metrics
     └────┬─────┘
          ▼
     ┌──────────┐
     │  LEARN   │ ← Log patterns to memory for future
     └────┬─────┘
          │
          └──────► OBSERVE (continuous cycle)
```

## MCP Servers

| Server              | Purpose              |
| ------------------- | -------------------- |
| github              | PRs, issues, search  |
| context7            | Library docs         |
| fetch               | Web fetching         |
| filesystem          | File access          |
| git                 | Git operations       |
| memory              | Knowledge graph      |
| sequential-thinking | Complex reasoning    |
| playwright          | Browser automation   |
