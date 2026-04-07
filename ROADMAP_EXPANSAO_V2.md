# INSPETOR CIVIL 360 — Roadmap de Expansão V2

> **Estudo Completo de Atualização da Arquitetura**  
> *Baseado na solicitação do contratante — Abril 2026*

---

## 1. ANÁLISE DE GAP — Estado Atual vs. Solicitação

### 1.1 — Fundações

| Aspecto | Estado Atual | Solicitado |
|---|---|---|
| Fundações Rasas | ✅ 8 itens básicos (sapatas) | 12 itens completos (sapata/radier) |
| Fundações Profundas | ❌ Inexistente | 6 tipos com checklists específicos |
| Bloco de Coroamento | ❌ Inexistente | 9 itens de checklist |
| Cadastro de Fundação | ❌ Inexistente | Tipo, diâmetro, profundidade, GPS |
| Acompanhamento executivo | ❌ Inexistente | Checklist por tipo + dados técnicos |
| Controle Tecnológico | Parcial (via ensaios genéricos) | Volume, Fck, Rastreabilidade |
| NC automática | ❌ Inexistente | Desvio de prumo, falha de concretagem, colapso |

### 1.2 — Concreto / Estrutura

| Aspecto | Estado Atual | Solicitado |
|---|---|---|
| Inspeção de concreto | Parcial (7 itens genéricos) | 11 itens + tabela `concreto_inspecoes` |
| Inspeção de armadura | ❌ Inexistente | Tabela `armadura_inspecoes` com 6 campos |
| Inspeção de formas | ❌ Inexistente | Tabela `formas_inspecoes` com 5 campos |
| Rompimento CP | ❌ Inexistente | Tabela `rompimento_corpos_prova` |

### 1.3 — Vedação

| Aspecto | Estado Atual | Solicitado |
|---|---|---|
| Inspeção de vedação | ❌ Inexistente | 9 itens (alvenaria + drywall) |

### 1.4 — Pavimentação

| Aspecto | Estado Atual | Solicitado |
|---|---|---|
| Inspeção genérica | ✅ 7 itens básicos | 4 sub-checklists (25+ itens) |
| Por camada | ❌ Tudo em um | Subleito / Sub-base / Base / CBUQ |
| Campos dinâmicos | ❌ Inexistente | Toggle por camada selecionada |
| Tabela dedicada | ❌ Usa `inspections` | Nova `pavimentacao_inspecoes` |
| Ensaios tecnológicos | Parcial (compactação, deflexão) | 4 tipos: compactação, densidade, ligante, Marshall |
| Dashboard | ❌ Inexistente | 4 indicadores: compactação, ensaios, NC, temp |
| Geolocalização KM | ❌ Apenas GPS lat/long | KM/trecho para obra linear |
| NC automática | ❌ Inexistente | Auto-criar se compactação falha ou ensaio NC |
| PDF dedicado | Parcial (ensaio genérico) | Template completo de pavimentação |

### 1.5 — Cross-cutting

| Aspecto | Estado Atual | Solicitado |
|---|---|---|
| NC automática global | ❌ | Auto-gerar de qualquer módulo |
| Checklist de NC | 6 campos básicos | 9 itens com causa e ação corretiva |
| Checklist relatórios | ❌ | 8 itens de verificação de completude |
| Navegação | 5 tabs fixas | Reestruturação com mais módulos |

---

## 2. NORMAS TÉCNICAS APLICÁVEIS

A expansão deve respeitar as seguintes normas brasileiras da ABNT:

### Fundações
| Norma | Descrição | Impacto no App |
|---|---|---|
| **NBR 6122:2022** | Projeto e execução de fundações | Tipos de fundação, critérios de aceitação |
| **NBR 6118:2023** | Projeto de estruturas de concreto armado | Cobrimento mínimo, fck, armaduras |
| **NBR 12131** | Estacas — Prova de carga estática | Critérios para integridade |
| **NBR 13208** | Estacas — Ensaio de carregamento dinâmico | Critério de nega |
| **NBR 6484** | Solo — Sondagens de simples reconhecimento (SPT) | Registro de solo |

### Concreto / Estrutura
| Norma | Descrição | Impacto no App |
|---|---|---|
| **NBR 12655:2022** | Concreto — Preparo, controle e recebimento | Slump, temperatura, rastreabilidade |
| **NBR 5739** | Concreto — Ensaio de compressão (CP) | Rompimento aos 7, 14, 28 dias |
| **NBR 7480** | Aço para concreto armado | Diâmetro, espaçamento |
| **NBR 14931** | Execução de estruturas de concreto | Formas, escoramento, concretagem |

### Pavimentação
| Norma | Descrição | Impacto no App |
|---|---|---|
| **DNIT 031/2006-ES** | Pavimentos — Execução de sub-base estabilizada | Compactação mínima 100% PN |
| **DNIT 141/2022-ES** | Pavimentação — Base estabilizada granulometricamente | Espessura, compactação |
| **DNIT 031/2006-ES** | CBUQ — Faixa granulométrica | Temperatura 107-177°C |
| **DNER-ME 024** | Determinação de deflexões pela Viga Benkelman | Limite de deflexão |
| **NBR 9895** | Solo — Índice de suporte Califórnia (CBR/ISC) | Subleito mín. 2% |

### Vedação
| Norma | Descrição | Impacto no App |
|---|---|---|
| **NBR 15961** | Alvenaria estrutural — Blocos de concreto | Prumo e alinhamento |
| **NBR 15575** | Edificações — Desempenho | Estanqueidade, segurança |
| **NBR 15758** | Sistemas de drywall | Fixação, juntas |

---

## 3. ROADMAP DE IMPLEMENTAÇÃO — 6 FASES

```
┌────────────────────────────────────────────────────────────────────┐
│ FASE 1: Schema Evolution + Migration System     (Base técnica)     │
│ FASE 2: Módulo Fundações Completo               (Novo módulo)      │
│ FASE 3: Módulo Concreto/Estrutura               (Expansão)         │
│ FASE 4: Módulo Vedação                          (Novo módulo)      │
│ FASE 5: Módulo Avançado de Pavimentação         (Expansão major)   │
│ FASE 6: Cross-cutting + Nova Navegação          (Consolidação)     │
└────────────────────────────────────────────────────────────────────┘
```

---

### FASE 1 — Schema Evolution + Sistema de Migração Versionada

**Objetivo:** Preparar a base para todas as expansões sem quebrar dados existentes.

#### 1.1 — Sistema de Migração Versionada

**Problema:** Atualmente `runMigrations()` usa `CREATE TABLE IF NOT EXISTS`. Não há controle de versão. Adicionar colunas/tabelas sem perder dados requer um sistema de migrations incremental.

