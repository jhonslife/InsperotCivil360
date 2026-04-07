# Skill: Code Review

> Revisão de código em 4 perspectivas para o Inspetor Civil 360
> **Agente**: @Revisor (read-only) + @Guardiao (qualidade)

---

## Quando Usar

- Após implementação de qualquer feature
- Pull request review
- Auditoria periódica de código
- Antes de release/build

---

## 4 Perspectivas de Review

### 1. Correção Funcional

| Verificação | Detalhe |
|-------------|---------|
| Lógica de negócio | Regras de conformidade, alertas, NC automática corretos? |
| Dados | Model ↔ Migration ↔ Repository alinhados? |
| Queries | SQL correto? Parameterized queries? Sem SQL injection? |
| Edge cases | Campos null, listas vazias, sem conexão, sem GPS |
| Tipos | TypeScript sem `any`? Interfaces completas? |

### 2. Qualidade de Código

| Verificação | Detalhe |
|-------------|---------|
| Import Verification Chain | Todos os imports rastreados e necessários? |
| Padrão stack | Context (não Redux), StyleSheet (não Tailwind), RN (não web)? |
| Componentes | Funcionais, arrow functions, Props interface exportada? |
| Async | async/await com try/catch? Loading states? |
| Naming | PascalCase componentes, camelCase funções, snake_case DB? |
| DRY | Código duplicado? Componentes reutilizáveis aproveitados? |

### 3. Segurança

| Verificação | Detalhe |
|-------------|---------|
| SQL Injection | Todas as queries usam `?` placeholders? |
| HTML Injection | Dados do usuário escapados no PDF (escapeHtml)? |
| Dados sensíveis | Nenhum dado em log de produção? |
| File paths | Nomes de arquivo sanitizados? |
| Validação | Inputs validados antes de insert no DB? |

### 4. Arquitetura

| Verificação | Detalhe |
|-------------|---------|
| Navegação | Tipos em types.ts? Stack.Screen registrada? |
| Design System | COLORS/FONTS do theme.ts? Espaçamentos padrão? |
| Offline-first | Sem dependência de rede? Dados locais? |
| Obra vinculada | Toda entidade tem obra_id? |
| Componentes | Reutiliza Header, StatCard, FormField, etc.? |

---

## Classificação de Issues

| Severidade | Critério | Ação |
|------------|----------|------|
| 🔴 Blocker | SQL injection, crash, dados corrompidos | Fix imediato |
| 🟠 Major | Lógica de negócio errada, tipo errado | Fix antes de merge |
| 🟡 Minor | Padrão não seguido, código duplicado | Fix recomendado |
| 🔵 Info | Sugestão de melhoria, refactoring | Opcional |

---

## Output Format

```markdown
## Code Review — [Nome do Módulo/Feature]

### Resumo
- **Arquivos revisados**: X
- **Issues encontradas**: X (🔴 X, 🟠 X, 🟡 X, 🔵 X)
- **Veredicto**: ✅ Aprovado | ⚠️ Aprovado com ressalvas | ❌ Requer correções

### Issues

#### 🔴 [BLK-001] Título do issue
**Arquivo**: `src/path/to/file.ts:42`
**Perspectiva**: Segurança
**Descrição**: ...
**Correção sugerida**: ...

#### 🟠 [MAJ-001] Título do issue
...

### Checklist Final
- [ ] Import Verification Chain OK
- [ ] Model ↔ Migration ↔ Repository consistentes
- [ ] Todas as queries parameterized
- [ ] Navegação tipada e registrada
- [ ] Design System respeitado
- [ ] `npx tsc --noEmit` sem erros
```
