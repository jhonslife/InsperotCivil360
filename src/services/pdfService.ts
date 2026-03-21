import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Inspection } from '../models/Inspection';
import { ChecklistItem } from '../models/ChecklistItem';
import { RNC } from '../models/RNC';
import { Ensaio } from '../models/Ensaio';
import { DiaryEntry } from '../models/DiaryEntry';
import { Photo } from '../models/Photo';
import { getPhotoBase64 } from './photoService';
import { formatDate } from '../utils/formatDate';
import {
  INSPECTION_TYPE_LABELS,
  GRAVIDADE_LABELS,
  ENSAIO_TYPE_LABELS,
  CLIMA_LABELS,
} from '../constants/inspectionTypes';

const CSS = `
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1A1A2E; font-size: 12px; line-height: 1.5; }
    .header { background: #1B3A5C; color: white; padding: 20px; text-align: center; }
    .header h1 { font-size: 22px; margin-bottom: 2px; }
    .header .subtitle { font-size: 11px; color: #B0C4DE; }
    .header .line { border-top: 2px solid #E8762B; margin: 10px auto; width: 60px; }
    .section { padding: 15px 20px; }
    .section-title { font-size: 14px; font-weight: bold; color: #1B3A5C; border-bottom: 2px solid #1B3A5C; padding-bottom: 4px; margin-bottom: 10px; }
    .info-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 15px; }
    .info-item { flex: 1 1 45%; }
    .info-label { font-size: 10px; color: #6B7280; text-transform: uppercase; }
    .info-value { font-size: 12px; font-weight: 600; }
    .checklist { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    .checklist th { background: #1B3A5C; color: white; padding: 6px 10px; text-align: left; font-size: 11px; }
    .checklist td { padding: 6px 10px; border-bottom: 1px solid #E5E7EB; font-size: 11px; }
    .checklist tr:nth-child(even) { background: #F9FAFB; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
    .badge-conforme { background: #D1FAE5; color: #065F46; }
    .badge-nao-conforme { background: #FEE2E2; color: #991B1B; }
    .badge-pendente { background: #FEF3C7; color: #92400E; }
    .badge-baixa { background: #D1FAE5; color: #065F46; }
    .badge-media { background: #FEF3C7; color: #92400E; }
    .badge-alta { background: #FEE2E2; color: #991B1B; }
    .photos { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
    .photo-item { width: 45%; }
    .photo-item img { width: 100%; border-radius: 6px; border: 1px solid #E5E7EB; }
    .photo-caption { font-size: 10px; color: #6B7280; text-align: center; margin-top: 4px; }
    .signature { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #E5E7EB; }
    .signature img { max-width: 200px; max-height: 80px; }
    .footer { text-align: center; padding: 15px; font-size: 10px; color: #6B7280; border-top: 1px solid #E5E7EB; }
    .obs { background: #F9FAFB; padding: 10px; border-radius: 6px; border-left: 3px solid #1B3A5C; margin-top: 10px; }
    .alert-box { background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 6px; padding: 10px; margin-top: 10px; }
    .alert-box .icon { color: #D97706; font-weight: bold; }
    .status-line { margin-top: 15px; padding: 10px; background: #F0F7FF; border-radius: 6px; text-align: center; }
  </style>
`;

function headerHTML(title: string): string {
  return `
    <div class="header">
      <h1>INSPETOR CIVIL 360</h1>
      <div class="subtitle">by Prof. José Vital</div>
      <div class="line"></div>
      <h2 style="font-size:16px; margin-top:8px;">${title}</h2>
    </div>
  `;
}

function footerHTML(): string {
  return `
    <div class="footer">
      Inspetor Civil 360 — Relatório gerado em ${formatDate(new Date().toISOString())}
    </div>
  `;
}

async function photosHTML(photos: Photo[]): Promise<string> {
  if (photos.length === 0) return '';
  let html = '<div class="section"><div class="section-title">Evidências Fotográficas</div><div class="photos">';
  for (const photo of photos) {
    const base64 = await getPhotoBase64(photo.uri);
    if (base64) {
      html += `
        <div class="photo-item">
          <img src="${base64}" />
          <div class="photo-caption">${photo.legenda || 'Sem legenda'}</div>
        </div>
      `;
    }
  }
  html += '</div></div>';
  return html;
}