**Solução:** Criar tabela `_migrations` com controle de versão.

```typescript
// src/database/migrations.ts — Nova estrutura

interface Migration {
  version: number;
  name: string;
  up: (db: SQLiteDatabase) => Promise<void>;
}

const migrations: Migration[] = [
  { version: 1, name: 'initial_schema', up: async (db) => { /* schema atual */ } },
  { version: 2, name: 'fundacoes_profundas', up: async (db) => { /* novas tabelas */ } },
  { version: 3, name: 'concreto_armadura_formas', up: async (db) => { /* ... */ } },
  { version: 4, name: 'vedacao', up: async (db) => { /* ... */ } },
  { version: 5, name: 'pavimentacao_avancada', up: async (db) => { /* ... */ } },
  { version: 6, name: 'nc_automatica_dashboard', up: async (db) => { /* ... */ } },
];
```

#### 1.2 — Novas Tabelas (Migration v2–v6)

**Migration v2 — Fundações Profundas:**

```sql
CREATE TABLE fundacoes (
  id TEXT PRIMARY KEY NOT NULL,
  obra_id TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN (
    'estaca_cravada', 'estaca_escavada', 'estaca_helice_continua',
    'estaca_strauss', 'estaca_raiz', 'tubulao'
  )),
  diametro REAL NOT NULL,                -- mm
  profundidade_projeto REAL NOT NULL,     -- metros
  profundidade_atingida REAL,             -- metros
  latitude REAL,
  longitude REAL,
  localizacao_desc TEXT DEFAULT '',        -- Ex: "Bloco B3 - Estaca E12"
  data TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'em_execucao' CHECK (status IN (
    'em_execucao', 'concluida', 'com_nc'
  )),
  observacoes TEXT DEFAULT '',
  assinatura_path TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE
);

-- Dados técnicos por tipo de estaca (chave-valor flexível)
CREATE TABLE fundacao_dados_tecnicos (
  id TEXT PRIMARY KEY NOT NULL,
  fundacao_id TEXT NOT NULL,
  campo TEXT NOT NULL,          -- 'nega_final', 'desvio_prumo', 'pressao_injecao', etc.
  valor_numerico REAL,
  valor_texto TEXT DEFAULT '',
  unidade TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (fundacao_id) REFERENCES fundacoes(id) ON DELETE CASCADE
);

CREATE TABLE fundacao_checklist_items (
  id TEXT PRIMARY KEY NOT NULL,
  fundacao_id TEXT NOT NULL,
  descricao TEXT NOT NULL,
  conforme INTEGER NOT NULL DEFAULT 0 CHECK (conforme IN (0, 1, 2)),
  observacao TEXT DEFAULT '',
  ordem INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (fundacao_id) REFERENCES fundacoes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_fundacoes_obra_id ON fundacoes(obra_id);
CREATE INDEX IF NOT EXISTS idx_fundacao_dados_fundacao_id ON fundacao_dados_tecnicos(fundacao_id);
CREATE INDEX IF NOT EXISTS idx_fundacao_checklist_fundacao_id ON fundacao_checklist_items(fundacao_id);
```

**Migration v3 — Concreto / Armadura / Formas / CP:**

```sql
CREATE TABLE concreto_inspecoes (
  id TEXT PRIMARY KEY NOT NULL,
  obra_id TEXT NOT NULL,
  data TEXT NOT NULL,
  elemento TEXT NOT NULL CHECK (elemento IN ('pilar', 'viga', 'laje', 'fundacao')),
  fck_projeto REAL NOT NULL,          -- MPa
  slump REAL,                          -- mm
  temperatura_concreto REAL,           -- °C
  adensamento_ok INTEGER DEFAULT 0,    -- boolean
  cura_ok INTEGER DEFAULT 0,           -- boolean
  observacoes TEXT DEFAULT '',
  latitude REAL,
  longitude REAL,
  assinatura_path TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE
);

CREATE TABLE armadura_inspecoes (
  id TEXT PRIMARY KEY NOT NULL,
  obra_id TEXT NOT NULL,
  data TEXT NOT NULL,
  elemento TEXT NOT NULL,
  diametro REAL,                       -- mm
  espacamento REAL,                    -- cm
  cobrimento_ok INTEGER DEFAULT 0,
  amarracao_ok INTEGER DEFAULT 0,
  conforme_projeto INTEGER DEFAULT 0,
  observacoes TEXT DEFAULT '',
  latitude REAL,
  longitude REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE
);

CREATE TABLE formas_inspecoes (
  id TEXT PRIMARY KEY NOT NULL,
  obra_id TEXT NOT NULL,
  data TEXT NOT NULL,
  elemento TEXT NOT NULL,
  alinhamento_ok INTEGER DEFAULT 0,
  nivelamento_ok INTEGER DEFAULT 0,
  estanqueidade_ok INTEGER DEFAULT 0,
  limpeza_ok INTEGER DEFAULT 0,
  desmoldante_aplicado INTEGER DEFAULT 0,
  observacoes TEXT DEFAULT '',
  latitude REAL,
  longitude REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE
);

CREATE TABLE rompimento_corpos_prova (
  id TEXT PRIMARY KEY NOT NULL,
  obra_id TEXT NOT NULL,
  concreto_inspecao_id TEXT,             -- vínculo opcional com concretagem
  data TEXT NOT NULL,
  idade INTEGER NOT NULL,                -- 7, 14, 28 dias
  resistencia REAL NOT NULL,             -- MPa
  fck_projeto REAL NOT NULL,             -- MPa
  conforme INTEGER DEFAULT 0,            -- boolean
  observacoes TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE,
  FOREIGN KEY (concreto_inspecao_id) REFERENCES concreto_inspecoes(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_concreto_obra_id ON concreto_inspecoes(obra_id);
CREATE INDEX IF NOT EXISTS idx_armadura_obra_id ON armadura_inspecoes(obra_id);
CREATE INDEX IF NOT EXISTS idx_formas_obra_id ON formas_inspecoes(obra_id);
CREATE INDEX IF NOT EXISTS idx_cp_obra_id ON rompimento_corpos_prova(obra_id);
CREATE INDEX IF NOT EXISTS idx_cp_concreto_id ON rompimento_corpos_prova(concreto_inspecao_id);
```

**Migration v4 — Vedação:**

