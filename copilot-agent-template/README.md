# 🤖 Copilot Agent Template

> **Template universal de configuração para GitHub Copilot Agent Mode**
> Estrutura pronta para descompactar em qualquer projeto.

## O que é isso?

Uma pasta com todas as configurações necessárias para transformar qualquer projeto em um workspace com GitHub Copilot Agent Mode totalmente configurado, incluindo:

- **12 agentes especializados** (Neural Chain Architecture)
- **5 arquivos de instruções** por linguagem (TypeScript, Python, Rust, React, Testing)
- **4 prompts reutilizáveis** (code review, testes, features, security audit)
- **VS Code otimizado** para estabilidade (sem Server Error 500)
- **8 MCP servers** universais pré-configurados
- **Extensões recomendadas** para o workspace

## Estrutura

```
copilot-agent-template/
├── README.md                        ← Você está aqui
├── AGENTS.md                        ← Registro dos 12 agentes
├── CLAUDE.md                        ← Contexto para Claude (multi-tool)
│
├── .github/
│   ├── copilot-instructions.md      ← Instruções principais do sistema
│   ├── agents/                      ← 12 agentes especializados
│   │   ├── NeuralChain.agent.md     ← Orquestrador master
│   │   ├── Guardian.agent.md        ← Motor de qualidade
│   │   ├── Planejador.agent.md      ← Planejador de arquitetura
│   │   ├── Frontend.agent.md        ← React + TypeScript
│   │   ├── Backend.agent.md         ← Python + FastAPI
│   │   ├── Database.agent.md        ← PostgreSQL + Redis
│   │   ├── DevOps.agent.md          ← Docker + CI/CD
│   │   ├── Security.agent.md        ← Segurança + Compliance
│   │   ├── QA.agent.md              ← Testes + Qualidade
│   │   ├── Analyzer.agent.md        ← Worker read-only
│   │   ├── Implementer.agent.md     ← Worker de código
│   │   └── Reviewer.agent.md        ← Worker de review
│   ├── instructions/                ← Padrões por linguagem
│   │   ├── typescript-standards.instructions.md
│   │   ├── python-standards.instructions.md
│   │   ├── rust-standards.instructions.md
│   │   ├── react-patterns.instructions.md
│   │   └── testing-patterns.instructions.md
│   ├── prompts/                     ← Prompts reutilizáveis
│   │   ├── code-review.prompt.md
│   │   ├── create-test-suite.prompt.md
│   │   ├── implement-feature.prompt.md
│   │   └── security-audit.prompt.md
│   └── hooks/
│       └── hooks.json               ← Lifecycle hooks (vazio)
│
├── .vscode/
│   ├── settings.json                ← Settings otimizados
│   ├── mcp.json                     ← 8 MCP servers universais
│   ├── extensions.json              ← Extensões recomendadas
│   └── launch.json                  ← Debug configs
│
├── .copilot/
│   └── skills/                      ← Skills customizados (vazio)
│       └── .gitkeep
│
└── .claude/
    └── settings.json                ← Config Claude (vazio)
```

---

## 🚀 Instalação (3 passos)

### Passo 1: Copiar para seu projeto

```bash
# Opção A: Copiar a pasta inteira
cp -r copilot-agent-template/{.github,.vscode,.copilot,.claude,AGENTS.md,CLAUDE.md} /caminho/do/seu/projeto/

# Opção B: Criar um zip e descompactar
cd copilot-agent-template
zip -r ../copilot-agent-config.zip .github .vscode .copilot .claude AGENTS.md CLAUDE.md
cd /caminho/do/seu/projeto
unzip /caminho/copilot-agent-config.zip
```

### Passo 2: Personalizar os placeholders

Substitua os placeholders `{{...}}` nos seguintes arquivos:

| Arquivo | Placeholders |
|---------|-------------|
| `.github/copilot-instructions.md` | `{{PROJECT_NAME}}`, `{{PROJECT_DESCRIPTION}}`, `{{COMPANY_NAME}}`, `{{DATE}}` |
| `.vscode/mcp.json` | `{{WORKSPACE_PATH}}`, `{{GITHUB_TOKEN}}` |
| `AGENTS.md` | `{{PROJECT_NAME}}` |
| `CLAUDE.md` | `{{PROJECT_NAME}}`, `{{PROJECT_DESCRIPTION}}` |

**Comando rápido para substituir:**

```bash
# Linux/Mac — substituir todos os placeholders de uma vez
cd /caminho/do/seu/projeto

# Substitua estes valores:
PROJECT_NAME="MeuProjeto"
PROJECT_DESC="Descrição do meu projeto"
COMPANY="MinhaEmpresa"
WS_PATH="/home/user/meu-projeto"
TODAY=$(date +%Y-%m-%d)

# Aplicar substituições
find .github AGENTS.md CLAUDE.md .vscode -type f -name "*.md" -o -name "*.json" | \
  xargs sed -i "s|{{PROJECT_NAME}}|$PROJECT_NAME|g; s|{{PROJECT_DESCRIPTION}}|$PROJECT_DESC|g; s|{{COMPANY_NAME}}|$COMPANY|g; s|{{DATE}}|$TODAY|g; s|{{WORKSPACE_PATH}}|$WS_PATH|g"
```

