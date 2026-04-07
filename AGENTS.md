# INSPETOR CIVIL 360 — Agent Ecosystem v2.0

> Neural Chain Architecture — 10 agentes, 4 camadas, 6 skills especializadas

---

## Visão Geral da Arquitetura

```
Solicitação do Usuário
     │
     ▼
┌─────────────────────────────────────────────────┐
│         CAMADA 1 — ORQUESTRADORES               │
│   Orquestrador │ Guardiao │ Planejador          │
└───────┬──────────────┬──────────────┬───────────┘
        │              │              │
        ▼              ▼              ▼
┌──────────────────┐          ┌──────────────────┐
│   CAMADA 2       │          │   CAMADA 4       │
│   Especialistas  │          │   Workers        │
│   de Domínio     │          │   (subagent)     │
├──────────────────┤          ├──────────────────┤
│ MobileUI         │          │ Analisador (R/O) │
│ BancoDados       │          │ Implementador(RW)│
│ Inspecao         │          │ Revisor (R/O)    │
│ Relatorios       │          │                  │
└──────────────────┘          └──────────────────┘
```

---

## Registro de Agentes

### Camada 1 — Orquestradores

| Agente | Propósito | Invocação |
|--------|-----------|-----------|
| **Orquestrador** | Execução coordenada em 5 fases | `@Orquestrador` |
| **Guardiao** | Flywheel de qualidade (O-D-P-E-V-L) | `@Guardiao` |
| **Planejador** | Planejamento arquitetural + decomposição | `@Planejador` |

### Camada 2 — Especialistas de Domínio

| Agente | Domínio | Pattern de Arquivo |
|--------|---------|-------------------|
| **MobileUI** | React Native + Expo — telas, componentes, navegação | `src/screens/**`, `src/components/**` |
| **BancoDados** | SQLite + migrations — schema, repositories, queries | `src/database/**`, `src/models/**` |
| **Inspecao** | Engenharia civil — normas ABNT/DNIT, checklists, conformidade | `src/constants/*Types.ts` |
| **Relatorios** | PDF + dashboards — templates HTML, indicadores, exportação | `src/services/pdfService.ts` |

### Camada 3 — Qualidade (integrada na Camada 1)

Guardiao opera como flywheel contínuo de qualidade, ativado após cada feature.

### Camada 4 — Workers (subagent-only)

| Agente | Papel | Permissões |
|--------|-------|------------|
| **Analisador** | Pesquisa read-only, análise, investigação | R/O |
| **Implementador** | Escrita de código, features, bugs, fixes | R/W |
| **Revisor** | Code review em 4 perspectivas | R/O |

---

## Matriz de Execução — Roteamento por Tarefa

### Por Tipo de Tarefa → Agente

| Tarefa | Agente Primário | Agentes Suporte | Skill |
|--------|----------------|-----------------|-------|
| **Nova tela / componente** | @MobileUI | @Implementador | — |
| **Nova tabela / migration** | @BancoDados | — | criar-migration |
| **Novo repository** | @BancoDados | @Implementador | — |
| **Novo checklist / norma** | @Inspecao | — | checklist-norma |
| **Novo template PDF** | @Relatorios | — | gerar-pdf |
| **NC automática** | @Inspecao | @BancoDados | nc-automatica |
| **Feature completa (módulo)** | @Orquestrador | Todos | implementar-modulo |
| **Code review** | @Revisor | @Guardiao | code-review |
| **Planejamento de feature** | @Planejador | @Analisador | — |
| **Bug investigation** | @Analisador | — | — |
| **Refactoring** | @Guardiao | @Implementador | — |
| **Dashboard / indicadores** | @Relatorios | @BancoDados | dashboard |
| **Segurança / auditoria** | @Guardiao | @Revisor | auditoria-seguranca |

### Por Fase do Roadmap V2 → Agentes

| Fase | Descrição | Agentes Envolvidos | Ordem |
|------|-----------|-------------------|-------|
| **Fase 1** | Schema Evolution + Migrations | @BancoDados → @Guardiao | Sequencial |
| **Fase 2** | Módulo Fundações | @BancoDados → @Inspecao → @MobileUI → @Relatorios | Sequencial |
| **Fase 3** | Concreto / Estrutura | @BancoDados → @Inspecao → @MobileUI → @Relatorios | Sequencial |
| **Fase 4** | Vedação | @BancoDados → @Inspecao → @MobileUI → @Relatorios | Sequencial |
| **Fase 5** | Pavimentação Avançada | @BancoDados → @Inspecao → @MobileUI → @Relatorios | Sequencial |
| **Fase 6** | Cross-cutting + Nav + PDF | @Orquestrador → Todos | Coordenado |

### Por Padrão de Arquivo → Agente + Instruction

