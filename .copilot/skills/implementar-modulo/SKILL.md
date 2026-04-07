# Skill: Implementar Módulo

> Pipeline completa para implementar um módulo de inspeção no Inspetor Civil 360
> **Agente**: @Orquestrador (coordena) → @BancoDados → @Inspecao → @MobileUI → @Relatorios

---

## Quando Usar

- Novo módulo de inspeção (fundações, concreto, armadura, vedação, pavimentação)
- Expansão de módulo existente com novas funcionalidades
- Qualquer feature que toque schema + model + repository + tela + navegação

---

## Pipeline de Execução (10 Fases)

### FASE 1: Migration
**Agente**: @BancoDados
**Arquivo**: `src/database/migrations.ts`

```typescript
// Template de migration
{
  version: NEXT_VERSION,
  name: 'create_MODULO_table',
  up: async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS MODULO (
        id TEXT PRIMARY KEY NOT NULL,
        obra_id TEXT NOT NULL,
        // ... campos específicos do módulo
        status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('conforme', 'nao_conforme', 'pendente')),
        observacoes TEXT DEFAULT '',
        latitude REAL,
        longitude REAL,
        assinatura_path TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_MODULO_obra_id ON MODULO(obra_id);
    `);
  }
}
```

**Validação**:
- [ ] version é incremental (última version + 1)
- [ ] id TEXT PRIMARY KEY NOT NULL
- [ ] obra_id com FOREIGN KEY + ON DELETE CASCADE
- [ ] CHECK constraints para todos os enums
- [ ] INDEX para obra_id e FKs adicionais
- [ ] NUNCA alterar migrations existentes

### FASE 2: Model
**Agente**: @BancoDados
**Arquivo**: `src/models/NomeModulo.ts`

```typescript
export interface NomeModulo {
  id: string;
  obra_id: string;
  // campos específicos — snake_case (match DB)
  status: NomeModuloStatus;
  observacoes: string;
  latitude: number | null;
  longitude: number | null;
  assinatura_path: string | null;
  created_at: string;
}

export type NomeModuloStatus = 'conforme' | 'nao_conforme' | 'pendente';
```

**Validação**:
- [ ] Campos match exato com colunas da migration
- [ ] snake_case em todos os campos
- [ ] Union types para enums (não TypeScript enum)
- [ ] Nullability correta (null para campos opcionais do DB)

### FASE 3: Repository
**Agente**: @BancoDados
**Arquivo**: `src/database/repositories/nomeModuloRepository.ts`

```typescript
import { getDatabase } from '../connection';
import { NomeModulo } from '../../models/NomeModulo';
import { generateId } from '../../utils/generateId';

export const nomeModuloRepository = {
  async getAll(obraId?: string): Promise<NomeModulo[]> { /* ... */ },
  async getById(id: string): Promise<NomeModulo | null> { /* ... */ },
  async create(data: Omit<NomeModulo, 'id' | 'created_at'>): Promise<string> { /* ... */ },
  async update(id: string, data: Partial<NomeModulo>): Promise<void> { /* ... */ },
  async delete(id: string): Promise<void> { /* ... */ },
  async count(obraId?: string): Promise<number> { /* ... */ },
};
```

**Validação**:
- [ ] TODOS os métodos usam parameterized queries (?)
- [ ] generateId() para novos registros
- [ ] try/catch em toda operação
- [ ] Retorno tipado correto

### FASE 4: Constants / Checklist
**Agente**: @Inspecao
**Arquivo**: `src/constants/nomeModuloTypes.ts`

```typescript
export interface ChecklistTemplate {
  descricao: string;
  norma_referencia: string;
  ordem: number;
}

