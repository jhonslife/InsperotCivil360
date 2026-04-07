---
mode: 'agent'
description: 'Generate a comprehensive test suite for a module or feature'
---

# Create Test Suite

Generate a comprehensive test suite for the specified module/feature.

## Requirements

1. Follow the testing patterns in `.github/instructions/testing-patterns.instructions.md`
2. Use AAA pattern (Arrange-Act-Assert) for all tests
3. Cover: happy path, edge cases, error cases
4. Use descriptive names: `it('should Y when Z')`
5. Mock only external dependencies
6. Target 80%+ coverage

## For TypeScript (Vitest)

```
import { describe, it, expect, vi, beforeEach } from 'vitest';
```

## For Python (pytest)

```
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
```

## Module to Test

{{MODULE_PATH}}