| Padrão de Arquivo | Agente | Instruction |
|--------------------|--------|-------------|
| `src/screens/**/*.tsx` | @MobileUI | react-native-patterns |
| `src/components/**/*.tsx` | @MobileUI | react-native-patterns |
| `src/database/**/*.ts` | @BancoDados | sqlite-patterns |
| `src/database/migrations.ts` | @BancoDados | sqlite-patterns |
| `src/models/**/*.ts` | @BancoDados | typescript-standards |
| `src/constants/*Types.ts` | @Inspecao | inspection-types |
| `src/constants/theme.ts` | @MobileUI | typescript-standards |
| `src/services/pdfService.ts` | @Relatorios | pdf-patterns |
| `src/services/ncAutomaticaService.ts` | @Inspecao | typescript-standards |
| `src/navigation/**/*.ts{x}` | @MobileUI | react-native-patterns |
| `src/contexts/**/*.tsx` | @MobileUI | react-native-patterns |
| `src/utils/**/*.ts` | @Implementador | typescript-standards |

---

## Fluxo de Execução de Feature

```
Usuário solicita feature
     │
     ▼
┌─────────────────────────────────────────┐
│ @Planejador → Plano estruturado         │
│   - Design técnico                      │
│   - Decomposição em tarefas             │
│   - Atribuição a agentes                │
└───────┬─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│ @Orquestrador → Coordena execução       │
│                                         │
│  FASE A: Dados                          │
│  ├─ @BancoDados → Migration + Model     │
│  └─ @BancoDados → Repository            │
│                                         │
│  FASE B: Domínio (paralelo com C)       │
│  ├─ @Inspecao → Checklists + Normas     │
│  └─ @Inspecao → NC Automática           │
│                                         │
│  FASE C: UI (paralelo com B)            │
│  ├─ @MobileUI → Tela Form              │
│  ├─ @MobileUI → Tela List              │
│  └─ @MobileUI → Navegação              │
│                                         │
│  FASE D: Relatórios                     │
│  └─ @Relatorios → Template PDF          │
│                                         │
│  FASE E: Dashboard                      │
│  └─ @Relatorios → Indicadores           │
└───────┬─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│ @Guardiao → Flywheel de Qualidade       │
│   - Import Verification Chain           │
│   - Consistência Model↔Migration↔Repo   │
│   - Padrões de stack                    │
│   - Segurança (SQL, sanitização)        │
└───────┬─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│ @Revisor → Review Final (R/O)           │
│   - Correção, Qualidade, Segurança, Arq │
└─────────────────────────────────────────┘
```

---

## Guardian Flywheel (Melhoria Contínua)

```
     ┌──────────┐
     │ OBSERVAR │ ← Scan de mudanças, métricas, padrões
     └────┬─────┘
          ▼
     ┌──────────┐
     │DIAGNOSTICAR│ ← Anti-patterns, dívida, oportunidades
     └────┬─────┘
          ▼
     ┌──────────┐
     │PRESCREVER│ ← Plano de melhoria acionável
     └────┬─────┘
          ▼
     ┌──────────┐
     │ EXECUTAR │ ← Delegar para agentes de domínio
     └────┬─────┘
          ▼
     ┌──────────┐
     │ VERIFICAR│ ← tsc --noEmit, consistência, regressões
     └────┬─────┘
          ▼
     ┌──────────┐
     │ APRENDER │ ← Registrar padrões na memória
     └────┬─────┘
          │
          └──────► OBSERVAR (ciclo contínuo)
```

---

## Skills Disponíveis

| Skill | Descrição | Agente |
|-------|-----------|--------|
| `implementar-modulo` | Pipeline completa schema→model→repo→screen→nav→PDF | @Orquestrador |
| `checklist-norma` | Gerar checklist baseado em norma ABNT/DNIT | @Inspecao |
| `nc-automatica` | Implementar regras de NC automática para um módulo | @Inspecao |
| `gerar-pdf` | Criar template PDF profissional para um módulo | @Relatorios |
| `dashboard` | Implementar indicadores consolidados de um módulo | @Relatorios |
| `migration-segura` | Criar migration versionada com rollback plan | @BancoDados |

Detalhes completos em `.copilot/skills/`.

---

## Instructions (Aplicação por Padrão de Arquivo)

| Arquivo | Instrução |
|---------|-----------|
| `**/*.tsx` | react-native-patterns |
| `src/**/*.ts` | typescript-standards |
| `src/database/**/*.ts` | sqlite-patterns |
| `src/services/pdfService.ts` | pdf-patterns |
| `src/constants/*Types.ts` | inspection-types |

---

## Prompts Reutilizáveis

| Prompt | Descrição |
|--------|-----------|
| `implementar-modulo` | Implementar módulo completo de inspeção (schema → tela) |
| `code-review` | Code review completo em 4 perspectivas |
| `criar-migration` | Criar nova migration versionada |
| `auditoria-seguranca` | Auditoria de segurança (SQL, dados, sanitização) |

---

## Stack do Projeto

```yaml
framework: React Native + Expo SDK 52+
linguagem: TypeScript strict
navegação: React Navigation v7
banco: expo-sqlite (SQLite local)
estado: React Context + useReducer
estilização: StyleSheet.create
ícones: MaterialCommunityIcons
datas: date-fns (pt-BR)
PDF: expo-print + expo-sharing
```
