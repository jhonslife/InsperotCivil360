# Skill: Checklist por Norma Técnica

> Gerar checklist de inspeção baseado em norma ABNT/DNIT para um tipo de inspeção
> **Agente**: @Inspecao

---

## Quando Usar

- Criar novo checklist para módulo de inspeção
- Adicionar itens de verificação baseados em norma técnica
- Expandir checklist existente com novos critérios normativos

---

## Normas de Referência por Módulo

### Fundações
| Norma | Escopo |
|-------|--------|
| NBR 6122:2022 | Projeto e execução de fundações |
| NBR 6118:2023 | Estruturas de concreto armado |
| NBR 12131 | Estacas — Prova de carga estática |
| NBR 13208 | Ensaio de carregamento dinâmico |
| NBR 6484 | Sondagens SPT |

### Concreto / Estrutura
| Norma | Escopo |
|-------|--------|
| NBR 12655:2022 | Preparo, controle e recebimento de concreto |
| NBR 5739 | Ensaio de compressão de CP cilíndrico |
| NBR 7480 | Aço para concreto armado — especificação |
| NBR 14931 | Execução de estruturas de concreto |

### Pavimentação
| Norma | Escopo |
|-------|--------|
| DNIT 031/2006-ES | Sub-base estabilizada granulometricamente |
| DNIT 141/2022-ES | Base de solo/brita granulometricamente estabilizada |
| DNER-ME 024 | Determinação de deflexão — Viga Benkelman |
| NBR 9895 | Solo — Índice de Suporte CBR |

### Vedação
| Norma | Escopo |
|-------|--------|
| NBR 15961 | Alvenaria estrutural — Blocos de concreto |
| NBR 15575 | Desempenho de edificações habitacionais |
| NBR 15758 | Sistemas construtivos de drywall |

---

## Template de Arquivo

**Arquivo**: `src/constants/{modulo}Types.ts`

```typescript
// === Checklist Templates ===

export interface ChecklistTemplate {
  descricao: string;
  norma_referencia: string;
  categoria: string;
  criticidade: 'alta' | 'media' | 'baixa';
  ordem: number;
}

export const NOME_MODULO_CHECKLIST: ChecklistTemplate[] = [
  {
    descricao: 'Descrição técnica precisa do item de verificação',
    norma_referencia: 'NBR XXXX:YYYY — Seção X.X',
    categoria: 'Categoria do item',
    criticidade: 'alta',  // alta = NC automática se não conforme
    ordem: 1,
  },
  // ... demais itens
];
```

---

## Regras de Construção do Checklist

### Linguagem
- Português técnico de engenharia civil
- Frases imperativas ou interrogativas: "Verificar se...", "O item atende..."
- Referenciar seção específica da norma quando possível

### Criticidade
- **alta**: Itens estruturais ou de segurança → gera NC automática se não conforme
- **media**: Itens de qualidade e desempenho → alerta ao inspetor
- **baixa**: Itens de acabamento ou registro → apenas registro

### Categorização
Agrupar por etapa construtiva ou aspecto técnico:
- Fundações: "Locação", "Escavação", "Armadura", "Concretagem", "Cura"
- Concreto: "Recebimento", "Moldagem", "Cura", "Desforma"
- Pavimentação: "Subleito", "Sub-base", "Base", "Revestimento"
- Vedação: "Marcação", "Elevação", "Verga/Contraverga", "Acabamento"

### Quantidade de Itens
- Módulo simples: 6–10 itens
- Módulo complexo: 10–20 itens
- Cada item deve ser verificável em campo (sim/não/não aplicável)

---

## Exemplo Completo: Fundação Rasa

```typescript
export const FUNDACAO_RASA_CHECKLIST: ChecklistTemplate[] = [
  {
    descricao: 'Verificar gabarito e locação conforme projeto',
    norma_referencia: 'NBR 6122:2022 — Seção 8.2',
    categoria: 'Locação',
    criticidade: 'alta',
    ordem: 1,
  },
  {
    descricao: 'Conferir dimensões da escavação (largura, comprimento, profundidade)',
    norma_referencia: 'NBR 6122:2022 — Seção 8.3',
    categoria: 'Escavação',
    criticidade: 'alta',
    ordem: 2,
  },
  {
    descricao: 'Verificar nível do solo de apoio e capacidade de suporte',
    norma_referencia: 'NBR 6122:2022 — Seção 6',
    categoria: 'Escavação',
    criticidade: 'alta',
    ordem: 3,
  },
  {
    descricao: 'Conferir lastro de concreto magro (quando aplicável)',
    norma_referencia: 'NBR 6122:2022 — Seção 8.4',
    categoria: 'Preparo',
    criticidade: 'media',
    ordem: 4,
  },
  {
    descricao: 'Verificar armadura conforme projeto (bitola, espaçamento, cobrimento)',
    norma_referencia: 'NBR 6118:2023 — Tabela 7.2',
    categoria: 'Armadura',
    criticidade: 'alta',
    ordem: 5,
  },
  {
    descricao: 'Conferir fôrmas (estanqueidade, alinhamento, escoramento)',
    norma_referencia: 'NBR 14931 — Seção 9',
    categoria: 'Formas',
    criticidade: 'media',
    ordem: 6,
  },
  {
    descricao: 'Verificar traço do concreto e slump test',
    norma_referencia: 'NBR 12655:2022 — Seção 9',
    categoria: 'Concretagem',
    criticidade: 'alta',
    ordem: 7,
  },
  {
    descricao: 'Verificar processo de cura do concreto',
    norma_referencia: 'NBR 14931 — Seção 11',
    categoria: 'Cura',
    criticidade: 'media',
    ordem: 8,
  },
];
```

---

## Validação do Checklist

- [ ] Todo item tem norma_referencia preenchida
- [ ] Itens ordenados logicamente (sequência construtiva)
- [ ] Criticidade 'alta' em itens estruturais/segurança
- [ ] Mínimo 6 itens por módulo
- [ ] Linguagem técnica sem ambiguidade
- [ ] Categorias agrupam itens relacionados
