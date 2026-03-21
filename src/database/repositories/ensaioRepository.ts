import { getDatabase } from '../connection';
import { Ensaio } from '../../models/Ensaio';
import { generateId } from '../../utils/generateId';
import { nowISO } from '../../utils/formatDate';
import { EnsaioTipo, ENSAIO_LIMITS } from '../../constants/inspectionTypes';

interface EnsaioInput {
  obra_id: string;
  tipo_ensaio: EnsaioTipo;
  data: string;
  local: string;
  slump?: number | null;
  temperatura?: number | null;
  corpo_prova?: string;
  fluidez?: number | null;
  resistencia?: number | null;
  compactacao?: number | null;
  deflexao?: number | null;
  resultado?: string;
  situacao: 'conforme' | 'nao_conforme';
}

function checkAlerts(tipo: EnsaioTipo, data: any): string {
  const alerts: string[] = [];

  if (tipo === 'concreto') {
    const limits = ENSAIO_LIMITS.concreto;
    if (data.slump != null && (data.slump < limits.slump.min || data.slump > limits.slump.max)) {
      alerts.push(`Slump (${data.slump}mm) fora do padrão recomendado (${limits.slump.min}-${limits.slump.max}mm)`);
    }
    if (data.temperatura != null && (data.temperatura < limits.temperatura.min || data.temperatura > limits.temperatura.max)) {
      alerts.push(`Temperatura (${data.temperatura}°C) fora do padrão recomendado (${limits.temperatura.min}-${limits.temperatura.max}°C)`);
    }
  } else if (tipo === 'graute') {
    const limits = ENSAIO_LIMITS.graute;
    if (data.fluidez != null && (data.fluidez < limits.fluidez.min || data.fluidez > limits.fluidez.max)) {
      alerts.push(`Fluidez (${data.fluidez}s) fora do padrão recomendado (${limits.fluidez.min}-${limits.fluidez.max}s)`);
    }
  } else if (tipo === 'pavimentacao') {
    const limits = ENSAIO_LIMITS.pavimentacao;
    if (data.compactacao != null && (data.compactacao < limits.compactacao.min || data.compactacao > limits.compactacao.max)) {
      alerts.push(`Compactação (${data.compactacao}%) fora do padrão recomendado (${limits.compactacao.min}-${limits.compactacao.max}%)`);
    }
    if (data.deflexao != null && (data.deflexao < limits.deflexao.min || data.deflexao > limits.deflexao.max)) {
      alerts.push(`Deflexão (${data.deflexao}) fora do padrão recomendado (máx ${limits.deflexao.max} x 0.01mm)`);
    }
  }

  return alerts.join('; ');
}

export async function getAllEnsaios(): Promise<Ensaio[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Ensaio>(
    `SELECT e.*, o.nome as obra_nome
     FROM ensaios e
     LEFT JOIN obras o ON e.obra_id = o.id
     ORDER BY e.created_at DESC`
  );
}

export async function getEnsaioById(id: string): Promise<Ensaio | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<Ensaio>(
    `SELECT e.*, o.nome as obra_nome
     FROM ensaios e
     LEFT JOIN obras o ON e.obra_id = o.id
     WHERE e.id = ?`,
    [id]
  );
}

export async function createEnsaio(data: EnsaioInput): Promise<Ensaio> {
  const db = await getDatabase();
  const id = generateId();
  const now = nowISO();
  const alerta = checkAlerts(data.tipo_ensaio, data);

  await db.runAsync(
    `INSERT INTO ensaios (id, obra_id, tipo_ensaio, data, local, slump, temperatura, corpo_prova, fluidez, resistencia, compactacao, deflexao, resultado, situacao, alerta, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, data.obra_id, data.tipo_ensaio, data.data, data.local,
      data.slump ?? null, data.temperatura ?? null, data.corpo_prova ?? '',
      data.fluidez ?? null, data.resistencia ?? null,
      data.compactacao ?? null, data.deflexao ?? null,
      data.resultado ?? '', data.situacao, alerta, now,
    ]
  );

  return {
    id,
    obra_id: data.obra_id,
    tipo_ensaio: data.tipo_ensaio,
    data: data.data,
    local: data.local,
    slump: data.slump ?? null,
    temperatura: data.temperatura ?? null,
    corpo_prova: data.corpo_prova ?? '',
    fluidez: data.fluidez ?? null,
    resistencia: data.resistencia ?? null,
    compactacao: data.compactacao ?? null,
    deflexao: data.deflexao ?? null,
    resultado: data.resultado ?? '',
    situacao: data.situacao,
    alerta,
    created_at: now,
  };
}

export async function updateEnsaio(id: string, data: EnsaioInput): Promise<void> {
  const db = await getDatabase();
  const alerta = checkAlerts(data.tipo_ensaio, data);

  await db.runAsync(
    `UPDATE ensaios
     SET obra_id = ?, tipo_ensaio = ?, data = ?, local = ?, slump = ?, temperatura = ?,
         corpo_prova = ?, fluidez = ?, resistencia = ?, compactacao = ?, deflexao = ?,
         resultado = ?, situacao = ?, alerta = ?
     WHERE id = ?`,
    [
      data.obra_id,
      data.tipo_ensaio,
      data.data,
      data.local,
      data.slump ?? null,
      data.temperatura ?? null,
      data.corpo_prova ?? '',
      data.fluidez ?? null,
      data.resistencia ?? null,
      data.compactacao ?? null,
      data.deflexao ?? null,
      data.resultado ?? '',
      data.situacao,
      alerta,
      id,
    ]
  );
}