```sql
CREATE TABLE vedacao_inspecoes (
  id TEXT PRIMARY KEY NOT NULL,
  obra_id TEXT NOT NULL,
  data TEXT NOT NULL,
  tipo_vedacao TEXT NOT NULL CHECK (tipo_vedacao IN ('alvenaria', 'drywall')),
  local_descricao TEXT DEFAULT '',
  material_conforme INTEGER DEFAULT 0,
  base_nivelada INTEGER DEFAULT 0,
  prumo_alinhamento_ok INTEGER DEFAULT 0,
  junta_adequada INTEGER DEFAULT 0,
  amarracao_ok INTEGER DEFAULT 0,
  vergas_contravergas_ok INTEGER DEFAULT 0,
  fixacao_adequada INTEGER DEFAULT 0,        -- drywall
  ausencia_trincas INTEGER DEFAULT 0,
  limpeza_ok INTEGER DEFAULT 0,
  observacoes TEXT DEFAULT '',
  latitude REAL,
  longitude REAL,
  assinatura_path TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_vedacao_obra_id ON vedacao_inspecoes(obra_id);
```

**Migration v5 — Pavimentação Avançada:**

```sql
CREATE TABLE pavimentacao_inspecoes (
  id TEXT PRIMARY KEY NOT NULL,
  obra_id TEXT NOT NULL,
  data TEXT NOT NULL,
  trecho TEXT NOT NULL DEFAULT '',           -- Ex: "KM 32+500 a KM 33+200"
  camada TEXT NOT NULL CHECK (camada IN ('subleito', 'sub_base', 'base', 'cbuq')),
  espessura REAL,                             -- cm
  compactacao_ok INTEGER DEFAULT 0,
  umidade_ok INTEGER DEFAULT 0,
  temperatura REAL,                           -- °C (CBUQ)
  latitude REAL,
  longitude REAL,
  km_inicio TEXT DEFAULT '',                  -- "KM 32+500"
  km_fim TEXT DEFAULT '',                     -- "KM 33+200"
  observacoes TEXT DEFAULT '',
  assinatura_path TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE
);

CREATE TABLE pavimentacao_ensaios (
  id TEXT PRIMARY KEY NOT NULL,
  obra_id TEXT NOT NULL,
  pavimentacao_inspecao_id TEXT,
  data TEXT NOT NULL,
  trecho TEXT NOT NULL DEFAULT '',
  tipo_ensaio TEXT NOT NULL CHECK (tipo_ensaio IN (
    'grau_compactacao', 'densidade_in_situ', 'teor_ligante', 'marshall'
  )),
  resultado REAL,
  unidade TEXT DEFAULT '',
  conforme INTEGER DEFAULT 0,
  observacoes TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE,
  FOREIGN KEY (pavimentacao_inspecao_id) REFERENCES pavimentacao_inspecoes(id) ON DELETE SET NULL
);

CREATE TABLE pavimentacao_checklist_items (
  id TEXT PRIMARY KEY NOT NULL,
  pavimentacao_inspecao_id TEXT NOT NULL,
  descricao TEXT NOT NULL,
  conforme INTEGER NOT NULL DEFAULT 0 CHECK (conforme IN (0, 1, 2)),
  observacao TEXT DEFAULT '',
  ordem INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (pavimentacao_inspecao_id) REFERENCES pavimentacao_inspecoes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pav_insp_obra_id ON pavimentacao_inspecoes(obra_id);
CREATE INDEX IF NOT EXISTS idx_pav_ensaio_obra_id ON pavimentacao_ensaios(obra_id);
CREATE INDEX IF NOT EXISTS idx_pav_checklist_insp_id ON pavimentacao_checklist_items(pavimentacao_inspecao_id);
```

**Migration v6 — NC Automática + Campos extras:**

```sql
-- Adicionar campos à tabela rnc para NC automática
ALTER TABLE rnc ADD COLUMN origem_tipo TEXT DEFAULT '';
-- 'fundacao', 'concreto', 'armadura', 'formas', 'vedacao', 'pavimentacao', 'ensaio', 'manual'
ALTER TABLE rnc ADD COLUMN origem_id TEXT DEFAULT '';
ALTER TABLE rnc ADD COLUMN causa TEXT DEFAULT '';
ALTER TABLE rnc ADD COLUMN acao_corretiva TEXT DEFAULT '';

-- Expandir entity_type de photos para novos módulos
-- (SQLite CHECK constraint atualizado por recriação ou via trigger)
```

#### 1.3 — Atualizar `entity_type` de Photos

Expandir para suportar novos módulos:

```typescript
type EntityType = 
  | 'inspection' | 'rnc' | 'diary' | 'ensaio'      // existentes
  | 'fundacao' | 'concreto' | 'armadura' | 'formas'  // novos
  | 'vedacao' | 'pavimentacao' | 'pav_ensaio'         // novos
  | 'rompimento_cp';                                   // novos
```

**Solução técnica:** Como SQLite não suporta ALTER CHECK, criar nova tabela `photos_v2` sem CHECK constraint no `entity_type` (validar no repository), migrar dados, drop da antiga.

---

### FASE 2 — Módulo Fundações Completo

#### 2.1 — Novos Models

```
src/models/
├── Fundacao.ts               ← NOVO
├── FundacaoDadoTecnico.ts    ← NOVO
└── ... (existentes)
```

**Fundacao.ts:**

```typescript
export interface Fundacao {
  id: string;
  obra_id: string;
  tipo: FundacaoTipo;
  diametro: number;
  profundidade_projeto: number;
  profundidade_atingida?: number;
  latitude?: number;
  longitude?: number;
  localizacao_desc: string;
  data: string;
  status: 'em_execucao' | 'concluida' | 'com_nc';
  observacoes: string;
  assinatura_path?: string;
  created_at: string;
}

export type FundacaoTipo =
  | 'estaca_cravada'
  | 'estaca_escavada'
  | 'estaca_helice_continua'
  | 'estaca_strauss'
  | 'estaca_raiz'
  | 'tubulao';
```

#### 2.2 — Checklists Específicos por Tipo de Fundação Profunda

