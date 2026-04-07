---
description: 'Implementar um módulo completo de inspeção — do schema à tela, seguindo o padrão do Inspetor Civil 360'
---

# Implementar Módulo de Inspeção

Siga a ordem abaixo para implementar um novo módulo de inspeção no Inspetor Civil 360.

## Etapas

### 1. Migration (src/database/migrations.ts)
- Adicionar nova Migration com version incremental
- CREATE TABLE com id TEXT PK, obra_id FK, campos específicos
- CREATE INDEX para obra_id e outras FKs
- CHECK constraints para enums

### 2. Model (src/models/)
- Criar interface TypeScript com todos os campos da tabela
- Exportar types para enums (union types)
- snake_case nos campos (match DB schema)

### 3. Repository (src/database/repositories/)
- Implementar padrão CRUD: getAll, getById, create, update, delete, count
- SEMPRE parameterized queries (?)
- Usar generateId() para novos UUIDs

### 4. Constants (src/constants/)
- Criar checklists baseados em normas ABNT/DNIT
- Interface ChecklistTemplate com descricao + ordem
- Exportar como constantes

### 5. Tela de Formulário (src/screens/{modulo}/)
- SafeAreaView + Header
- FormField, SelectField, DatePickerField
- ChecklistItemRow para itens de checklist
- PhotoPicker + SignatureCapture
- GPS automático (locationService)
- Validação inline com mensagens em português
- Loading states

### 6. Tela de Lista (src/screens/{modulo}/)
- SafeAreaView + Header
- FlatList com cards
- StatusBadge / SeverityBadge
- Botão FAB para "Nova Inspeção"
- Pull-to-refresh

### 7. Navegação (src/navigation/)
- Adicionar tipos em types.ts
- Registrar telas no AppNavigator.tsx
- Adicionar na tab/stack correspondente

### 8. NC Automática (src/services/ncAutomaticaService.ts)
- Implementar regras de geração automática de RNC
- Vincular origem_tipo e origem_id

### 9. Template PDF (src/services/pdfService.ts)
- HTML template profissional
- Dados sanitizados
- Fotos em base64
- Assinatura digital

### 10. Verificação Final
- `npx tsc --noEmit` — sem erros
- Navegação funciona corretamente
- Todas as rotas tipadas
- Design system respeitado (COLORS)
