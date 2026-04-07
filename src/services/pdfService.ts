import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Inspection } from '../models/Inspection';
import { ChecklistItem } from '../models/ChecklistItem';
import { RNC } from '../models/RNC';
import { Ensaio } from '../models/Ensaio';
import { DiaryEntry } from '../models/DiaryEntry';
import { Photo } from '../models/Photo';
import { Fundacao, FundacaoDadoTecnico } from '../models/Fundacao';
import { ConcretoInspecao } from '../models/ConcretoInspecao';
import { ArmaduraInspecao } from '../models/ArmaduraInspecao';
import { FormaInspecao } from '../models/FormaInspecao';
import { RompimentoCP } from '../models/RompimentoCP';
import { VedacaoInspecao } from '../models/VedacaoInspecao';
import { PavimentacaoInspecao } from '../models/PavimentacaoInspecao';
import { PavimentacaoEnsaio } from '../models/PavimentacaoEnsaio';
import { getPhotoBase64 } from './photoService';
import { formatDate } from '../utils/formatDate';
import {
  INSPECTION_TYPE_LABELS,
  GRAVIDADE_LABELS,
  ENSAIO_TYPE_LABELS,
  CLIMA_LABELS,
} from '../constants/inspectionTypes';
import { FUNDACAO_TIPO_LABELS } from '../constants/fundacaoTypes';
import { CAMADA_LABELS, PAV_ENSAIO_LABELS, PAV_ENSAIO_UNIDADES } from '../constants/pavimentacaoTypes';

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
      <h2 style="font-size:16px; margin-top:8px;">${escapeHTML(title)}</h2>
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
          <div class="photo-caption">${escapeHTML(photo.legenda || 'Sem legenda')}</div>
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
              <td>${escapeHTML(item.descricao)}</td>
              <td>${checklistStatusBadge(item.conforme)}</td>
              <td>${formatHTMLText(item.observacao, '-')}</td>
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
        <div class="info-item"><div class="info-label">Obra</div><div class="info-value">${escapeHTML(inspection.obra_nome || '-')}</div></div>
        <div class="info-item"><div class="info-label">Data</div><div class="info-value">${formatDate(inspection.data)}</div></div>
        <div class="info-item"><div class="info-label">Tipo</div><div class="info-value">${escapeHTML(INSPECTION_TYPE_LABELS[inspection.tipo])}</div></div>
        <div class="info-item"><div class="info-label">Local</div><div class="info-value">${escapeHTML(inspection.local_descricao || '-')}</div></div>
        ${inspection.latitude ? `<div class="info-item"><div class="info-label">Coordenadas</div><div class="info-value">${inspection.latitude?.toFixed(6)}, ${inspection.longitude?.toFixed(6)}</div></div>` : ''}
      </div>
    </div>
    ${checklistHTML}
    ${inspection.observacoes ? `<div class="section"><div class="obs"><strong>Observações:</strong> ${formatHTMLText(inspection.observacoes)}</div></div>` : ''}
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
        <div class="info-item"><div class="info-label">Obra</div><div class="info-value">${escapeHTML(rnc.obra_nome || '-')}</div></div>
        <div class="info-item"><div class="info-label">Data</div><div class="info-value">${formatDate(rnc.data)}</div></div>
        <div class="info-item"><div class="info-label">Gravidade</div><div class="info-value"><span class="badge ${gravClass}">${escapeHTML(gravLabel)}</span></div></div>
        <div class="info-item"><div class="info-label">Status</div><div class="info-value">${escapeHTML(statusLabel)}</div></div>
        <div class="info-item"><div class="info-label">Responsável</div><div class="info-value">${escapeHTML(rnc.responsavel || '-')}</div></div>
        <div class="info-item"><div class="info-label">Prazo</div><div class="info-value">${rnc.prazo ? formatDate(rnc.prazo) : '-'}</div></div>
      </div>
      <div class="obs"><strong>Descrição:</strong> ${formatHTMLText(rnc.descricao)}</div>
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
        <div class="info-item"><div class="info-label">Corpo de Prova</div><div class="info-value">${escapeHTML(ensaio.corpo_prova || '-')}</div></div>
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
        <div class="info-item"><div class="info-label">Obra</div><div class="info-value">${escapeHTML(ensaio.obra_nome || '-')}</div></div>
        <div class="info-item"><div class="info-label">Data</div><div class="info-value">${formatDate(ensaio.data)}</div></div>
        <div class="info-item"><div class="info-label">Tipo</div><div class="info-value">${escapeHTML(ENSAIO_TYPE_LABELS[ensaio.tipo_ensaio])}</div></div>
        <div class="info-item"><div class="info-label">Local</div><div class="info-value">${escapeHTML(ensaio.local)}</div></div>
      </div>
      ${detailsHTML}
      <div class="status-line"><strong>Situação:</strong> ${sitBadge}</div>
      ${ensaio.alerta ? `<div class="alert-box"><span class="icon">⚠️</span> ${formatHTMLText(ensaio.alerta)}</div>` : ''}
      ${ensaio.resultado ? `<div class="obs"><strong>Resultado:</strong> ${formatHTMLText(ensaio.resultado)}</div>` : ''}
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
        <div class="info-item"><div class="info-label">Obra</div><div class="info-value">${escapeHTML(diary.obra_nome || '-')}</div></div>
        <div class="info-item"><div class="info-label">Data</div><div class="info-value">${formatDate(diary.data)}</div></div>
        <div class="info-item"><div class="info-label">Clima</div><div class="info-value">${escapeHTML(CLIMA_LABELS[diary.clima])}</div></div>
        <div class="info-item"><div class="info-label">Equipe</div><div class="info-value">${escapeHTML(diary.equipe || '-')}</div></div>
      </div>
      <div class="obs"><strong>Atividades Executadas:</strong><br/>${formatHTMLText(diary.atividades)}</div>
      ${diary.ocorrencias ? `<div class="obs" style="margin-top:10px;"><strong>Ocorrências:</strong><br/>${formatHTMLText(diary.ocorrencias)}</div>` : ''}
    </div>
    ${photosSection}
    ${footerHTML()}
    </body></html>
  `;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
}

// ─── Helpers for new modules ───

function boolBadge(value: number, labelOk = 'Conforme', labelNok = 'Não Conforme'): string {
  return value === 1
    ? `<span class="badge badge-conforme">${labelOk}</span>`
    : `<span class="badge badge-nao-conforme">${labelNok}</span>`;
}

function escapeHTML(text: string | null | undefined): string {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatHTMLText(text: string | null | undefined, fallback = '-'): string {
  const content = text && text.trim() ? text : fallback;
  return escapeHTML(content).replace(/\n/g, '<br/>');
}

// ─── Fundação PDF ───

export async function generateFundacaoPDF(
  fundacao: Fundacao,
  dadosTecnicos: FundacaoDadoTecnico[],
  checklistItems: ChecklistItem[],
  photos: Photo[],
  signatureBase64: string | null
): Promise<void> {
  let dadosHTML = '';
  if (dadosTecnicos.length > 0) {
    dadosHTML = `
      <div class="section">
        <div class="section-title">Dados Técnicos</div>
        <table class="checklist">
          <tr><th>Campo</th><th>Valor</th><th>Unidade</th></tr>
          ${dadosTecnicos.map(d => `
            <tr>
              <td>${escapeHTML(d.campo)}</td>
              <td>${d.valor_numerico != null ? d.valor_numerico : escapeHTML(d.valor_texto || '-')}</td>
              <td>${escapeHTML(d.unidade)}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    `;
  }

  let checklistHTML = '';
  if (checklistItems.length > 0) {
    checklistHTML = `
      <div class="section">
        <div class="section-title">Checklist de Verificação</div>
        <table class="checklist">
          <tr><th>Item</th><th>Situação</th><th>Observação</th></tr>
          ${checklistItems.map(item => `
            <tr>
              <td>${escapeHTML(item.descricao)}</td>
              <td>${checklistStatusBadge(item.conforme)}</td>
              <td>${formatHTMLText(item.observacao, '-')}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    `;
  }

  const photosSection = await photosHTML(photos);
  const statusLabel = fundacao.status === 'em_execucao' ? 'Em Execução' : fundacao.status === 'concluida' ? 'Concluída' : 'Com NC';

  let signatureSection = '';
  if (signatureBase64) {
    signatureSection = `<div class="signature"><p style="font-size:10px; color:#6B7280; margin-bottom:5px;">Assinatura do Inspetor</p><img src="${signatureBase64}" /></div>`;
  }

  const html = `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8">${CSS}</head><body>
    ${headerHTML('RELATÓRIO DE FUNDAÇÃO')}
    <div class="section">
      <div class="section-title">Dados da Fundação</div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Obra</div><div class="info-value">${escapeHTML(fundacao.obra_nome || '-')}</div></div>
        <div class="info-item"><div class="info-label">Data</div><div class="info-value">${formatDate(fundacao.data)}</div></div>
        <div class="info-item"><div class="info-label">Tipo</div><div class="info-value">${escapeHTML(FUNDACAO_TIPO_LABELS[fundacao.tipo])}</div></div>
        <div class="info-item"><div class="info-label">Diâmetro</div><div class="info-value">${fundacao.diametro} mm</div></div>
        <div class="info-item"><div class="info-label">Prof. Projeto</div><div class="info-value">${fundacao.profundidade_projeto} m</div></div>
        <div class="info-item"><div class="info-label">Prof. Atingida</div><div class="info-value">${fundacao.profundidade_atingida != null ? fundacao.profundidade_atingida + ' m' : '-'}</div></div>
        <div class="info-item"><div class="info-label">Local</div><div class="info-value">${escapeHTML(fundacao.localizacao_desc || '-')}</div></div>
        ${fundacao.latitude ? `<div class="info-item"><div class="info-label">Coordenadas</div><div class="info-value">${fundacao.latitude?.toFixed(6)}, ${fundacao.longitude?.toFixed(6)}</div></div>` : ''}
      </div>
      <div class="status-line"><strong>Status:</strong> ${statusLabel}</div>
    </div>
    ${dadosHTML}
    ${checklistHTML}
    ${fundacao.observacoes ? `<div class="section"><div class="obs"><strong>Observações:</strong> ${formatHTMLText(fundacao.observacoes)}</div></div>` : ''}
    ${photosSection}
    ${signatureSection}
    ${footerHTML()}
    </body></html>
  `;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
}

// ─── Concreto PDF ───

export async function generateConcretoPDF(
  concreto: ConcretoInspecao,
  photos: Photo[],
  signatureBase64: string | null
): Promise<void> {
  const elemLabels: Record<string, string> = { pilar: 'Pilar', viga: 'Viga', laje: 'Laje', fundacao: 'Fundação' };
  const photosSection = await photosHTML(photos);

  const alertas: string[] = [];
  if (concreto.slump != null && (concreto.slump < 80 || concreto.slump > 120)) {
    alertas.push(`Slump ${concreto.slump} mm — fora do intervalo 80-120 mm`);
  }
  if (concreto.temperatura_concreto != null && concreto.temperatura_concreto > 35) {
    alertas.push(`Temperatura ${concreto.temperatura_concreto} °C — acima de 35°C`);
  }

  let signatureSection = '';
  if (signatureBase64) {
    signatureSection = `<div class="signature"><p style="font-size:10px; color:#6B7280; margin-bottom:5px;">Assinatura do Inspetor</p><img src="${signatureBase64}" /></div>`;
  }

  const html = `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8">${CSS}</head><body>
    ${headerHTML('RELATÓRIO DE INSPEÇÃO DE CONCRETO')}
    <div class="section">
      <div class="section-title">Dados da Inspeção</div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Obra</div><div class="info-value">${escapeHTML(concreto.obra_nome || '-')}</div></div>
        <div class="info-item"><div class="info-label">Data</div><div class="info-value">${formatDate(concreto.data)}</div></div>
        <div class="info-item"><div class="info-label">Elemento</div><div class="info-value">${escapeHTML(elemLabels[concreto.elemento] || concreto.elemento)}</div></div>
        <div class="info-item"><div class="info-label">fck Projeto</div><div class="info-value">${concreto.fck_projeto} MPa</div></div>
        <div class="info-item"><div class="info-label">Slump</div><div class="info-value">${concreto.slump != null ? concreto.slump + ' mm' : '-'}</div></div>
        <div class="info-item"><div class="info-label">Temperatura</div><div class="info-value">${concreto.temperatura_concreto != null ? concreto.temperatura_concreto + ' °C' : '-'}</div></div>
      </div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Adensamento</div><div class="info-value">${boolBadge(concreto.adensamento_ok, 'OK', 'Problema')}</div></div>
        <div class="info-item"><div class="info-label">Cura</div><div class="info-value">${boolBadge(concreto.cura_ok, 'OK', 'Problema')}</div></div>
      </div>
      ${alertas.length > 0 ? alertas.map(a => `<div class="alert-box"><span class="icon">⚠️</span> ${escapeHTML(a)}</div>`).join('') : ''}
    </div>
    ${concreto.observacoes ? `<div class="section"><div class="obs"><strong>Observações:</strong> ${formatHTMLText(concreto.observacoes)}</div></div>` : ''}
    ${photosSection}
    ${signatureSection}
    ${footerHTML()}
    </body></html>
  `;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
}

// ─── Armadura PDF ───

export async function generateArmaduraPDF(
  armadura: ArmaduraInspecao,
  photos: Photo[]
): Promise<void> {
  const photosSection = await photosHTML(photos);

  const html = `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8">${CSS}</head><body>
    ${headerHTML('RELATÓRIO DE INSPEÇÃO DE ARMADURA')}
    <div class="section">
      <div class="section-title">Dados da Inspeção</div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Obra</div><div class="info-value">${escapeHTML(armadura.obra_nome || '-')}</div></div>
        <div class="info-item"><div class="info-label">Data</div><div class="info-value">${formatDate(armadura.data)}</div></div>
        <div class="info-item"><div class="info-label">Elemento</div><div class="info-value">${escapeHTML(armadura.elemento)}</div></div>
        <div class="info-item"><div class="info-label">Diâmetro</div><div class="info-value">${armadura.diametro != null ? armadura.diametro + ' mm' : '-'}</div></div>
        <div class="info-item"><div class="info-label">Espaçamento</div><div class="info-value">${armadura.espacamento != null ? armadura.espacamento + ' cm' : '-'}</div></div>
      </div>
      <div class="section-title">Verificações</div>
      <table class="checklist">
        <tr><th>Verificação</th><th>Resultado</th></tr>
        <tr><td>Cobrimento</td><td>${boolBadge(armadura.cobrimento_ok)}</td></tr>
        <tr><td>Amarração</td><td>${boolBadge(armadura.amarracao_ok)}</td></tr>
        <tr><td>Conforme Projeto</td><td>${boolBadge(armadura.conforme_projeto)}</td></tr>
      </table>
    </div>
    ${armadura.observacoes ? `<div class="section"><div class="obs"><strong>Observações:</strong> ${formatHTMLText(armadura.observacoes)}</div></div>` : ''}
    ${photosSection}
    ${footerHTML()}
    </body></html>
  `;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
}

// ─── Formas PDF ───

export async function generateFormaPDF(
  forma: FormaInspecao,
  photos: Photo[]
): Promise<void> {
  const photosSection = await photosHTML(photos);

  const html = `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8">${CSS}</head><body>
    ${headerHTML('RELATÓRIO DE INSPEÇÃO DE FORMAS')}
    <div class="section">
      <div class="section-title">Dados da Inspeção</div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Obra</div><div class="info-value">${escapeHTML(forma.obra_nome || '-')}</div></div>
        <div class="info-item"><div class="info-label">Data</div><div class="info-value">${formatDate(forma.data)}</div></div>
        <div class="info-item"><div class="info-label">Elemento</div><div class="info-value">${escapeHTML(forma.elemento)}</div></div>
      </div>
      <div class="section-title">Verificações</div>
      <table class="checklist">
        <tr><th>Verificação</th><th>Resultado</th></tr>
        <tr><td>Alinhamento</td><td>${boolBadge(forma.alinhamento_ok)}</td></tr>
        <tr><td>Nivelamento</td><td>${boolBadge(forma.nivelamento_ok)}</td></tr>
        <tr><td>Estanqueidade</td><td>${boolBadge(forma.estanqueidade_ok)}</td></tr>
        <tr><td>Limpeza</td><td>${boolBadge(forma.limpeza_ok)}</td></tr>
        <tr><td>Desmoldante Aplicado</td><td>${boolBadge(forma.desmoldante_aplicado, 'Sim', 'Não')}</td></tr>
      </table>
    </div>
    ${forma.observacoes ? `<div class="section"><div class="obs"><strong>Observações:</strong> ${formatHTMLText(forma.observacoes)}</div></div>` : ''}
    ${photosSection}
    ${footerHTML()}
    </body></html>
  `;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
}

// ─── Rompimento CP PDF ───

export async function generateRompimentoCPPDF(
  cp: RompimentoCP,
  photos: Photo[]
): Promise<void> {
  const percentual = cp.fck_projeto > 0 ? ((cp.resistencia / cp.fck_projeto) * 100).toFixed(1) : '-';
  const conformeBadge = cp.conforme === 1
    ? '<span class="badge badge-conforme">Conforme</span>'
    : '<span class="badge badge-nao-conforme">Não Conforme</span>';

  const photosSection = await photosHTML(photos);

  const html = `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8">${CSS}</head><body>
    ${headerHTML('RELATÓRIO DE ROMPIMENTO DE CORPO DE PROVA')}
    <div class="section">
      <div class="section-title">Dados do Ensaio</div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Obra</div><div class="info-value">${escapeHTML(cp.obra_nome || '-')}</div></div>
        <div class="info-item"><div class="info-label">Data</div><div class="info-value">${formatDate(cp.data)}</div></div>
        <div class="info-item"><div class="info-label">Idade</div><div class="info-value">${cp.idade} dias</div></div>
        <div class="info-item"><div class="info-label">fck Projeto</div><div class="info-value">${cp.fck_projeto} MPa</div></div>
        <div class="info-item"><div class="info-label">Resistência</div><div class="info-value">${cp.resistencia} MPa</div></div>
        <div class="info-item"><div class="info-label">% do fck</div><div class="info-value">${percentual}%</div></div>
      </div>
      <div class="status-line"><strong>Resultado:</strong> ${conformeBadge}</div>
      ${cp.conforme === 0 ? '<div class="alert-box"><span class="icon">⚠️</span> Resistência abaixo de 95% do fck — NC gerada automaticamente (ref. NBR 7680)</div>' : ''}
    </div>
    ${cp.observacoes ? `<div class="section"><div class="obs"><strong>Observações:</strong> ${formatHTMLText(cp.observacoes)}</div></div>` : ''}
    ${photosSection}
    ${footerHTML()}
    </body></html>
  `;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
}

// ─── Vedação PDF ───

export async function generateVedacaoPDF(
  vedacao: VedacaoInspecao,
  photos: Photo[],
  signatureBase64: string | null
): Promise<void> {
  const tipoLabel = vedacao.tipo_vedacao === 'alvenaria' ? 'Alvenaria' : 'Drywall';
  const photosSection = await photosHTML(photos);

  let signatureSection = '';
  if (signatureBase64) {
    signatureSection = `<div class="signature"><p style="font-size:10px; color:#6B7280; margin-bottom:5px;">Assinatura do Inspetor</p><img src="${signatureBase64}" /></div>`;
  }

  const checks = [
    { label: 'Material Conforme', value: vedacao.material_conforme },
    { label: 'Base Nivelada', value: vedacao.base_nivelada },
    { label: 'Prumo e Alinhamento', value: vedacao.prumo_alinhamento_ok },
    { label: 'Junta Adequada', value: vedacao.junta_adequada },
    { label: 'Amarração', value: vedacao.amarracao_ok },
    { label: 'Vergas e Contravergas', value: vedacao.vergas_contravergas_ok },
    ...(vedacao.tipo_vedacao === 'drywall' ? [{ label: 'Fixação Adequada', value: vedacao.fixacao_adequada }] : []),
    { label: 'Ausência de Trincas', value: vedacao.ausencia_trincas },
    { label: 'Limpeza', value: vedacao.limpeza_ok },
  ];
  const conformes = checks.filter(c => c.value === 1).length;

  const html = `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8">${CSS}</head><body>
    ${headerHTML('RELATÓRIO DE INSPEÇÃO DE VEDAÇÃO')}
    <div class="section">
      <div class="section-title">Dados da Inspeção</div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Obra</div><div class="info-value">${escapeHTML(vedacao.obra_nome || '-')}</div></div>
        <div class="info-item"><div class="info-label">Data</div><div class="info-value">${formatDate(vedacao.data)}</div></div>
        <div class="info-item"><div class="info-label">Tipo</div><div class="info-value">${escapeHTML(tipoLabel)}</div></div>
        <div class="info-item"><div class="info-label">Local</div><div class="info-value">${escapeHTML(vedacao.local_descricao || '-')}</div></div>
        <div class="info-item"><div class="info-label">Conformidade</div><div class="info-value">${conformes}/${checks.length} itens</div></div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">Verificações</div>
      <table class="checklist">
        <tr><th>Verificação</th><th>Resultado</th></tr>
        ${checks.map(c => `<tr><td>${c.label}</td><td>${boolBadge(c.value)}</td></tr>`).join('')}
      </table>
    </div>
    ${vedacao.observacoes ? `<div class="section"><div class="obs"><strong>Observações:</strong> ${formatHTMLText(vedacao.observacoes)}</div></div>` : ''}
    ${photosSection}
    ${signatureSection}
    ${footerHTML()}
    </body></html>
  `;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
}

// ─── Pavimentação PDF ───

export async function generatePavimentacaoPDF(
  inspecao: PavimentacaoInspecao,
  ensaios: PavimentacaoEnsaio[],
  checklistItems: ChecklistItem[],
  photos: Photo[],
  signatureBase64: string | null
): Promise<void> {
  const photosSection = await photosHTML(photos);

  let checklistHTML = '';
  if (checklistItems.length > 0) {
    checklistHTML = `
      <div class="section">
        <div class="section-title">Checklist de Verificação</div>
        <table class="checklist">
          <tr><th>Item</th><th>Situação</th><th>Observação</th></tr>
          ${checklistItems.map(item => `
            <tr>
              <td>${escapeHTML(item.descricao)}</td>
              <td>${checklistStatusBadge(item.conforme)}</td>
              <td>${formatHTMLText(item.observacao, '-')}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    `;
  }

  let ensaiosHTML = '';
  if (ensaios.length > 0) {
    ensaiosHTML = `
      <div class="section">
        <div class="section-title">Ensaios Realizados</div>
        <table class="checklist">
          <tr><th>Tipo</th><th>Resultado</th><th>Situação</th></tr>
          ${ensaios.map(e => `
            <tr>
              <td>${escapeHTML(PAV_ENSAIO_LABELS[e.tipo_ensaio])}</td>
              <td>${e.resultado != null ? e.resultado + ' ' + PAV_ENSAIO_UNIDADES[e.tipo_ensaio] : '-'}</td>
              <td>${boolBadge(e.conforme)}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    `;
  }

  const alertas: string[] = [];
  if (inspecao.camada === 'cbuq' && inspecao.temperatura != null) {
    if (inspecao.temperatura < 107 || inspecao.temperatura > 177) {
      alertas.push(`Temperatura CBUQ ${inspecao.temperatura}°C — fora do intervalo 107-177°C (DNIT-ES 141/2022)`);
    }
  }

  let signatureSection = '';
  if (signatureBase64) {
    signatureSection = `<div class="signature"><p style="font-size:10px; color:#6B7280; margin-bottom:5px;">Assinatura do Inspetor</p><img src="${signatureBase64}" /></div>`;
  }

  const html = `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8">${CSS}</head><body>
    ${headerHTML('RELATÓRIO DE INSPEÇÃO DE PAVIMENTAÇÃO')}
    <div class="section">
      <div class="section-title">Dados da Inspeção</div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Obra</div><div class="info-value">${escapeHTML(inspecao.obra_nome || '-')}</div></div>
        <div class="info-item"><div class="info-label">Data</div><div class="info-value">${formatDate(inspecao.data)}</div></div>
        <div class="info-item"><div class="info-label">Camada</div><div class="info-value">${escapeHTML(CAMADA_LABELS[inspecao.camada])}</div></div>
        <div class="info-item"><div class="info-label">Trecho</div><div class="info-value">${escapeHTML(inspecao.trecho || '-')}</div></div>
        <div class="info-item"><div class="info-label">KM</div><div class="info-value">${escapeHTML(inspecao.km_inicio || '-')} a ${escapeHTML(inspecao.km_fim || '-')}</div></div>
        <div class="info-item"><div class="info-label">Espessura</div><div class="info-value">${inspecao.espessura != null ? inspecao.espessura + ' cm' : '-'}</div></div>
        ${inspecao.temperatura != null ? `<div class="info-item"><div class="info-label">Temperatura</div><div class="info-value">${inspecao.temperatura} °C</div></div>` : ''}
      </div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Compactação</div><div class="info-value">${boolBadge(inspecao.compactacao_ok, 'OK', 'Falha')}</div></div>
        <div class="info-item"><div class="info-label">Umidade</div><div class="info-value">${boolBadge(inspecao.umidade_ok, 'OK', 'Falha')}</div></div>
      </div>
      ${alertas.length > 0 ? alertas.map(a => `<div class="alert-box"><span class="icon">⚠️</span> ${escapeHTML(a)}</div>`).join('') : ''}
    </div>
    ${checklistHTML}
    ${ensaiosHTML}
    ${inspecao.observacoes ? `<div class="section"><div class="obs"><strong>Observações:</strong> ${formatHTMLText(inspecao.observacoes)}</div></div>` : ''}
    ${photosSection}
    ${signatureSection}
    ${footerHTML()}
    </body></html>
  `;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
}
