# INSPETOR CIVIL 360 — CLAUDE.md 

> Contexto do projeto para Claude em todas as interfaces (Copilot, Claude Code, API)

---

## Projeto

**Inspetor Civil 360** — Aplicativo mobile de inspeção de obras civis para engenheiros e inspetores brasileiros. Funciona 100% offline, com banco de dados local (SQLite), geração de PDF e câmera integrada.

## Stack

```yaml
framework: React Native + Expo SDK 52+ (Managed Workflow)
linguagem: TypeScript strict
navegação: React Navigation v7 (bottom-tabs + native-stack)
banco: expo-sqlite (SQLite local, offline-first)
estado: React Context + useReducer
câmera: expo-camera + expo-image-picker
PDF: expo-print + expo-sharing
assinatura: react-native-signature-canvas
ícones: MaterialCommunityIcons (@expo/vector-icons)
datas: date-fns (pt-BR)
```

## Arquitetura

```
src/
├── components/    # Componentes reutilizáveis (Header, StatCard, FormField, etc.)
├── constants/     # Tipos de inspeção, tema, normas ABNT/DNIT
├── contexts/      # React Context (AppContext com estado global)
├── database/      # SQLite — connection, migrations, repositories
├── models/        # Interfaces TypeScript (entidades do domínio)
├── navigation/    # React Navigation stacks + tabs
├── screens/       # Telas organizadas por módulo
├── services/      # PDF, fotos, localização, NC automática
└── utils/         # Utilitários (formatDate, generateId, validators)
```

## Regras Críticas

1. **NÃO usar**: Redux, Zustand, TailwindCSS, NativeWind, expo-router, web-specific libs
2. **SEMPRE usar**: SafeAreaView, COLORS do theme.ts, generateId() para UUIDs, parameterized queries
3. **Toda entidade** deve ter `obra_id` (vinculada a uma obra)
4. **100% offline-first** — sem dependência de internet
5. **Migrations versionadas** — NUNCA alterar migration já aplicada
6. **Sanitização HTML** no PDF — escapeHtml() em todos os dados do usuário
7. **snake_case** para colunas do banco, **camelCase** para variáveis JS/TS

## Domínio

Engenharia civil brasileira. O app implementa:
- Inspeções com checklists baseados em normas ABNT/DNIT
- Registro de Não Conformidade (RNC) com fluxo aberta→em_andamento→fechada
- Ensaios de concreto, graute e pavimentação com alertas automáticos
- Diário de obra (registro diário de atividades)
- Relatórios PDF profissionais com fotos e assinatura digital
- NC automática gerada a partir de itens não conformes

## Expansão V2 (Roadmap)

6 fases de expansão:
1. **Schema Evolution** — Novas tabelas (fundações, concreto, armadura, formas, vedação, pavimentação)
2. **Fundações** — 6 tipos de estaca com checklists e dados técnicos
3. **Concreto/Estrutura** — Inspeções de concreto, armadura e formas + rompimento CP
4. **Vedação** — Alvenaria e drywall com 9 itens de checklist
5. **Pavimentação Avançada** — 4 camadas, ensaios específicos, dashboard por KM
6. **Cross-cutting** — NC automática em todos módulos, dashboard expandido, PDF novos

## Agentes

O projeto usa 10 agentes especializados definidos em `.github/agents/`:
- **Orquestrador, Guardiao, Planejador** (Camada 1 — Coordenação)
- **MobileUI, BancoDados, Inspecao, Relatorios** (Camada 2 — Domínio)
- **Implementador, Revisor, Analisador** (Camada 4 — Workers)

Skills em `.copilot/skills/` e prompts em `.github/prompts/`.

## Comandos

```bash
npx expo start          # Iniciar dev server
npx tsc --noEmit        # Type check
npx expo lint           # Lint
eas build --profile preview --platform android  # Build Android
```
