---
applyTo: 'src/constants/*Types.ts'
---

# Inspection Types & Checklists Patterns — Inspetor Civil 360

## Regras

```yaml
checklists:
  - Baseados em normas ABNT/DNIT
  - Interface ChecklistTemplate com descricao e ordem
  - Exportar como constantes UPPER_SNAKE_CASE
  - Referenciar norma técnica em comentários

nomenclatura:
  - Descrição em português técnico
  - Ordem numérica sequencial (1-based)
  - Campos de conformidade: 0=pendente, 1=conforme, 2=não conforme
```

## Template

```typescript
export interface ChecklistTemplate {
  descricao: string;
  ordem: number;
}

// Checklists baseados em NBR XXXX:YYYY
export const MODULO_CHECKLIST: ChecklistTemplate[] = [
  { descricao: 'Item conforme norma técnica', ordem: 1 },
  // ...
];
```

## Normas de Referência

```yaml
fundações: NBR 6122:2022, NBR 6118:2023
concreto: NBR 12655:2022, NBR 5739, NBR 7480, NBR 14931
vedação: NBR 15961, NBR 15575, NBR 15758
pavimentação: DNIT 031/2006-ES, DNIT 141/2022-ES, DNER-ME 024, NBR 9895
```