export const NOME_MODULO_CHECKLIST: ChecklistTemplate[] = [
  { descricao: 'Item baseado em norma ABNT/DNIT', norma_referencia: 'NBR XXXX', ordem: 1 },
  // ... itens conforme norma técnica
];
```

**Validação**:
- [ ] Cada item referencia uma norma ABNT/DNIT
- [ ] Ordem sequencial
- [ ] Linguagem técnica precisa em português

### FASE 5: Tela de Formulário
**Agente**: @MobileUI
**Arquivo**: `src/screens/{modulo}/NomeModuloFormScreen.tsx`

**Componentes obrigatórios**:
- SafeAreaView + Header
- ScrollView com KeyboardAvoidingView
- FormField (inputs de texto)
- SelectField (enums/opções)
- DatePickerField (datas)
- ChecklistItemRow (itens conforme/não conforme)
- PhotoPicker (fotos)
- SignatureCapture (assinatura)
- Botão "Salvar" com loading

**Comportamento**:
- GPS capturado automaticamente no `useEffect` inicial
- Validação inline antes de salvar
- Loading state durante operação assíncrona
- Navegação: goBack() após salvar com sucesso

### FASE 6: Tela de Lista
**Agente**: @MobileUI
**Arquivo**: `src/screens/{modulo}/NomeModuloListScreen.tsx`

**Componentes obrigatórios**:
- SafeAreaView + Header
- FlatList com renderização otimizada
- Card com StatusBadge/SeverityBadge
- FAB (botão flutuante) para nova inspeção
- Pull-to-refresh (onRefresh)
- Empty state quando lista vazia

### FASE 7: Navegação
**Agente**: @MobileUI
**Arquivos**: `src/navigation/types.ts` + `src/navigation/AppNavigator.tsx`

- Adicionar tipos das novas telas ao `RootStackParamList`
- Registrar `<Stack.Screen>` no navigator
- Adicionar ao hub/menu correspondente

### FASE 8: NC Automática
**Agente**: @Inspecao
**Arquivo**: `src/services/ncAutomaticaService.ts`

Regras por módulo:
```typescript
// Exemplo: ao salvar inspeção, verificar itens não conformes
async function verificarNCAutomatica(
  moduloNome: string,
  inspecaoId: string,
  obraId: string,
  itensNaoConformes: string[]
): Promise<string | null> {
  if (itensNaoConformes.length > 0) {
    const rncId = await rncRepository.create({
      obra_id: obraId,
      descricao: `NC automática: ${moduloNome} — ${itensNaoConformes.join(', ')}`,
      gravidade: itensNaoConformes.length >= 3 ? 'alta' : 'media',
      status: 'aberta',
      origem_tipo: moduloNome,
      origem_id: inspecaoId,
      // ...
    });
    return rncId;
  }
  return null;
}
```

### FASE 9: Template PDF
**Agente**: @Relatorios
**Arquivo**: `src/services/pdfService.ts`

- Adicionar função `generateNomeModuloPDF(data, photos)`
- Template HTML profissional com:
  - Cabeçalho com dados da obra
  - Tabela de checklist (conforme/não conforme)
  - Fotos em base64
  - Assinatura digital
  - Observações
  - Rodapé com data/hora

### FASE 10: Verificação Final
**Agente**: @Guardiao

```bash
npx tsc --noEmit          # Zero erros TypeScript
```

**Checklist de verificação**:
- [ ] Migration version correta e incremental
- [ ] Model ↔ Migration: campos 100% alinhados
- [ ] Repository: todos os métodos com parameterized queries
- [ ] Telas: SafeAreaView + Header + COLORS do theme
- [ ] Navegação: tipos em types.ts + Stack.Screen registrada
- [ ] Import Verification Chain: todos os imports rastreados
- [ ] Zero `any` — usar `unknown` se necessário

---

## Ordem de Delegação

```
@BancoDados → Migration (Fase 1)
@BancoDados → Model (Fase 2)
@BancoDados → Repository (Fase 3)
@Inspecao   → Constants/Checklist (Fase 4)
@MobileUI   → Tela Form (Fase 5)     ← paralelo com Fase 4
@MobileUI   → Tela List (Fase 6)
@MobileUI   → Navegação (Fase 7)
@Inspecao   → NC Automática (Fase 8)
@Relatorios → PDF (Fase 9)
@Guardiao   → Verificação (Fase 10)
```