```typescript
// src/constants/fundacaoTypes.ts ← NOVO

export const FUNDACAO_PROFUNDA_CHECKLISTS: Record<FundacaoTipo, ChecklistTemplate[]> = {
  estaca_cravada: [
    { descricao: 'Locação da estaca conferida', ordem: 1 },
    { descricao: 'Equipamento calibrado', ordem: 2 },
    { descricao: 'Diâmetro conforme projeto', ordem: 3 },
    { descricao: 'Profundidade atingida', ordem: 4 },
    { descricao: 'Registro de nega final', ordem: 5 },
    { descricao: 'Controle de prumo (% desvio)', ordem: 6 },
    { descricao: 'Integridade da estaca verificada (sem trincas)', ordem: 7 },
    { descricao: 'Relatório de golpes por metro registrado', ordem: 8 },
    { descricao: 'Estaca sem desvio ou falha', ordem: 9 },
    { descricao: 'Ensaio de integridade (PIT)', ordem: 10 },
  ],
  estaca_escavada: [
    { descricao: 'Locação da estaca conferida', ordem: 1 },
    { descricao: 'Equipamento calibrado', ordem: 2 },
    { descricao: 'Diâmetro conforme projeto', ordem: 3 },
    { descricao: 'Profundidade atingida registrada', ordem: 4 },
    { descricao: 'Verificação de colapso de paredes', ordem: 5 },
    { descricao: 'Controle de volume de concreto', ordem: 6 },
    { descricao: 'Registro de solo encontrado', ordem: 7 },
    { descricao: 'Limpeza do furo realizada', ordem: 8 },
    { descricao: 'Concreto conforme especificação', ordem: 9 },
    { descricao: 'Registro de concretagem', ordem: 10 },
  ],
  estaca_helice_continua: [
    { descricao: 'Locação da estaca conferida', ordem: 1 },
    { descricao: 'Equipamento calibrado', ordem: 2 },
    { descricao: 'Diâmetro conforme projeto', ordem: 3 },
    { descricao: 'Volume de concreto x profundidade registrado', ordem: 4 },
    { descricao: 'Pressão de injeção controlada', ordem: 5 },
    { descricao: 'Tempo de execução registrado', ordem: 6 },
    { descricao: 'Registro automático verificado', ordem: 7 },
    { descricao: 'Profundidade atingida', ordem: 8 },
    { descricao: 'Concreto conforme especificação', ordem: 9 },
    { descricao: 'Controle de volume aplicado', ordem: 10 },
  ],
  estaca_strauss: [
    { descricao: 'Locação da estaca conferida', ordem: 1 },
    { descricao: 'Diâmetro conforme projeto', ordem: 2 },
    { descricao: 'Controle de verticalidade', ordem: 3 },
    { descricao: 'Integridade do fuste verificada', ordem: 4 },
    { descricao: 'Controle de concretagem', ordem: 5 },
    { descricao: 'Registro de profundidade', ordem: 6 },
    { descricao: 'Concreto conforme especificação', ordem: 7 },
    { descricao: 'Estaca sem desvio ou falha', ordem: 8 },
  ],
  estaca_raiz: [
    { descricao: 'Locação da estaca conferida', ordem: 1 },
    { descricao: 'Diâmetro conforme projeto', ordem: 2 },
    { descricao: 'Pressão de injeção controlada', ordem: 3 },
    { descricao: 'Consumo de calda registrado', ordem: 4 },
    { descricao: 'Inclinação da estaca conforme projeto', ordem: 5 },
    { descricao: 'Controle de profundidade', ordem: 6 },
    { descricao: 'Concreto/calda conforme especificação', ordem: 7 },
    { descricao: 'Estaca sem desvio ou falha', ordem: 8 },
  ],
  tubulao: [
    { descricao: 'Locação do tubulão conferida', ordem: 1 },
    { descricao: 'Diâmetro conforme projeto', ordem: 2 },
    { descricao: 'Inspeção visual do solo realizada', ordem: 3 },
    { descricao: 'Verificação da base (alargamento)', ordem: 4 },
    { descricao: 'Segurança do operador verificada (item crítico)', ordem: 5 },
    { descricao: 'Controle de volume de concreto', ordem: 6 },
    { descricao: 'Profundidade atingida conforme projeto', ordem: 7 },
    { descricao: 'Concreto conforme especificação', ordem: 8 },
    { descricao: 'Registro de concretagem', ordem: 9 },
  ],
};

// Dados técnicos esperados por tipo
export const FUNDACAO_DADOS_TECNICOS: Record<FundacaoTipo, DadoTecnicoTemplate[]> = {
  estaca_cravada: [
    { campo: 'nega_final', label: 'Nega Final', unidade: 'mm', tipo: 'numerico' },
    { campo: 'desvio_prumo', label: 'Desvio de Prumo', unidade: '%', tipo: 'numerico' },
    { campo: 'golpes_por_metro', label: 'Golpes por Metro', unidade: 'golpes/m', tipo: 'numerico' },
  ],
  estaca_escavada: [
    { campo: 'volume_concreto', label: 'Volume de Concreto', unidade: 'm³', tipo: 'numerico' },
    { campo: 'solo_encontrado', label: 'Solo Encontrado', unidade: '', tipo: 'texto' },
  ],
  estaca_helice_continua: [
    { campo: 'volume_concreto', label: 'Volume de Concreto', unidade: 'm³', tipo: 'numerico' },
    { campo: 'pressao_injecao', label: 'Pressão de Injeção', unidade: 'kgf/cm²', tipo: 'numerico' },
    { campo: 'tempo_execucao', label: 'Tempo de Execução', unidade: 'min', tipo: 'numerico' },
  ],
  estaca_strauss: [
    { campo: 'volume_concreto', label: 'Volume de Concreto', unidade: 'm³', tipo: 'numerico' },
  ],
  estaca_raiz: [
    { campo: 'pressao_injecao', label: 'Pressão de Injeção', unidade: 'kgf/cm²', tipo: 'numerico' },
    { campo: 'consumo_calda', label: 'Consumo de Calda', unidade: 'litros', tipo: 'numerico' },
    { campo: 'inclinacao', label: 'Inclinação', unidade: '°', tipo: 'numerico' },
  ],
  tubulao: [
    { campo: 'volume_concreto', label: 'Volume de Concreto', unidade: 'm³', tipo: 'numerico' },
    { campo: 'solo_encontrado', label: 'Solo Encontrado', unidade: '', tipo: 'texto' },
  ],
};
```

#### 2.3 — Checklist de Fundações Rasas (Expandido para 12 itens)

Atualizar o checklist `fundacao` existente em `inspectionTypes.ts`:

```typescript
fundacao_rasa: [
  { descricao: 'Locação conferida conforme projeto', ordem: 1 },
  { descricao: 'Escavação nas dimensões corretas', ordem: 2 },
  { descricao: 'Fundo da cava regularizado e limpo', ordem: 3 },
  { descricao: 'Solo com capacidade adequada', ordem: 4 },
  { descricao: 'Lastro de concreto magro executado', ordem: 5 },
  { descricao: 'Armadura conforme projeto', ordem: 6 },
  { descricao: 'Cobrimento respeitado', ordem: 7 },
  { descricao: 'Forma alinhada e nivelada', ordem: 8 },
  { descricao: 'Conferência de embutidos', ordem: 9 },
  { descricao: 'Liberação para concretagem', ordem: 10 },
  { descricao: 'Slump test realizado', ordem: 11 },
  { descricao: 'Cura iniciada corretamente', ordem: 12 },
],
```

