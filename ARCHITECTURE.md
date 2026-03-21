# INSPETOR CIVIL 360 — Arquitetura do Sistema

> **Aplicativo mobile para inspeção de obras civis**  
> *by Prof. José Vital*

---

## 1. Visão Geral

O **Inspetor Civil 360** é um aplicativo mobile multiplataforma (iOS e Android) voltado para engenheiros civis e inspetores de obras. Permite realizar inspeções de campo com checklists, registrar não conformidades, acompanhar ensaios técnicos, manter diário de obra e gerar relatórios profissionais em PDF — tudo com funcionamento offline.

---

## 2. Stack Tecnológico

| Camada | Tecnologia | Justificativa |
|---|---|---|
| **Framework** | React Native + Expo SDK 52 | Multiplataforma, ecossistema maduro, acesso a APIs nativas |
| **Linguagem** | TypeScript | Tipagem estática, produtividade, manutenção |
| **Navegação** | React Navigation v6 | Padrão da indústria para RN |
| **Banco de Dados** | expo-sqlite | Persistência local SQLite, offline-first |
| **Estado Global** | React Context + useReducer | Simplicidade, sem dependência extra |
| **Câmera** | expo-camera | Captura de fotos in-app |
| **Localização** | expo-location | GPS automático nas inspeções |
| **Arquivos** | expo-file-system | Armazenamento de fotos e PDFs |
| **PDF** | expo-print + expo-sharing | Geração e compartilhamento de relatórios |
| **Assinatura** | react-native-signature-canvas | Captura de assinatura digital |
| **UI** | Componentes customizados | Design fiel ao protótipo |
| **Ícones** | @expo/vector-icons (MaterialCommunityIcons) | Iconografia consistente |
| **Datas** | date-fns | Manipulação de datas em pt-BR |

---

## 3. Estrutura de Diretórios

```
InsperotCivil360/
├── app.json
├── App.tsx                          # Entry point
├── package.json
├── tsconfig.json
├── babel.config.js
├── ARCHITECTURE.md
│
├── src/
│   ├── constants/
│   │   ├── theme.ts                 # Cores, fontes, espaçamentos
│   │   └── inspectionTypes.ts       # Tipos e checklists de inspeção
│   │
│   ├── database/
│   │   ├── connection.ts            # Inicialização SQLite
│   │   ├── migrations.ts            # Criação de tabelas
│   │   └── repositories/
│   │       ├── obraRepository.ts
│   │       ├── inspectionRepository.ts
│   │       ├── rncRepository.ts
│   │       ├── ensaioRepository.ts
│   │       └── diaryRepository.ts
│   │
│   ├── models/
│   │   ├── Obra.ts
│   │   ├── Inspection.ts
│   │   ├── ChecklistItem.ts
│   │   ├── RNC.ts
│   │   ├── Ensaio.ts
│   │   ├── DiaryEntry.ts
│   │   └── Photo.ts
│   │
│   ├── contexts/
│   │   └── AppContext.tsx           # Estado global
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx         # Stack principal
│   │   ├── BottomTabNavigator.tsx   # Tab bar inferior
│   │   └── types.ts                # Tipagem das rotas
│   │
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── obras/
│   │   │   ├── ObrasListScreen.tsx
│   │   │   └── ObraFormScreen.tsx
│   │   ├── inspection/
│   │   │   ├── InspectionTypeScreen.tsx
│   │   │   ├── InspectionFormScreen.tsx
│   │   │   └── InspectionListScreen.tsx
│   │   ├── rnc/
│   │   │   ├── RNCListScreen.tsx
│   │   │   └── RNCFormScreen.tsx
│   │   ├── ensaios/
│   │   │   ├── EnsaioListScreen.tsx
│   │   │   └── EnsaioFormScreen.tsx
│   │   ├── diary/
│   │   │   ├── DiaryListScreen.tsx
│   │   │   └── DiaryFormScreen.tsx
│   │   └── reports/
│   │       └── ReportsScreen.tsx
│   │
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── StatCard.tsx
│   │   ├── MenuButton.tsx
│   │   ├── ChecklistItemRow.tsx
│   │   ├── PhotoPicker.tsx
│   │   ├── SignatureCapture.tsx
│   │   ├── SeverityBadge.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── FormField.tsx
│   │   ├── SelectField.tsx
│   │   ├── DatePickerField.tsx
│   │   └── PDFButton.tsx
│   │
│   ├── services/
│   │   ├── pdfService.ts            # Geração de HTML → PDF
│   │   ├── locationService.ts       # Obter localização GPS
│   │   └── photoService.ts          # Gerenciamento de fotos
│   │
│   └── utils/
│       ├── formatDate.ts
│       ├── generateId.ts
│       └── validators.ts
│
└── assets/
    ├── icon.png
    ├── splash.png
    └── images/
        └── logo.png
```

