---
applyTo: 'src/services/pdfService.ts'
---

# PDF Generation Patterns — Inspetor Civil 360

## Regras

```yaml
geração:
  - expo-print para converter HTML → PDF
  - expo-sharing para compartilhar
  - Templates HTML com CSS inline
  - Fotos em base64 autocontidas no PDF

segurança:
  - SEMPRE sanitizar dados do usuário antes de inserir no HTML
  - Escapar caracteres HTML: < > & " '
  - Nunca usar innerHTML com dados não sanitizados

design:
  - Header azul (#1B3A5C) com título "INSPETOR CIVIL 360"
  - Tabelas estilizadas com headers azul (#2E5C8A)
  - Status com cores semânticas: conforme(verde), não conforme(vermelho)
  - Rodapé com data de geração e assinatura digital
```

## Sanitização HTML

```typescript
function sanitizeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
```

## Fluxo de Geração

```typescript
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

async function generatePDF(html: string): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
}
```
