# Skill: Migration Segura

> Criar migration versionada para expo-sqlite com validação e rollback plan
> **Agente**: @BancoDados

---

## Quando Usar

- Criar nova tabela no schema
- Adicionar colunas a tabelas existentes
- Criar índices ou constraints
- Qualquer alteração de schema no SQLite

---

## Sistema de Migrations do Projeto

### Tabela de Controle

```sql
-- Gerenciada automaticamente pelo sistema
_migrations (version INTEGER, name TEXT, applied_at TEXT)
```

### Arquivo Único

**Arquivo**: `src/database/migrations.ts`

Todas as migrations ficam no array `migrations: Migration[]` com version incremental.

---

## Template de Migration

### Nova Tabela

```typescript
{
  version: NEXT_VERSION,  // última version + 1
  name: 'create_NOME_TABELA',
  up: async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS nome_tabela (
        -- PK
        id TEXT PRIMARY KEY NOT NULL,

        -- FK obrigatória para obra
        obra_id TEXT NOT NULL,

        -- Campos específicos do módulo
        campo_texto TEXT NOT NULL,
        campo_opcional TEXT DEFAULT '',
        campo_enum TEXT NOT NULL CHECK (campo_enum IN ('valor1', 'valor2', 'valor3')),
        campo_numerico REAL,
        campo_inteiro INTEGER NOT NULL DEFAULT 0,
        campo_boolean INTEGER NOT NULL DEFAULT 0 CHECK (campo_boolean IN (0, 1)),

        -- Campos padrão de inspeção
        status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('conforme', 'nao_conforme', 'pendente')),
        observacoes TEXT DEFAULT '',
        latitude REAL,
        longitude REAL,
        assinatura_path TEXT,

        -- Timestamps
        created_at TEXT NOT NULL DEFAULT (datetime('now')),

        -- Foreign Keys
        FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE
      );

      -- Índices
      CREATE INDEX IF NOT EXISTS idx_nome_tabela_obra_id ON nome_tabela(obra_id);
    `);
  }
}
```

### Adicionar Coluna a Tabela Existente

```typescript
{
  version: NEXT_VERSION,
  name: 'add_COLUNA_to_TABELA',
  up: async (db) => {
    // SQLite: ALTER TABLE só suporta ADD COLUMN
    await db.execAsync(`
      ALTER TABLE nome_tabela ADD COLUMN nova_coluna TEXT DEFAULT '';
    `);
  }
}
```

### Tabela Relacionada (Checklist / Dados Técnicos)

```typescript
{
  version: NEXT_VERSION,
  name: 'create_MODULO_checklist_items',
  up: async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS modulo_checklist_items (
        id TEXT PRIMARY KEY NOT NULL,
        inspecao_id TEXT NOT NULL,
        descricao TEXT NOT NULL,
        conforme INTEGER NOT NULL DEFAULT 0 CHECK (conforme IN (0, 1, 2)),
        observacao TEXT DEFAULT '',
        ordem INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (inspecao_id) REFERENCES modulo_inspecoes(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_modulo_checklist_inspecao_id
        ON modulo_checklist_items(inspecao_id);
    `);
  }
}
```

---

## Convenções de Schema

### Nomes
| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Tabela | snake_case plural | `fundacao_checklist_items` |
| Coluna | snake_case | `obra_id`, `data_inicio` |
| Índice | `idx_{tabela}_{coluna}` | `idx_fundacoes_obra_id` |
| FK | `{tabela_ref}_id` | `obra_id`, `inspecao_id` |

### Tipos de Dados
| Conceito | Tipo SQLite | Nota |
|----------|-------------|------|
| ID | TEXT | UUID via generateId() |
| String | TEXT | Com DEFAULT '' para opcionais |
| Enum | TEXT + CHECK | CHECK (col IN ('v1', 'v2')) |
| Number | REAL | Para decimais (compactação, coordenadas) |
| Integer | INTEGER | Para contadores, booleanos |
| Boolean | INTEGER | CHECK (col IN (0, 1)) |
| Date/Time | TEXT | ISO 8601, DEFAULT datetime('now') |
| FK | TEXT | FOREIGN KEY + ON DELETE CASCADE |

### Conformidade (padrão do projeto)
```sql
-- 0 = não conforme, 1 = conforme, 2 = não aplicável
conforme INTEGER NOT NULL DEFAULT 0 CHECK (conforme IN (0, 1, 2))
```

---

## Regras Críticas

```yaml
NUNCA:
  - Alterar migration já aplicada (criar nova version)
  - Usar DROP TABLE em produção sem backup plan
  - Esquecer IF NOT EXISTS em CREATE TABLE/INDEX
  - Usar tipos NUMBER/BOOLEAN (usar REAL/INTEGER)
  - Criar tabela sem FK para obras (toda entidade → obra_id)

SEMPRE:
  - Version incremental (última + 1)
  - IF NOT EXISTS em CREATE
  - FOREIGN KEY com ON DELETE CASCADE
  - INDEX para toda FK
  - CHECK para todo enum
  - DEFAULT para campos opcionais
  - Testar migration com banco novo E com banco existente
```

---

## Checklist de Validação

Antes de commitar a migration:

- [ ] Version é o próximo número sequencial
- [ ] Nome descritivo: `create_X`, `add_Y_to_Z`, `create_X_index`
- [ ] `IF NOT EXISTS` em todos os CREATE
- [ ] Todas as FKs com `ON DELETE CASCADE`
- [ ] INDEX para cada FK
- [ ] CHECK para cada campo enum
- [ ] Tipos corretos (TEXT, REAL, INTEGER)
- [ ] DEFAULT values para campos opcionais
- [ ] `datetime('now')` para timestamps
- [ ] Model atualizado para refletir novas colunas
- [ ] Repository atualizado com novos campos
- [ ] `npx tsc --noEmit` passa sem erros

---

## Rollback Plan

SQLite não suporta `DROP COLUMN` ou `ALTER COLUMN`. Para rollback:

1. **Nova tabela**: Criar migration que cria tabela temporária → copia dados → remove original → renomeia
2. **Nova coluna**: Coluna adicionada não pode ser removida — tratar no código como deprecated
3. **Novo índice**: Criar migration com `DROP INDEX IF EXISTS`

```typescript
// Exemplo de rollback (migration futura)
{
  version: NEXT_VERSION + 1,
  name: 'rollback_NOME_TABELA',
  up: async (db) => {
    await db.execAsync(`
      -- Criar backup
      CREATE TABLE IF NOT EXISTS nome_tabela_backup AS SELECT * FROM nome_tabela;
      -- Recriar sem a coluna problemática
      DROP TABLE IF EXISTS nome_tabela;
      CREATE TABLE nome_tabela (/* schema original */);
      -- Restaurar dados
      INSERT INTO nome_tabela SELECT col1, col2 FROM nome_tabela_backup;
      DROP TABLE nome_tabela_backup;
    `);
  }
}
```
