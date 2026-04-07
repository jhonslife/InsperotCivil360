---
applyTo: 'src/database/**/*.ts'
---

# SQLite Database Patterns — Inspetor Civil 360

## Regras Críticas

```yaml
segurança:
  - SEMPRE usar parameterized queries (? placeholders)
  - NUNCA interpolar strings em SQL
  - NUNCA usar template literals para SQL com variáveis

migrations:
  - Sistema versionado com tabela _migrations
  - NUNCA alterar migration já aplicada
  - Sempre criar nova version para mudanças
  - Testar migration isoladamente

schemas:
  - TEXT PRIMARY KEY com UUID (via generateId())
  - created_at TEXT DEFAULT datetime('now')
  - FOREIGN KEY com ON DELETE CASCADE
  - CHECK constraints para enums
  - Indexes: idx_{tabela}_{coluna}
  - Booleans: INTEGER (0=pendente, 1=conforme, 2=não conforme)
```

## Padrão de Migration

```typescript
{
  version: N,
  name: 'descricao_da_mudanca',
  up: async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS nome_tabela (
        id TEXT PRIMARY KEY NOT NULL,
        obra_id TEXT NOT NULL,
        -- campos...
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_nome_obra_id ON nome_tabela(obra_id);
    `);
  },
}
```

## Padrão de Repository

```typescript
export const nomeRepository = {
  // ✅ CORRETO — parameterized
  async getAll(obraId?: string): Promise<T[]> {
    const db = await getDatabase();
    if (obraId) {
      return db.getAllAsync<T>('SELECT * FROM tabela WHERE obra_id = ?', [obraId]);
    }
    return db.getAllAsync<T>('SELECT * FROM tabela');
  },

  // ❌ PROIBIDO — SQL injection
  async getAll(obraId: string): Promise<T[]> {
    const db = await getDatabase();
    return db.getAllAsync<T>(`SELECT * FROM tabela WHERE obra_id = '${obraId}'`);
  },

  async create(data: CreateDTO): Promise<string> {
    const db = await getDatabase();
    const id = generateId();
    await db.runAsync(
      'INSERT INTO tabela (id, obra_id, campo1) VALUES (?, ?, ?)',
      [id, data.obra_id, data.campo1]
    );
    return id;
  },
};
```

## Limitações do SQLite

```yaml
sem_suporte:
  - ALTER TABLE DROP COLUMN (antes do SQLite 3.35)
  - ALTER CHECK constraint
  - Múltiplos ALTER ADD COLUMN em um statement

workarounds:
  - Recriar tabela para remover colunas
  - Validação de CHECK no repository quando não suportado
  - Executar ALTER TABLE ADD COLUMN um por vez
```
