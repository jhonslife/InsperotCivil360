---
description: 'Criar nova migration versionada para o banco SQLite do Inspetor Civil 360'
---

# Criar Migration — Inspetor Civil 360

Crie uma nova migration versionada seguindo o padrão:

## Checklist

1. **Abrir** `src/database/migrations.ts`
2. **Identificar** a última version no array `migrations[]`
3. **Adicionar** nova Migration com version = último + 1
4. **Nomear** com snake_case descritivo: `nome_da_mudanca`
5. **Implementar** up() com SQL:
   - `CREATE TABLE IF NOT EXISTS` para novas tabelas
   - `ALTER TABLE ... ADD COLUMN` para novas colunas
   - `CREATE INDEX IF NOT EXISTS` para índices
   - `CHECK constraints` para enums

## Template

```typescript
{
  version: {{NEXT_VERSION}},
  name: '{{migration_name}}',
  up: async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS {{table_name}} (
        id TEXT PRIMARY KEY NOT NULL,
        obra_id TEXT NOT NULL,
        -- ... campos específicos
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_{{table}}_obra_id ON {{table_name}}(obra_id);
    `);
  },
},
```

## Regras

- NUNCA alterar migration já aplicada
- TEXT para strings e datas, REAL para números decimais, INTEGER para booleans/inteiros
- CHECK constraints para valores permitidos (enums)
- FOREIGN KEY com ON DELETE CASCADE
- Indexes em colunas de FK e busca frequente
