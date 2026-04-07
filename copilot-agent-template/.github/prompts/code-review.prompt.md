---
mode: "agent"
description: "Comprehensive code review from 4 perspectives: correctness, quality, security, architecture"
---

# Code Review

Review the following code changes from 4 perspectives:

## 1. CORRECTNESS
- Does the code work as intended?
- Are edge cases handled?
- Are errors handled properly?

## 2. QUALITY
- Does it follow project conventions (see `.github/copilot-instructions.md`)?
- Is naming clear and consistent?
- Is there unnecessary complexity?

## 3. SECURITY
- Is input validated?
- Are there injection risks?
- Are secrets handled properly?

## 4. ARCHITECTURE
- Does it fit existing patterns?
- Are responsibilities well-separated?
- Is it maintainable?

## Output Format

For each finding, use:
- 🔴 **Blocking** — Must fix before merge
- 🟡 **Suggestion** — Should fix, not blocking
- 🟢 **Nitpick** — Nice to have

Also mention what's done well.

## Files to Review

{{CHANGED_FILES}}
