# Skill: NC Automática

> Implementar regras de geração automática de Registro de Não Conformidade (RNC) a partir de inspeções
> **Agente**: @Inspecao + @BancoDados

---

## Quando Usar

- Implementar NC automática para novo módulo de inspeção
- Adicionar regras de validação com geração automática de RNC
- Expandir regras existentes com novos critérios

---

## Conceito

Quando um inspetor registra um item como "não conforme" em qualquer módulo de inspeção, o sistema deve automaticamente:
1. Avaliar a criticidade do item
2. Gerar um RNC vinculado à inspeção de origem
3. Definir gravidade baseada nas regras do módulo
4. Notificar o inspetor da criação automática

---

## Regras por Módulo

### Fundações
| Condição | Gravidade | Gatilho |
|----------|-----------|---------|
| Item de checklist crítico não conforme | Alta | Qualquer item com criticidade 'alta' |
| Solo de apoio inadequado | Alta | Capacidade de suporte fora do projeto |
| Desvio dimensional > tolerância | Média | Dimensões fora de ±5cm |

### Concreto
| Condição | Gravidade | Gatilho |
|----------|-----------|---------|
| Slump fora de 80–120mm | Média | Valor do slump_test fora do range |
| Temperatura > 35°C | Média | Valor de temperatura_concreto > 35 |
| fck medido < fck × 0.95 | Alta | Resultado de rompimento CP |
| Nota de lançamento < nota estipulada | Média | Nota de usina divergente |

### Armadura
| Condição | Gravidade | Gatilho |
|----------|-----------|---------|
| Não conforme ao projeto | Alta | Bitola, espaçamento ou cobrimento errado |
| Cobrimento insuficiente | Alta | Medição < mínimo da NBR 6118 |
| Amarração inadequada | Média | Checklist não conforme |

### Vedação
| Condição | Gravidade | Gatilho |
|----------|-----------|---------|
| Prumo fora de tolerância | Média | Desvio >5mm por metro |
| Alinhamento fora | Média | Checklist não conforme |
| Argamassa de assentamento inadequada | Média | Traço ou espessura errada |

### Pavimentação
| Condição | Gravidade | Gatilho |
|----------|-----------|---------|
| Compactação < 95% | Média | Grau de compactação insuficiente |
| Deflexão > 100 (0.01mm) | Alta | Ensaio Benkelman acima do limiar |
| CBR < especificado | Alta | Resultado de ensaio CBR |
| Espessura < projeto | Média | Medição de espessura de camada |

### Rompimento de CP
| Condição | Gravidade | Gatilho |
|----------|-----------|---------|
| Resistência < fck × 0.95 | Alta | Resultado de ensaio de compressão |
| Resistência < fck × 0.85 | Crítica | Resultado muito abaixo do esperado |

---

## Implementação

### Estrutura do Serviço

**Arquivo**: `src/services/ncAutomaticaService.ts`

```typescript
import { rncRepository } from '../database/repositories/rncRepository';
import { generateId } from '../utils/generateId';

export type OrigemTipo =
  | 'fundacao'
  | 'concreto'
  | 'armadura'
  | 'forma'
  | 'vedacao'
  | 'pavimentacao'
  | 'rompimento_cp';

export type GravidadeNC = 'baixa' | 'media' | 'alta' | 'critica';

interface NCAutomaticaParams {
  obra_id: string;
  origem_tipo: OrigemTipo;
  origem_id: string;
  descricao: string;
  gravidade: GravidadeNC;
  acao_recomendada?: string;
}

export async function gerarNCAutomatica(params: NCAutomaticaParams): Promise<string> {
  const rncId = await rncRepository.create({
    obra_id: params.obra_id,
    descricao: `[NC Automática] ${params.descricao}`,
    gravidade: params.gravidade,
    status: 'aberta',
    origem_tipo: params.origem_tipo,
    origem_id: params.origem_id,
    acao_corretiva: params.acao_recomendada || '',
    // demais campos...
  });
  return rncId;
}

export async function verificarChecklistNC(
  obraId: string,
  origemTipo: OrigemTipo,
  origemId: string,
  itensNaoConformes: Array<{ descricao: string; criticidade: 'alta' | 'media' | 'baixa' }>
): Promise<string[]> {
  const ncsGeradas: string[] = [];

  const itensCriticos = itensNaoConformes.filter(i => i.criticidade === 'alta');

  if (itensCriticos.length > 0) {
    const id = await gerarNCAutomatica({
      obra_id: obraId,
      origem_tipo: origemTipo,
      origem_id: origemId,
      descricao: `Itens críticos não conformes: ${itensCriticos.map(i => i.descricao).join('; ')}`,
      gravidade: itensCriticos.length >= 3 ? 'alta' : 'media',
    });
    ncsGeradas.push(id);
  }

  return ncsGeradas;
}
```

### Integração na Tela de Formulário

```typescript
// No handleSave() da tela de inspeção:
const itensNaoConformes = checklistItems
  .filter(item => item.conforme === 0) // 0 = não conforme
  .map(item => ({
    descricao: item.descricao,
    criticidade: CHECKLIST_TEMPLATE.find(t => t.descricao === item.descricao)?.criticidade || 'baixa',
  }));

if (itensNaoConformes.length > 0) {
  const ncs = await verificarChecklistNC(obraId, 'modulo', inspecaoId, itensNaoConformes);
  if (ncs.length > 0) {
    Alert.alert('NC Automática', `${ncs.length} não conformidade(s) registrada(s) automaticamente.`);
  }
}
```

---

## Validação

- [ ] Toda NC automática tem origem_tipo e origem_id preenchidos
- [ ] Gravidade definida conforme regras do módulo
- [ ] Descrição inclui detalhes dos itens não conformes
- [ ] Alert exibido ao usuário após geração
- [ ] NC criada com status 'aberta'
- [ ] Parameterized queries no repository