function checklistStatusBadge(conforme: number): string {
  if (conforme === 1) return '<span class="badge badge-conforme">Conforme</span>';
  if (conforme === 2) return '<span class="badge badge-nao-conforme">Não Conforme</span>';
  return '<span class="badge badge-pendente">Pendente</span>';
}

export async function generateInspectionPDF(
  inspection: Inspection,
  checklistItems: ChecklistItem[],
  photos: Photo[],
  signatureBase64: string | null
): Promise<void> {
  const statusLabel = inspection.status === 'conforme' ? 'Conforme' :
    inspection.status === 'nao_conforme' ? 'Não Conforme' : 'Pendente';
  const statusClass = inspection.status === 'conforme' ? 'badge-conforme' :
    inspection.status === 'nao_conforme' ? 'badge-nao-conforme' : 'badge-pendente';

  let checklistHTML = '';
  if (checklistItems.length > 0) {
    checklistHTML = `
      <div class="section">
        <div class="section-title">Itens Inspecionados</div>
        <table class="checklist">
          <tr><th>Item</th><th>Situação</th><th>Observação</th></tr>
          ${checklistItems.map(item => `
            <tr>
              <td>${item.descricao}</td>
              <td>${checklistStatusBadge(item.conforme)}</td>
              <td>${item.observacao || '-'}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    `;
  }

  const photosSection = await photosHTML(photos);

  let signatureSection = '';
  if (signatureBase64) {
    signatureSection = `
      <div class="signature">
        <p style="font-size:10px; color:#6B7280; margin-bottom:5px;">Assinatura do Inspetor</p>
        <img src="${signatureBase64}" />
      </div>
    `;
  }

  const html = `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8">${CSS}</head><body>
    ${headerHTML('RELATÓRIO DE INSPEÇÃO')}
    <div class="section">
      <div class="section-title">Dados da Inspeção</div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Obra</div><div class="info-value">${inspection.obra_nome || '-'}</div></div>
        <div class="info-item"><div class="info-label">Data</div><div class="info-value">${formatDate(inspection.data)}</div></div>
        <div class="info-item"><div class="info-label">Tipo</div><div class="info-value">${INSPECTION_TYPE_LABELS[inspection.tipo]}</div></div>
        <div class="info-item"><div class="info-label">Local</div><div class="info-value">${inspection.local_descricao || '-'}</div></div>
        ${inspection.latitude ? `<div class="info-item"><div class="info-label">Coordenadas</div><div class="info-value">${inspection.latitude?.toFixed(6)}, ${inspection.longitude?.toFixed(6)}</div></div>` : ''}
      </div>
    </div>
    ${checklistHTML}
    ${inspection.observacoes ? `<div class="section"><div class="obs"><strong>Observações:</strong> ${inspection.observacoes}</div></div>` : ''}
    ${photosSection}
    <div class="section">
      <div class="status-line">
        <strong>Status:</strong> <span class="badge ${statusClass}">${statusLabel}</span>
      </div>
    </div>
    ${signatureSection}
    ${footerHTML()}
    </body></html>
  `;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
}

export async function generateRNCPDF(rnc: RNC, photos: Photo[]): Promise<void> {
  const gravLabel = GRAVIDADE_LABELS[rnc.gravidade];
  const gravClass = `badge-${rnc.gravidade}`;
  const statusLabel = rnc.status === 'aberta' ? 'Aberta' : rnc.status === 'em_andamento' ? 'Em Andamento' : 'Fechada';

  const photosSection = await photosHTML(photos);

  const html = `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8">${CSS}</head><body>
    ${headerHTML('REGISTRO DE NÃO CONFORMIDADE')}
    <div class="section">
      <div class="section-title">RNC Nº ${String(rnc.numero).padStart(3, '0')}</div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Obra</div><div class="info-value">${rnc.obra_nome || '-'}</div></div>
        <div class="info-item"><div class="info-label">Data</div><div class="info-value">${formatDate(rnc.data)}</div></div>
        <div class="info-item"><div class="info-label">Gravidade</div><div class="info-value"><span class="badge ${gravClass}">${gravLabel}</span></div></div>
        <div class="info-item"><div class="info-label">Status</div><div class="info-value">${statusLabel}</div></div>
        <div class="info-item"><div class="info-label">Responsável</div><div class="info-value">${rnc.responsavel || '-'}</div></div>
        <div class="info-item"><div class="info-label">Prazo</div><div class="info-value">${rnc.prazo ? formatDate(rnc.prazo) : '-'}</div></div>
      </div>
      <div class="obs"><strong>Descrição:</strong> ${rnc.descricao}</div>
    </div>
    ${photosSection}
    ${footerHTML()}
    </body></html>
  `;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
}

export async function generateEnsaioPDF(ensaio: Ensaio, photos: Photo[]): Promise<void> {
  let detailsHTML = '';
  if (ensaio.tipo_ensaio === 'concreto') {
    detailsHTML = `
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Slump (Abatimento)</div><div class="info-value">${ensaio.slump != null ? ensaio.slump + ' mm' : '-'}</div></div>
        <div class="info-item"><div class="info-label">Temperatura</div><div class="info-value">${ensaio.temperatura != null ? ensaio.temperatura + ' °C' : '-'}</div></div>
        <div class="info-item"><div class="info-label">Corpo de Prova</div><div class="info-value">${ensaio.corpo_prova || '-'}</div></div>
      </div>
    `;
  } else if (ensaio.tipo_ensaio === 'graute') {
    detailsHTML = `
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Fluidez</div><div class="info-value">${ensaio.fluidez != null ? ensaio.fluidez + ' s' : '-'}</div></div>
        <div class="info-item"><div class="info-label">Resistência</div><div class="info-value">${ensaio.resistencia != null ? ensaio.resistencia + ' MPa' : '-'}</div></div>
      </div>
    `;
  } else {
    detailsHTML = `
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Compactação</div><div class="info-value">${ensaio.compactacao != null ? ensaio.compactacao + ' %' : '-'}</div></div>
        <div class="info-item"><div class="info-label">Deflexão (Benkelman)</div><div class="info-value">${ensaio.deflexao != null ? ensaio.deflexao + ' x 0.01mm' : '-'}</div></div>
      </div>
    `;
  }

  const photosSection = await photosHTML(photos);
  const sitBadge = ensaio.situacao === 'conforme'
    ? '<span class="badge badge-conforme">Conforme</span>'
    : '<span class="badge badge-nao-conforme">Não Conforme</span>';

  const html = `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8">${CSS}</head><body>
    ${headerHTML('RELATÓRIO DE ENSAIO')}
    <div class="section">
      <div class="section-title">Dados do Ensaio</div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Obra</div><div class="info-value">${ensaio.obra_nome || '-'}</div></div>
        <div class="info-item"><div class="info-label">Data</div><div class="info-value">${formatDate(ensaio.data)}</div></div>
        <div class="info-item"><div class="info-label">Tipo</div><div class="info-value">${ENSAIO_TYPE_LABELS[ensaio.tipo_ensaio]}</div></div>
        <div class="info-item"><div class="info-label">Local</div><div class="info-value">${ensaio.local}</div></div>
      </div>
      ${detailsHTML}
      <div class="status-line"><strong>Situação:</strong> ${sitBadge}</div>
      ${ensaio.alerta ? `<div class="alert-box"><span class="icon">⚠️</span> ${ensaio.alerta}</div>` : ''}
      ${ensaio.resultado ? `<div class="obs"><strong>Resultado:</strong> ${ensaio.resultado}</div>` : ''}
    </div>
    ${photosSection}
    ${footerHTML()}
    </body></html>
  `;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
}

export async function generateDiaryPDF(diary: DiaryEntry, photos: Photo[]): Promise<void> {
  const photosSection = await photosHTML(photos);

  const html = `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8">${CSS}</head><body>
    ${headerHTML('DIÁRIO DE OBRA')}
    <div class="section">
      <div class="section-title">Registro do Dia</div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Obra</div><div class="info-value">${diary.obra_nome || '-'}</div></div>
        <div class="info-item"><div class="info-label">Data</div><div class="info-value">${formatDate(diary.data)}</div></div>
        <div class="info-item"><div class="info-label">Clima</div><div class="info-value">${CLIMA_LABELS[diary.clima]}</div></div>
        <div class="info-item"><div class="info-label">Equipe</div><div class="info-value">${diary.equipe || '-'}</div></div>
      </div>
      <div class="obs"><strong>Atividades Executadas:</strong><br/>${diary.atividades}</div>
      ${diary.ocorrencias ? `<div class="obs" style="margin-top:10px;"><strong>Ocorrências:</strong><br/>${diary.ocorrencias}</div>` : ''}
    </div>
    ${photosSection}
    ${footerHTML()}
    </body></html>
  `;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
}
