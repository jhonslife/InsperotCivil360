---
description: 'Code review completo de uma feature do Inspetor Civil 360'
---

# Code Review — Inspetor Civil 360

Faça code review dos arquivos alterados seguindo as 4 perspectivas:

## 1. CORREÇÃO
- [ ] Código faz o que deveria?
- [ ] Edge cases tratados?
- [ ] try/catch em operações de banco?
- [ ] Loading states presentes?
- [ ] Entidades vinculadas a obra_id?

## 2. QUALIDADE — Convenções do Projeto
- [ ] StyleSheet.create no final do arquivo?
- [ ] COLORS de theme.ts (sem cores hardcoded)?
- [ ] SafeAreaView em telas?
- [ ] Componentes reutilizáveis aproveitados?
- [ ] Props interface exportada?
- [ ] Import Verification Chain respeitada?
- [ ] Naming: PascalCase (componentes), camelCase (funções), snake_case (DB)?

## 3. SEGURANÇA
- [ ] SQL com parameterized queries (?)?
- [ ] Inputs validados em formulários?
- [ ] HTML sanitizado em templates PDF?
- [ ] Nenhum dado transmitido pela rede?
- [ ] Fotos comprimidas (80%, max 1920px)?

## 4. ARQUITETURA
- [ ] Model ↔ Migration (campos correspondem)?
- [ ] Repository ↔ Model (tipos casam)?
- [ ] Tela registrada no AppNavigator?
- [ ] Rota tipada em navigation/types.ts?
- [ ] Checklists baseados em normas ABNT/DNIT?
- [ ] Stack correta (React Nav, Context, StyleSheet)?

## Saída
Classificar cada achado:
- 🔴 **bloqueante**: Bug, vulnerabilidade, crash
- 🟡 **sugestão**: Melhoria de qualidade
- 🟢 **nitpick**: Detalhe menor