#### 2.4 — Checklist de Bloco de Coroamento (Novo)

```typescript
bloco_coroamento: [
  { descricao: 'Cabeça das estacas regularizadas', ordem: 1 },
  { descricao: 'Armadura conforme projeto', ordem: 2 },
  { descricao: 'Amarração adequada', ordem: 3 },
  { descricao: 'Cobrimento correto', ordem: 4 },
  { descricao: 'Forma alinhada', ordem: 5 },
  { descricao: 'Limpeza antes da concretagem', ordem: 6 },
  { descricao: 'Liberação da engenharia', ordem: 7 },
  { descricao: 'Controle de concreto (slump e fck)', ordem: 8 },
  { descricao: 'Cura realizada', ordem: 9 },
],
```

#### 2.5 — Novos Arquivos de Código

```
src/
├── constants/
│   └── fundacaoTypes.ts               ← NOVO
├── models/
│   ├── Fundacao.ts                    ← NOVO
│   └── FundacaoDadoTecnico.ts         ← NOVO
├── database/repositories/
│   └── fundacaoRepository.ts          ← NOVO
├── screens/
│   └── fundacoes/                     ← NOVO DIRETÓRIO
│       ├── FundacaoListScreen.tsx
│       ├── FundacaoTypeScreen.tsx      (escolha tipo de fundação)
│       └── FundacaoFormScreen.tsx      (formulário dinâmico)
└── services/
    └── ncAutomaticaService.ts         ← NOVO (usado em todas as fases)
```

#### 2.6 — Navegação

Adicionar novo stack de Fundações no Bottom Tab:

```typescript
// Opção A: Nova tab "Fundações" (6 tabs = bottom tab + "Mais")
// Opção B: Sub-menu dentro de "Mais" (manter 5 tabs)
// RECOMENDADO: Opção B para não poluir a tab bar

// Adicionar ao MoreStackParamList:
FundacaoList: undefined;
FundacaoType: undefined;
FundacaoForm: { fundacaoId?: string; obraId?: string; tipo?: string };
```

---

### FASE 3 — Módulo Concreto / Estrutura

#### 3.1 — Novos Models

```typescript
// src/models/ConcretoInspecao.ts
export interface ConcretoInspecao {
  id: string;
  obra_id: string;
  data: string;
  elemento: 'pilar' | 'viga' | 'laje' | 'fundacao';
  fck_projeto: number;
  slump?: number;
  temperatura_concreto?: number;
  adensamento_ok: boolean;
  cura_ok: boolean;
  observacoes: string;
  latitude?: number;
  longitude?: number;
  assinatura_path?: string;
  created_at: string;
}

// src/models/ArmaduraInspecao.ts
export interface ArmaduraInspecao {
  id: string;
  obra_id: string;
  data: string;
  elemento: string;
  diametro?: number;
  espacamento?: number;
  cobrimento_ok: boolean;
  amarracao_ok: boolean;
  conforme_projeto: boolean;
  observacoes: string;
  created_at: string;
}

// src/models/FormaInspecao.ts
export interface FormaInspecao {
  id: string;
  obra_id: string;
  data: string;
  elemento: string;
  alinhamento_ok: boolean;
  nivelamento_ok: boolean;
  estanqueidade_ok: boolean;
  limpeza_ok: boolean;
  desmoldante_aplicado: boolean;
  observacoes: string;
  created_at: string;
}

// src/models/RompimentoCP.ts
export interface RompimentoCP {
  id: string;
  obra_id: string;
  concreto_inspecao_id?: string;
  data: string;
  idade: number;        // 7, 14, 28
  resistencia: number;  // MPa
  fck_projeto: number;  // MPa
  conforme: boolean;
  observacoes: string;
  created_at: string;
}
```

#### 3.2 — Checklist de Concreto (Expandido — 11 itens)

Substituir o checklist `estrutura` atual:

```typescript
concreto_estrutura: [
  { descricao: 'Forma limpa e estanque', ordem: 1 },
  { descricao: 'Armadura posicionada corretamente', ordem: 2 },
  { descricao: 'Espaçadores instalados', ordem: 3 },
  { descricao: 'Conferência de cobrimento', ordem: 4 },
  { descricao: 'Slump test dentro do padrão', ordem: 5 },
  { descricao: 'Tempo de transporte adequado', ordem: 6 },
  { descricao: 'Lançamento sem segregação', ordem: 7 },
  { descricao: 'Adensamento correto (vibrador)', ordem: 8 },
  { descricao: 'Acabamento adequado', ordem: 9 },
  { descricao: 'Cura iniciada no tempo correto', ordem: 10 },
  { descricao: 'Registro de rastreabilidade', ordem: 11 },
],
```

#### 3.3 — Regras de Negócio

- **Rompimento CP:** Se `resistencia < fck_projeto * 0.95` → marcar `conforme = false` + gerar alerta
- **Concreto:** Se `slump` fora de range NBR 12655 → alerta
- **Concreto:** Se `temperatura_concreto > 35°C` → alerta (NBR 7212)
- **Armadura:** Se `conforme_projeto = false` → gerar NC automática
- **Formas:** Se qualquer campo `_ok = false` → flag de atenção no relatório

#### 3.4 — Novos Arquivos

```
src/
├── models/
│   ├── ConcretoInspecao.ts            ← NOVO
│   ├── ArmaduraInspecao.ts            ← NOVO
│   ├── FormaInspecao.ts               ← NOVO
│   └── RompimentoCP.ts                ← NOVO
├── database/repositories/
│   ├── concretoRepository.ts          ← NOVO
│   ├── armaduraRepository.ts          ← NOVO
│   ├── formaRepository.ts             ← NOVO
│   └── rompimentoCPRepository.ts      ← NOVO
├── screens/
│   └── concreto/                      ← NOVO DIRETÓRIO
│       ├── ConcretoMenuScreen.tsx     (sub-menu: Concreto, Armadura, Formas, CP)
│       ├── ConcretoFormScreen.tsx
│       ├── ConcretoListScreen.tsx
│       ├── ArmaduraFormScreen.tsx
│       ├── ArmaduraListScreen.tsx
│       ├── FormaFormScreen.tsx
│       ├── FormaListScreen.tsx
│       ├── RompimentoCPFormScreen.tsx
│       └── RompimentoCPListScreen.tsx
```

---

### FASE 4 — Módulo Vedação

#### 4.1 — Novo Model