---

## 4. Modelo de Dados (SQLite)

### 4.1 — obras

| Coluna | Tipo | Descrição |
|---|---|---|
| id | TEXT PK | UUID |
| nome | TEXT NOT NULL | Nome da obra |
| local | TEXT NOT NULL | Localização |
| cliente | TEXT NOT NULL | Nome do cliente |
| tipo | TEXT NOT NULL | 'Rodovia' / 'OAE' / 'Industrial' |
| data_inicio | TEXT NOT NULL | Data de início (ISO 8601) |
| responsavel_tecnico | TEXT NOT NULL | Nome do RT |
| status | TEXT DEFAULT 'ativa' | 'ativa' / 'concluida' / 'paralisada' |
| created_at | TEXT | Timestamp criação |
| updated_at | TEXT | Timestamp atualização |

### 4.2 — inspections

| Coluna | Tipo | Descrição |
|---|---|---|
| id | TEXT PK | UUID |
| obra_id | TEXT FK | Referência à obra |
| tipo | TEXT NOT NULL | 'fundacao' / 'estrutura' / 'oae' / 'pavimentacao' |
| data | TEXT NOT NULL | Data da inspeção |
| local_descricao | TEXT | Descrição do local inspecionado |
| latitude | REAL | Coordenada GPS |
| longitude | REAL | Coordenada GPS |
| observacoes | TEXT | Observações gerais |
| status | TEXT | 'conforme' / 'nao_conforme' / 'pendente' |
| assinatura_path | TEXT | Caminho para imagem da assinatura |
| created_at | TEXT | Timestamp |

### 4.3 — checklist_items

| Coluna | Tipo | Descrição |
|---|---|---|
| id | TEXT PK | UUID |
| inspection_id | TEXT FK | Referência à inspeção |
| descricao | TEXT NOT NULL | Texto do item |
| conforme | INTEGER DEFAULT 0 | 0 = pendente, 1 = conforme, 2 = não conforme |
| observacao | TEXT | Observação do item |
| ordem | INTEGER | Ordem de exibição |

### 4.4 — rnc (Registro de Não Conformidade)

| Coluna | Tipo | Descrição |
|---|---|---|
| id | TEXT PK | UUID |
| numero | INTEGER AUTOINCREMENT | Número sequencial automático |
| obra_id | TEXT FK | Referência à obra |
| data | TEXT NOT NULL | Data do registro |
| descricao | TEXT NOT NULL | Descrição da NC |
| gravidade | TEXT NOT NULL | 'baixa' / 'media' / 'alta' |
| responsavel | TEXT | Responsável pela correção |
| prazo | TEXT | Data prazo |
| status | TEXT DEFAULT 'aberta' | 'aberta' / 'em_andamento' / 'fechada' |
| created_at | TEXT | Timestamp |

### 4.5 — ensaios

