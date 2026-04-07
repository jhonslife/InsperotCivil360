---
applyTo: 'src/**/*.ts'
---

# TypeScript Standards — Inspetor Civil 360

## Regras Core

```yaml
tipos:
  - const > let, NUNCA var
  - Tipos explícitos em parâmetros e retornos de funções
  - Interfaces para models/entidades (não type aliases)
  - Enums como union types: 'valor1' | 'valor2' | 'valor3'
  - Evitar 'any' — usar 'unknown' quando tipo é incerto
  - Exportar todas as interfaces de models

naming:
  - PascalCase: interfaces, types, componentes
  - camelCase: funções, variáveis, hooks, instances
  - UPPER_SNAKE_CASE: constantes e configs
  - snake_case: nomes de colunas SQLite (match DB schema)

async:
  - async/await > Promises cruas (.then/.catch)
  - try/catch em todas as operações de banco
  - Loading states em toda operação async

imports:
  - Named imports preferidos
  - Agrupar: react → react-native → expo → navegação → locais
  - NUNCA remover imports sem rastrear (Import Verification Chain)
```

## Anti-Patterns

```typescript
// ❌ PROIBIDO
let x: any = getData();
var count = 0;
type User = { name: string };  // usar interface
enum Status { Active, Inactive }  // usar union type

// ✅ CORRETO
const result: unknown = getData();
const count = 0;
interface User { name: string; }
type Status = 'active' | 'inactive';
```

## Padrão de Model

```typescript
// src/models/NomeEntidade.ts
export interface NomeEntidade {
  id: string;
  obra_id: string;
  // ... campos com snake_case (match DB)
  created_at: string;
}

// Union types para enums
export type TipoEntidade = 'tipo_a' | 'tipo_b' | 'tipo_c';
```

## Padrão de Repository

```typescript
// src/database/repositories/nomeRepository.ts
import { getDatabase } from '../connection';
import { generateId } from '../../utils/generateId';

export const nomeRepository = {
  async getAll(obraId?: string): Promise<NomeEntidade[]> {
    const db = await getDatabase();
    // SEMPRE parameterized queries
    return db.getAllAsync<NomeEntidade>(
      'SELECT * FROM tabela WHERE obra_id = ? ORDER BY created_at DESC',
      [obraId]
    );
  },
  // ...
};
```