```typescript
// src/models/VedacaoInspecao.ts
export interface VedacaoInspecao {
  id: string;
  obra_id: string;
  data: string;
  tipo_vedacao: 'alvenaria' | 'drywall';
  local_descricao: string;
  material_conforme: boolean;
  base_nivelada: boolean;
  prumo_alinhamento_ok: boolean;
  junta_adequada: boolean;
  amarracao_ok: boolean;
  vergas_contravergas_ok: boolean;
  fixacao_adequada: boolean;
  ausencia_trincas: boolean;
  limpeza_ok: boolean;
  observacoes: string;
  assinatura_path?: string;
  created_at: string;
}
```

#### 4.2 — Checklist de Vedação (9 itens)

```typescript
vedacao: [
  { descricao: 'Material conforme especificação', ordem: 1 },
  { descricao: 'Base nivelada', ordem: 2 },
  { descricao: 'Prumo e alinhamento corretos', ordem: 3 },
  { descricao: 'Junta com espessura adequada', ordem: 4 },
  { descricao: 'Amarração correta', ordem: 5 },
  { descricao: 'Vergas e contravergas executadas', ordem: 6 },
  { descricao: 'Fixação adequada (drywall)', ordem: 7 },
  { descricao: 'Ausência de trincas', ordem: 8 },
  { descricao: 'Limpeza da execução', ordem: 9 },
],
```

#### 4.3 — Novos Arquivos

```
src/
├── models/
│   └── VedacaoInspecao.ts             ← NOVO
├── database/repositories/
│   └── vedacaoRepository.ts           ← NOVO
├── screens/
│   └── vedacao/                       ← NOVO DIRETÓRIO
│       ├── VedacaoListScreen.tsx
│       └── VedacaoFormScreen.tsx
```

---

### FASE 5 — Módulo Avançado de Pavimentação

#### 5.1 — Novos Models

```typescript
// src/models/PavimentacaoInspecao.ts
export interface PavimentacaoInspecao {
  id: string;
  obra_id: string;
  data: string;
  trecho: string;
  camada: 'subleito' | 'sub_base' | 'base' | 'cbuq';
  espessura?: number;
  compactacao_ok: boolean;
  umidade_ok: boolean;
  temperatura?: number;
  latitude?: number;
  longitude?: number;
  km_inicio: string;
  km_fim: string;
  observacoes: string;
  assinatura_path?: string;
  created_at: string;
}

// src/models/PavimentacaoEnsaio.ts
export interface PavimentacaoEnsaio {
  id: string;
  obra_id: string;
  pavimentacao_inspecao_id?: string;
  data: string;
  trecho: string;
  tipo_ensaio: 'grau_compactacao' | 'densidade_in_situ' | 'teor_ligante' | 'marshall';
  resultado?: number;
  unidade: string;
  conforme: boolean;
  observacoes: string;
  created_at: string;
}
```

#### 5.2 — Checklists por Camada (25+ itens no total)

```typescript
// src/constants/pavimentacaoTypes.ts ← NOVO

export const PAVIMENTACAO_CHECKLISTS = {
  subleito: [
    { descricao: 'Cota conferida', ordem: 1 },
    { descricao: 'Regularização do subleito', ordem: 2 },
    { descricao: 'Compactação conforme projeto', ordem: 3 },
    { descricao: 'Umidade adequada', ordem: 4 },
    { descricao: 'Ensaio de compactação realizado', ordem: 5 },
    { descricao: 'Liberação para próxima camada', ordem: 6 },
  ],
  sub_base: [
    { descricao: 'Material aprovado', ordem: 1 },
    { descricao: 'Espessura conforme projeto', ordem: 2 },
    { descricao: 'Umidade ótima', ordem: 3 },
    { descricao: 'Compactação atingida', ordem: 4 },
    { descricao: 'Ensaio de densidade realizado', ordem: 5 },
    { descricao: 'Superfície regularizada', ordem: 6 },
  ],
  base: [
    { descricao: 'Material (BGS/BGTC) conforme projeto', ordem: 1 },
    { descricao: 'Espessura conferida', ordem: 2 },
    { descricao: 'Compactação adequada', ordem: 3 },
    { descricao: 'Ensaio de controle executado', ordem: 4 },
    { descricao: 'Regularidade superficial', ordem: 5 },
    { descricao: 'Liberação para revestimento', ordem: 6 },
  ],
  cbuq: [
    { descricao: 'Temperatura da mistura adequada', ordem: 1 },
    { descricao: 'Limpeza da base', ordem: 2 },
    { descricao: 'Aplicação uniforme', ordem: 3 },
    { descricao: 'Espessura conforme projeto', ordem: 4 },
    { descricao: 'Compactação (rolo) adequada', ordem: 5 },
    { descricao: 'Acabamento sem segregação', ordem: 6 },
    { descricao: 'Controle de usina registrado', ordem: 7 },
  ],
};
```

#### 5.3 — Campos Dinâmicos no Formulário

```
Se camada = "subleito" | "sub_base" | "base":
  → Compactação OK? (toggle)
  → Umidade OK? (toggle)
  → Espessura (input numérico)

Se camada = "cbuq":
  → Temperatura °C (input numérico)
  → Espessura (input numérico)
  → Compactação OK? (toggle)
```

#### 5.4 — Dashboard de Pavimentação

```typescript
// Indicadores:
{
  percentualCompactacaoConforme: number;   // % inspeções com compactacao_ok=true
  totalEnsaiosRealizados: number;          // COUNT(pavimentacao_ensaios)
  ncPorTrecho: { trecho: string; count: number }[];
  controleTemperaturaCBUQ: {
    media: number;
    min: number;
    max: number;
    foraRange: number;  // count fora de 107-177°C
  };
}
```

#### 5.5 — NC Automática de Pavimentação

```typescript
// Regra: Se compactacao_ok = false OU ensaio conforme = false → Criar RNC
async function checkAndCreateNC(inspecaoId: string, obraId: string): Promise<void> {
  // Verificar compactação
  // Verificar ensaios
  // Se NC necessária: rncRepository.createRNC({ ...dados, origem_tipo: 'pavimentacao', origem_id })
}
```

#### 5.6 — Geolocalização de Obra Linear

- Campos `km_inicio` e `km_fim` no formato "KM XX+XXX"
- Validação de formato via regex: `/^KM\s*\d+\+\d{3}$/`
- GPS automático para referência cruzada
- Agrupamento de dados por trecho nos relatórios

#### 5.7 — Novos Arquivos

