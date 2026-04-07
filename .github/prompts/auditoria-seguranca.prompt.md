---
description: 'Auditoria de segurança do Inspetor Civil 360 — dados locais, SQL injection, sanitização'
---

# Auditoria de Segurança — Inspetor Civil 360

## 1. SQL Injection
- [ ] TODAS as queries usam parameterized (?) placeholders?
- [ ] Nenhuma interpolação de string em SQL?
- [ ] Nenhum template literal com variáveis em SQL?

## 2. Dados Locais
- [ ] Dados armazenados APENAS localmente (SQLite + FileSystem)?
- [ ] Nenhuma transmissão de rede sem consentimento explícito?
- [ ] FileSystem restrito ao diretório do app?

## 3. Input Validation
- [ ] Formulários validam inputs antes de submissão?
- [ ] Campos numéricos rejeitam texto?
- [ ] Campos obrigatórios são verificados?
- [ ] Enums validados contra valores permitidos?

## 4. HTML Sanitization (PDF)
- [ ] Dados do usuário são sanitizados antes de inserir no HTML?
- [ ] Caracteres < > & " ' são escapados?
- [ ] Nenhum innerHTML com dados não confiáveis?

## 5. Fotos
- [ ] Compressão a 80% qualidade, max 1920px?
- [ ] Nomes de arquivo sanitizados?
- [ ] Armazenamento no diretório do app?

## 6. Dependências
- [ ] Todas compatíveis com Expo SDK 52+?
- [ ] Nenhuma dependência com vulnerabilidades conhecidas?
- [ ] Nenhuma dependência web-only?

## Saída
Para cada item, reportar:
- ✅ Conforme
- ❌ Vulnerabilidade encontrada (detalhar)
- ⚠️ Atenção necessária (detalhar)