| Coluna | Tipo | Descrição |
|---|---|---|
| id | TEXT PK | UUID |
| obra_id | TEXT FK | Referência à obra |
| tipo_ensaio | TEXT NOT NULL | 'concreto' / 'graute' / 'pavimentacao' |
| data | TEXT NOT NULL | Data do ensaio |
| local | TEXT NOT NULL | Local do ensaio |
| slump | REAL | Abatimento (cm) — concreto |
| temperatura | REAL | Temperatura (°C) — concreto |
| corpo_prova | TEXT | Identificação CP — concreto |
| fluidez | REAL | Fluidez — graute |
| resistencia | REAL | Resistência (MPa) — graute |
| compactacao | REAL | Grau de compactação (%) — pavimentação |
| deflexao | REAL | Deflexão Benkelman (0.01mm) — pavimentação |
| resultado | TEXT | Resultado geral textual |
| situacao | TEXT NOT NULL | 'conforme' / 'nao_conforme' |
| alerta | TEXT | Alerta automático gerado |
| created_at | TEXT | Timestamp |

### 4.6 — diary_entries (Diário de Obra)

| Coluna | Tipo | Descrição |
|---|---|---|
| id | TEXT PK | UUID |
| obra_id | TEXT FK | Referência à obra |
| data | TEXT NOT NULL | Data do diário |
| equipe | TEXT | Equipe presente |
| clima | TEXT | 'ensolarado' / 'nublado' / 'chuvoso' / 'parcialmente_nublado' |
| atividades | TEXT NOT NULL | Atividades executadas |
| ocorrencias | TEXT | Ocorrências do dia |
| created_at | TEXT | Timestamp |

### 4.7 — photos

| Coluna | Tipo | Descrição |
|---|---|---|
| id | TEXT PK | UUID |
| entity_type | TEXT NOT NULL | 'inspection' / 'rnc' / 'diary' / 'ensaio' |
| entity_id | TEXT NOT NULL | ID da entidade relacionada |
| uri | TEXT NOT NULL | Caminho do arquivo |
| legenda | TEXT | Legenda da foto |
| created_at | TEXT | Timestamp |

---

## 5. Fluxo de Navegação

```
BottomTabNavigator
├── Tab: Home
│   └── HomeScreen
├── Tab: Projetos (Obras)
│   └── Stack
│       ├── ObrasListScreen
│       └── ObraFormScreen
├── Tab: Inspeção
│   └── Stack
│       ├── InspectionTypeScreen (escolha do tipo)
│       ├── InspectionFormScreen (checklist + fotos + assinatura)
│       └── InspectionListScreen (histórico)
├── Tab: Ensaios
│   └── Stack
│       ├── EnsaioListScreen
│       └── EnsaioFormScreen
└── Tab: Mais
    └── Stack
        ├── RNCListScreen
        ├── RNCFormScreen
        ├── DiaryListScreen
        ├── DiaryFormScreen
        └── ReportsScreen
```

---

## 6. Módulos Funcionais

### 6.1 — Tela Inicial (Home)

- Saudação: "Bem-vindo, {nome}!"
- Banner com imagem de obra
- 3 indicadores (StatCards):
  - Obras Ativas (azul)
  - Inspeções Hoje (azul)
  - Não Conformidades Abertas (azul)
- 6 botões de menu (grid 2x3):
  - Obras | Nova Inspeção
  - Não Conformidades | Ensaios
  - Diário de Obra | Relatórios

### 6.2 — Módulo Obras

- **Lista**: FlatList com cards (nome, local, tipo, status)
- **Formulário**: Campos validados para cadastro/edição
- Tipos de obra: Rodovia, OAE, Industrial
- Status: Ativa, Concluída, Paralisada

### 6.3 — Módulo Inspeção

**Fluxo:**
1. Selecionar obra
2. Escolher tipo de inspeção
3. Preencher checklist específico
4. Adicionar fotos (câmera)
5. Adicionar observações
6. Captura automática de GPS
7. Assinatura digital
8. Salvar / Gerar relatório

**Checklists por tipo:**