```
src/
├── constants/
│   └── pavimentacaoTypes.ts           ← NOVO
├── models/
│   ├── PavimentacaoInspecao.ts        ← NOVO
│   └── PavimentacaoEnsaio.ts          ← NOVO
├── database/repositories/
│   ├── pavimentacaoRepository.ts      ← NOVO
│   └── pavimentacaoEnsaioRepository.ts ← NOVO
├── screens/
│   └── pavimentacao/                  ← NOVO DIRETÓRIO
│       ├── PavimentacaoMenuScreen.tsx  (Nova Inspeção / Ensaios / Relatórios)
│       ├── PavimentacaoFormScreen.tsx  (campos dinâmicos por camada)
│       ├── PavimentacaoListScreen.tsx
│       ├── PavimentacaoEnsaioFormScreen.tsx
│       ├── PavimentacaoEnsaioListScreen.tsx
│       └── PavimentacaoDashboardScreen.tsx
```

---

### FASE 6 — Cross-cutting + Nova Navegação + PDF

#### 6.1 — Serviço de NC Automática

```typescript
// src/services/ncAutomaticaService.ts

export async function verificarEGerarNC(params: {
  obraId: string;
  origemTipo: string;      // 'fundacao' | 'concreto' | 'pavimentacao' | ...
  origemId: string;
  descricao: string;
  gravidade: 'baixa' | 'media' | 'alta';
}): Promise<string | null> {
  // Cria RNC automaticamente vinculada à origem
  // Retorna id da NC criada, ou null se não necessário
}
```

**Pontos de Integração:**
- Fundação: falha em checklist crítico → NC alta
- Concreto: slump fora do range ou Fck não atingido → NC média/alta
- Armadura: não conforme ao projeto → NC alta
- Vedação: prumo/alinhamento fora → NC média
- Pavimentação: compactação insuficiente → NC média
- Rompimento CP: resistência < fck × 0.95 → NC alta

#### 6.2 — Nova Estrutura de Navegação

```
BottomTabNavigator (5 tabs — mantém padrão mobile)
├── Tab: Home
│   └── HomeScreen (dashboard expandido)
│
├── Tab: Projetos (Obras)
│   └── Stack
│       ├── ObrasListScreen
│       └── ObraFormScreen
│
├── Tab: Inspeções (HUB central)
│   └── Stack
│       ├── InspectionHubScreen ← NOVO (grid de módulos)
│       │   ├── Fundação Rasa
│       │   ├── Fundação Profunda
│       │   ├── Bloco de Coroamento
│       │   ├── Concreto
│       │   ├── Armadura
│       │   ├── Formas
│       │   ├── Vedação
│       │   ├── Pavimentação
│       │   └── OAE
│       ├── InspectionFormScreen (existente — fundação rasa, OAE)
│       ├── FundacaoTypeScreen
│       ├── FundacaoFormScreen
│       ├── ConcretoFormScreen
│       ├── ArmaduraFormScreen
│       ├── FormaFormScreen
│       ├── VedacaoFormScreen
│       ├── PavimentacaoFormScreen
│       └── InspectionListScreen (unificada, com filtro)
│
├── Tab: Ensaios
│   └── Stack
│       ├── EnsaioMenuScreen ← NOVO (hub)
│       │   ├── Concreto (existente)
│       │   ├── Graute (existente)
│       │   ├── Pavimentação (existente)
│       │   ├── Rompimento CP ← NOVO
│       │   └── Ensaios Pavimentação ← NOVO
│       ├── EnsaioFormScreen (existente)
│       ├── RompimentoCPFormScreen
│       ├── PavimentacaoEnsaioFormScreen
│       └── EnsaioListScreen (unificada)
│
└── Tab: Mais
    └── Stack
        ├── MoreMenuScreen
        ├── RNCList / RNCForm
        ├── DiaryList / DiaryForm
        ├── Reports
        └── PavimentacaoDashboard ← NOVO
```

#### 6.3 — Dashboard Home Expandido

```typescript
// Indicadores atualizados:
{
  obrasAtivas: number;           // existente
  inspecoesHoje: number;         // existente (agora inclui todos os módulos)
  ncAbertas: number;             // existente
  ensaiosPendentes: number;      // NOVO
  fundacoesEmExecucao: number;   // NOVO
  cpPendentes: number;           // NOVO (CPs que atingiram idade sem resultado)
}
```

#### 6.4 — Novos Templates PDF

```
Relatórios adicionais:
1. PDF de Fundação Profunda — dados técnicos + checklist + fotos + assinatura
2. PDF de Concreto — fck, slump, temp + checklist + rastreabilidade
3. PDF de Armadura — diâmetros, espaçamento, conformidade
4. PDF de Vedação — checklist completo + fotos
5. PDF de Pavimentação — por trecho/camada + ensaios + fotos
6. PDF de Rompimento CP — tabela de idades + gráfico de resistência
7. PDF Consolidado de Obra — resumo de todos os módulos
```

#### 6.5 — Expansão do Modelo de Photos

```typescript
// entity_type expandido:
type EntityType =
  | 'inspection' | 'rnc' | 'diary' | 'ensaio'
  | 'fundacao' | 'concreto' | 'armadura' | 'formas'
  | 'vedacao' | 'pavimentacao' | 'pav_ensaio' | 'rompimento_cp';
```

---

## 4. RESUMO DE ARQUIVOS POR FASE

### Total de Novos Arquivos: ~35

| Fase | Novos Arquivos | Arquivos Modificados |
|---|---|---|
| **Fase 1** | 0 | `migrations.ts`, `connection.ts` |
| **Fase 2** | 7 | `inspectionTypes.ts`, `types.ts`, `AppNavigator.tsx`, `MoreMenuScreen.tsx` |
| **Fase 3** | 13 | `inspectionTypes.ts`, `types.ts`, `AppNavigator.tsx` |
| **Fase 4** | 4 | `types.ts`, `AppNavigator.tsx` |
| **Fase 5** | 9 | `types.ts`, `AppNavigator.tsx`, `AppContext.tsx` |
| **Fase 6** | 3+ | `HomeScreen.tsx`, `pdfService.ts`, `AppContext.tsx`, `photoRepository.ts` |

---

## 5. DECISÕES ARQUITETURAIS

### 5.1 — Tabelas Dedicadas vs. Tabela Genérica

**Decisão:** Tabelas dedicadas por módulo (não uma tabela genérica com JSON).

**Justificativa:**
- Type-safety com TypeScript
- Queries SQL otimizadas com índices específicos
- Validação via CHECK constraints
- Relatórios PDF com queries diretas
- Sem necessidade de parsear JSON em runtime

### 5.2 — Dados Técnicos de Fundação: Colunas Fixas vs. Chave-Valor

**Decisão:** Tabela chave-valor `fundacao_dados_tecnicos`.

