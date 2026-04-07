# Skill: Gerar PDF

> Criar template PDF profissional para relatório de inspeção usando expo-print
> **Agente**: @Relatorios

---

## Quando Usar

- Criar template PDF para novo módulo de inspeção
- Atualizar template existente com novos campos
- Gerar relatório consolidado com múltiplas inspeções

---

## Stack de PDF

```yaml
geração: expo-print (printToFileAsync)
compartilhamento: expo-sharing (shareAsync)
formato: HTML → PDF (renderizado pelo WebView nativo)
fotos: base64 inline (autocontidas no PDF)
```

---

## Template HTML Padrão

**Arquivo**: `src/services/pdfService.ts`

```typescript
export async function generateNomeModuloPDF(
  obra: Obra,
  inspecao: NomeModulo,
  checklistItems: ChecklistItem[],
  photos: Photo[]
): Promise<string> {
  // 1. Converter fotos para base64
  const photosBase64 = await Promise.all(
    photos.map(async (photo) => {
      const base64 = await FileSystem.readAsStringAsync(photo.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return { ...photo, base64 };
    })
  );

  // 2. Construir HTML
  const html = buildNomeModuloHTML(obra, inspecao, checklistItems, photosBase64);

  // 3. Gerar PDF
  const { uri } = await Print.printToFileAsync({ html });

  return uri;
}
```

### Estrutura HTML do Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    /* === Reset === */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 11pt; color: #1A1A2E; padding: 20mm; }

    /* === Header === */
    .header { background: #1B3A5C; color: white; padding: 15px 20px; margin: -20mm -20mm 20px; }
    .header h1 { font-size: 16pt; }
    .header .subtitle { font-size: 10pt; opacity: 0.9; }

    /* === Info Grid === */
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; }
    .info-item { border-bottom: 1px solid #E5E7EB; padding: 4px 0; }
    .info-label { font-size: 9pt; color: #6B7280; }
    .info-value { font-size: 11pt; font-weight: bold; }

    /* === Checklist Table === */
    .checklist-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .checklist-table th { background: #1B3A5C; color: white; padding: 8px; text-align: left; font-size: 9pt; }
    .checklist-table td { padding: 6px 8px; border-bottom: 1px solid #E5E7EB; font-size: 10pt; }
    .conforme { color: #10B981; font-weight: bold; }
    .nao-conforme { color: #EF4444; font-weight: bold; }
    .nao-aplicavel { color: #6B7280; }

    /* === Photos === */
    .photos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
    .photo-item img { width: 100%; max-height: 200px; object-fit: cover; border: 1px solid #E5E7EB; }
    .photo-caption { font-size: 8pt; color: #6B7280; text-align: center; }

    /* === Signature === */
    .signature { text-align: center; margin-top: 30px; border-top: 1px solid #1A1A2E; width: 250px; margin-left: auto; margin-right: auto; padding-top: 5px; }
    .signature img { max-height: 80px; }

    /* === Footer === */
    .footer { margin-top: 30px; border-top: 2px solid #1B3A5C; padding-top: 10px; font-size: 8pt; color: #6B7280; text-align: center; }

    /* === Page Break === */
    .page-break { page-break-before: always; }
  </style>
</head>
<body>
  <!-- HEADER -->
  <div class="header">
    <h1>Relatório de Inspeção — ${TITULO_MODULO}</h1>
    <div class="subtitle">Inspetor Civil 360 — ${obra.nome}</div>
  </div>

  <!-- DADOS DA OBRA -->
  <h2>Dados da Obra</h2>
  <div class="info-grid">
    <div class="info-item">
      <div class="info-label">Obra</div>
      <div class="info-value">${escapeHtml(obra.nome)}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Cliente</div>
      <div class="info-value">${escapeHtml(obra.cliente)}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Local</div>
      <div class="info-value">${escapeHtml(obra.local)}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Data da Inspeção</div>
      <div class="info-value">${formatDate(inspecao.data)}</div>
    </div>
  </div>

  <!-- CHECKLIST -->
  <h2>Checklist de Verificação</h2>
  <table class="checklist-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Item</th>
        <th>Status</th>
        <th>Observação</th>
      </tr>
    </thead>
    <tbody>
      ${checklistItems.map((item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${escapeHtml(item.descricao)}</td>
          <td class="${statusClass(item.conforme)}">${statusLabel(item.conforme)}</td>
          <td>${escapeHtml(item.observacao || '')}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <!-- FOTOS -->
  ${photos.length > 0 ? `
    <div class="page-break"></div>
    <h2>Registro Fotográfico</h2>
    <div class="photos-grid">
      ${photosBase64.map(p => `
        <div class="photo-item">
          <img src="data:image/jpeg;base64,${p.base64}" />
          <div class="photo-caption">${escapeHtml(p.descricao || '')}</div>
        </div>
      `).join('')}
    </div>
  ` : ''}

  <!-- ASSINATURA -->
  ${inspecao.assinatura_path ? `
    <div class="signature">
      <img src="data:image/png;base64,${assinaturaBase64}" />
      <div>Responsável Técnico</div>
    </div>
  ` : ''}

  <!-- FOOTER -->
  <div class="footer">
    Gerado por Inspetor Civil 360 em ${new Date().toLocaleString('pt-BR')}
  </div>
</body>
</html>
```

---

## Funções Auxiliares Obrigatórias

```typescript
// SEGURANÇA: Escapar HTML para prevenir XSS
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Status do checklist
function statusClass(conforme: number): string {
  switch (conforme) {
    case 1: return 'conforme';
    case 0: return 'nao-conforme';
    case 2: return 'nao-aplicavel';
    default: return '';
  }
}

function statusLabel(conforme: number): string {
  switch (conforme) {
    case 1: return 'Conforme';
    case 0: return 'Não Conforme';
    case 2: return 'N/A';
    default: return '—';
  }
}
```

---

## Compartilhamento

```typescript
import * as Sharing from 'expo-sharing';

export async function sharePDF(uri: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Compartilhar Relatório',
    });
  }
}
```

---

## Validação do Template

- [ ] Todos os dados do usuário passam por escapeHtml()
- [ ] Fotos convertidas para base64 (autocontidas)
- [ ] Assinatura incluída quando disponível
- [ ] Cores consistentes com Design System (#1B3A5C, etc.)
- [ ] Font-size legível (10-12pt para corpo)
- [ ] Page break antes de seção de fotos (se muitas)
- [ ] Footer com timestamp de geração
- [ ] Funciona offline (sem CDN, sem fontes externas)