| Fundação | OAE |
|---|---|
| Escavação conforme projeto | Bloco de fundação conforme projeto |
| Fundo regularizado | Armadura do pilar conferida |
| Solo adequado | Alinhamento do pilar |
| Armadura conforme projeto | Travessa executada corretamente |
| Cobrimento atendido | Apoio de vigas verificado |
| Espaçadores instalados | Tabuleiro nivelado |
| Forma estanque | Guarda-corpo conforme norma |
| Liberação para concretagem | |

### 6.4 — Módulo RNC

- Número automático sequencial
- Gravidade com cores: 🟢 Baixa | 🟡 Média | 🔴 Alta
- Workflow: Aberta → Em andamento → Fechada
- Geração de PDF individial

### 6.5 — Módulo Ensaios

- 3 categorias: Concreto, Graute, Pavimentação
- Campos dinâmicos por categoria
- Validação com alertas automáticos:
  - Slump fora de 80-120mm → Alerta
  - Temperatura > 35°C → Alerta
  - Compactação < 95% → Alerta
  - Deflexão > 100 (0.01mm) → Alerta

### 6.6 — Diário de Obra

- Registro diário com clima (ícones visuais)
- Atividades e ocorrências em texto livre
- Anexo de fotos do dia

### 6.7 — Relatórios PDF

Template HTML profissional com:
- Logo "Inspetor Civil 360"
- Cabeçalho: Obra, data, inspetor
- Corpo com dados da entidade
- Fotos embarcadas (base64)
- Rodapé com assinatura digital
- Geração via expo-print → compartilhar via expo-sharing

---

## 7. Paleta de Cores e Design

```
Primária:        #1B3A5C (azul escuro — header, botões)
Secundária:      #2E5C8A (azul médio — cards, destaques)
Accent:          #E8762B (laranja — botões de ação, CTA)
Background:      #F5F5F5 (cinza claro — fundo)
Surface:         #FFFFFF (branco — cards)
Texto primário:  #1A1A2E (quase preto)
Texto secundário:#6B7280 (cinza)
Sucesso:         #10B981 (verde — conforme)
Alerta:          #F59E0B (amarelo — atenção)
Erro:            #EF4444 (vermelho — não conforme / alta)
```

---

## 8. Regras de Negócio

1. Toda inspeção deve estar vinculada a uma obra
2. Fotos são salvas localmente no FileSystem
3. GPS é capturado automaticamente ao abrir o formulário de inspeção
4. Número de RNC é gerado automaticamente (sequencial por obra)
5. Alertas de ensaio são calculados automaticamente com base em limites normativos
6. PDFs incluem fotos em base64 para serem autocontidos
7. Assinatura é obrigatória para finalizar inspeção
8. Dados persistem localmente via SQLite (offline-first)

---

## 9. Requisitos Não Funcionais

| Requisito | Especificação |
|---|---|
| Performance | < 200ms para operações de banco |
| Offline | 100% funcional sem internet |
| Armazenamento | SQLite + FileSystem local |
| Segurança | Dados armazenados localmente, sem transmissão |
| Compatibilidade | iOS 14+ / Android 10+ |
| Resolução fotos | Compressão a 80% qualidade, max 1920px |

---

## 10. Dependências do Projeto

```json
{
  "expo": "~52.0.0",
  "react": "18.3.1",
  "react-native": "0.76.x",
  "@react-navigation/native": "^6.x",
  "@react-navigation/bottom-tabs": "^6.x",
  "@react-navigation/native-stack": "^6.x",
  "expo-sqlite": "~14.x",
  "expo-camera": "~16.x",
  "expo-location": "~18.x",
  "expo-file-system": "~18.x",
  "expo-print": "~14.x",
  "expo-sharing": "~13.x",
  "expo-image-picker": "~16.x",
  "react-native-signature-canvas": "^4.x",
  "@expo/vector-icons": "^14.x",
  "date-fns": "^3.x",
  "react-native-safe-area-context": "^4.x",
  "react-native-screens": "^4.x",
  "uuid": "^9.x"
}
```

---

*Documento gerado para o projeto Inspetor Civil 360 — Março 2026*