**Justificativa:**
- 6 tipos de fundação com campos muito diferentes
- Evita 20+ colunas nullable na tabela principal
- Flexível para adicionar novos campos sem migration
- Template de campos definido no TypeScript (`FUNDACAO_DADOS_TECNICOS`)

### 5.3 — Checklist: Tabela Fixa vs. Dinâmica

**Decisão:** Manter padrão existente — itens criados no momento da inspeção a partir de templates TypeScript.

**Justificativa:**
- Consistência com sistema atual (`INSPECTION_CHECKLISTS`)
- Checklist fica "congelado" no momento da inspeção
- Atualizações futuras de templates não afetam inspeções antigas

### 5.4 — NC Automática: Síncrona vs. Assíncrona

**Decisão:** Síncrona, após salvar o registro (mesma transação ou logo após).

**Justificativa:**
- Garantia de que NC é criada imediatamente
- Sem necessidade de background jobs em app offline
- Feedback imediato ao usuário: "NC #XX criada automaticamente"

### 5.5 — Navegação: Mais Tabs vs. Hub de Inspeção

**Decisão:** Manter 5 tabs, criar "Hub de Inspeção" como tela de seleção de módulo.

**Justificativa:**
- Padrão mobile: máximo 5 tabs na barra inferior
- Hub centraliza acesso a todos os tipos de inspeção
- Evita confusão com muitas tabs
- Escalável para futuros módulos

---

## 6. IMPACTO EM COMPONENTES EXISTENTES

| Componente | Impacto | Ação |
|---|---|---|
| `ChecklistItemRow.tsx` | Nenhum — já é genérico | Manter |
| `PhotoPicker.tsx` | Aceitar novos `entity_type` | Ajustar validação |
| `SignatureCapture.tsx` | Nenhum — já é genérico | Manter |
| `FormField.tsx` | Nenhum | Manter |
| `SelectField.tsx` | Nenhum | Manter |
| `SeverityBadge.tsx` | Nenhum | Manter |
| `StatusBadge.tsx` | Novos status possíveis | Adicionar cores |
| `Header.tsx` | Nenhum | Manter |
| `StatCard.tsx` | Nenhum | Manter |
| `MenuButton.tsx` | Nenhum | Manter |
| `DatePickerField.tsx` | Nenhum | Manter |
| `FormSection.tsx` | Nenhum | Manter |
| `FormNotice.tsx` | Nenhum | Manter |

### Novos Componentes Necessários:

| Componente | Descrição |
|---|---|
| `ToggleField.tsx` | Campo boolean com toggle visual (compactação OK, etc.) |
| `KmField.tsx` | Input formatado "KM XX+XXX" com validação |
| `DynamicFieldGroup.tsx` | Renderiza campos condicionais por seleção |
| `DashboardCard.tsx` | Card com indicador + ícone para dashboards |
| `InspectionHubButton.tsx` | Botão de módulo para o Hub de Inspeção |

---

## 7. ESTIMATIVA DE COMPLEXIDADE

| Fase | Complexidade | Novos Arquivos | Arquivos Alterados | Linhas Estimadas |
|---|---|---|---|---|
| Fase 1 | Média | 0 | 2 | ~200 |
| Fase 2 | Alta | 7 | 4 | ~1.500 |
| Fase 3 | Alta | 13 | 3 | ~2.500 |
| Fase 4 | Baixa | 4 | 2 | ~600 |
| Fase 5 | Muito Alta | 9 | 4 | ~2.200 |
| Fase 6 | Alta | 5+ | 6 | ~1.500 |
| **TOTAL** | — | **~38** | **~15** | **~8.500** |

---

## 8. CHECKLIST DE VALIDAÇÃO POR FASE

### Antes de iniciar cada fase:
- [ ] Fase anterior completa e testada
- [ ] Banco de dados migra corretamente (dados existentes preservados)
- [ ] App compila sem erros TypeScript
- [ ] Navegação funciona sem crashes

### Validação por fase:

**Fase 1:**
- [ ] Migration versionada roda sem erro
- [ ] Tabela `_migrations` registra versão
- [ ] Dados existentes não são perdidos
- [ ] App inicia normalmente após migration

**Fase 2:**
- [ ] Cadastro de fundação profunda (6 tipos)
- [ ] Checklist específico carrega por tipo
- [ ] Dados técnicos salvos corretamente
- [ ] Fotos vinculadas à fundação
- [ ] GPS capturado
- [ ] PDF de fundação gerado

**Fase 3:**
- [ ] Inspeção de concreto com campos específicos
- [ ] Inspeção de armadura funcional
- [ ] Inspeção de formas funcional
- [ ] Rompimento CP com cálculo de conformidade
- [ ] Alertas automáticos gerados
- [ ] PDFs de cada sub-módulo

**Fase 4:**
- [ ] Inspeção de vedação (alvenaria + drywall)
- [ ] Checklist de 9 itens funcional
- [ ] PDF de vedação

**Fase 5:**
- [ ] Inspeção por camada com campos dinâmicos
- [ ] 4 tipos de ensaio tecnológico
- [ ] Dashboard com indicadores
- [ ] NC automática ao falhar
- [ ] KM/trecho com validação
- [ ] PDF de pavimentação completo

**Fase 6:**
- [ ] Hub de inspeção com todos os módulos
- [ ] NC automática integrada em todos os módulos
- [ ] Dashboard home atualizado
- [ ] Todos os PDFs funcionais
- [ ] Navegação fluida entre módulos

---

## 9. DIAGRAMA DE DEPENDÊNCIAS

```
Fase 1 (Schema)
    ├─→ Fase 2 (Fundações)
    │       └─→ Fase 6 (Cross-cutting)
    ├─→ Fase 3 (Concreto)
    │       └─→ Fase 6
    ├─→ Fase 4 (Vedação)
    │       └─→ Fase 6
    └─→ Fase 5 (Pavimentação)
            └─→ Fase 6

Fases 2, 3, 4, 5 podem ser desenvolvidas EM PARALELO
(desde que Fase 1 esteja completa)

Fase 6 requer TODAS as anteriores completas
```

---

## 10. RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Perda de dados em migration | Média | Crítico | Backup antes de migration + rollback |
| Muitas telas = navegação confusa | Alta | Médio | Hub de inspeção centralizado |
| Performance com muitas tabelas | Baixa | Médio | Índices otimizados + queries paginadas |
| Complexidade do formulário dinâmico | Média | Médio | Componente `DynamicFieldGroup` reutilizável |
| Checklist muito longo = UX ruim | Média | Médio | Seções colapsáveis no checklist |
| 38+ novos arquivos = manutenção | Alta | Médio | Padrão de código consistente + types |

---

*Roadmap gerado em Abril 2026 — Inspetor Civil 360 V2*