### Passo 3: Instalar extensões

Abra o projeto no VS Code e aceite a sugestão de instalar as extensões recomendadas, ou:

```bash
# Instalar todas as extensões recomendadas
code --install-extension github.copilot
code --install-extension github.copilot-chat
code --install-extension eamodio.gitlens
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension ms-python.python
code --install-extension ms-python.vscode-pylance
code --install-extension ms-python.black-formatter
code --install-extension charliermarsh.ruff
code --install-extension rust-lang.rust-analyzer
code --install-extension ms-azuretools.vscode-docker
code --install-extension ms-playwright.playwright
code --install-extension usernamehw.errorlens
code --install-extension pkief.material-icon-theme
code --install-extension bradlc.vscode-tailwindcss
```

---

## ⚙️ Configuração dos MCP Servers

O template vem com 8 MCP servers universais. Após copiar, configure:

### GitHub (obrigatório)
O server GitHub usa HTTP com o token do Copilot. Funciona automaticamente se você tem Copilot ativo.

### Filesystem e Git (requerem path)
Edite `.vscode/mcp.json` e substitua `{{WORKSPACE_PATH}}` pelo caminho absoluto do seu workspace.

### Servers opcionais
Descomente no `mcp.json` conforme necessário:
- **PostgreSQL** — Para projetos com banco de dados
- **Redis** — Para projetos com cache
- **Prisma** — Para projetos com Prisma ORM
- **Ollama** — Para projetos com AI local

---

## 🛡️ Otimizações de Estabilidade

O `settings.json` inclui otimizações que previnem o **Server Error 500** comum em configurações pesadas:

| Setting | Valor | Motivo |
|---------|-------|--------|
| `maxRequests` | 75 | Previne overflow de contexto (padrão: 200) |
| `thinking.budgetTokens` | 16000 | Budget generoso sem estourar API limits |
| `mcp.discovery` | all false | Impede carregamento de tools extras |
| `serverSampling` | `{}` | Elimina overhead de 105 entradas |
| `requestQueuing` | "queue" | Mais seguro que "steer" |
| `symbolicMath` | false | Raramente usado, adiciona overhead |
| `multiDiffEditor` | false | Experimental, causa instabilidade |

---

## 🧠 Como Usar os Agentes

### Invocação direta
No chat do Copilot, use `@NomDoAgente` para invocar um agente específico:

```
@NeuralChain Implementar sistema de autenticação com JWT
@Guardian Auditar qualidade do módulo de pagamentos
@Planejador Planejar feature de relatórios
@Frontend Criar componente de tabela com paginação
@Backend Criar endpoint de busca com filtros
@QA Criar suite de testes para o serviço de usuários
```

### Prompts reutilizáveis
Use os prompts em `.github/prompts/` para tarefas comuns:
- **Code Review**: Revisão completa de 4 perspectivas
- **Test Suite**: Gerar testes para um módulo
- **Feature**: Implementar feature end-to-end
- **Security Audit**: Auditoria de segurança

---

## 📝 Personalização Avançada

### Adicionar novo agente
1. Crie `.github/agents/MeuAgente.agent.md` com frontmatter YAML
2. Atualize `AGENTS.md` com o novo agente
3. Atualize a tabela de referência em `.github/copilot-instructions.md`

### Adicionar nova instrução por linguagem
1. Crie `.github/instructions/minha-linguagem.instructions.md`
2. Use frontmatter `applyTo` para definir os globs de arquivo

### Adicionar skill customizado
1. Crie `.copilot/skills/meu-skill/SKILL.md`
2. Defina a descrição e instruções do skill

### Adicionar MCP server
1. Edite `.vscode/mcp.json`
2. Mantenha ≤ 10 servers ativos para estabilidade

---

## 📋 Checklist de Setup

- [ ] Copiar configurações para o projeto
- [ ] Substituir todos os `{{PLACEHOLDERS}}`
- [ ] Configurar `{{WORKSPACE_PATH}}` no `mcp.json`
- [ ] Instalar extensões recomendadas
- [ ] Recarregar VS Code (`Ctrl+Shift+P` → "Reload Window")
- [ ] Testar com `@NeuralChain olá, verifique se está tudo configurado`
- [ ] Remover linguagens não usadas do `instructions/`
- [ ] Adicionar MCP servers específicos do projeto

---

## 🔗 Referências

- [GitHub Copilot Agent Mode](https://docs.github.com/en/copilot/using-github-copilot/using-copilot-agent-mode)
- [Custom Instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-custom-instructions)
- [Custom Agents](https://docs.github.com/en/copilot/customizing-copilot/extending-copilot-chat-in-vs-code/custom-agents)
- [MCP Servers](https://docs.github.com/en/copilot/customizing-copilot/extending-copilot-chat-in-vs-code/using-mcp-servers)
- [Copilot Memory](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/copilot-memory)

---

_Template criado em 2026-03-05 | Neural Chain Architecture v1.0_
