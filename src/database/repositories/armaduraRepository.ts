import { getDatabase } from '../connection';
import { ArmaduraInspecao } from '../../models/ArmaduraInspecao';
import { generateId } from '../../utils/generateId';
import { nowISO } from '../../utils/formatDate';

interface ArmaduraInput {
  obra_id: string;
  data: string;
  elemento: string;
  diametro?: number | null;
  espacamento?: number | null;
  cobrimento_ok: number;
  amarracao_ok: number;
  conforme_projeto: number;
  observacoes: string;
  latitude?: number | null;
  longitude?: number | null;
}

export async function getAllArmaduraInspecoes(): Promise<ArmaduraInspecao[]> {
  const db = await getDatabase();
  return await db.getAllAsync<ArmaduraInspecao>(
    `SELECT a.*, o.nome as obra_nome FROM armadura_inspecoes a LEFT JOIN obras o ON a.obra_id = o.id ORDER BY a.created_at DESC`
  );
}

export async function getArmaduraById(id: string): Promise<ArmaduraInspecao | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<ArmaduraInspecao>(
    `SELECT a.*, o.nome as obra_nome FROM armadura_inspecoes a LEFT JOIN obras o ON a.obra_id = o.id WHERE a.id = ?`, [id]
  );
}

export async function createArmaduraInspecao(data: ArmaduraInput): Promise<string> {
  const db = await getDatabase();
  const id = generateId();
  const now = nowISO();
  await db.runAsync(
    `INSERT INTO armadura_inspecoes (id, obra_id, data, elemento, diametro, espacamento, cobrimento_ok, amarracao_ok, conforme_projeto, observacoes, latitude, longitude, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.obra_id, data.data, data.elemento, data.diametro ?? null, data.espacamento ?? null, data.cobrimento_ok, data.amarracao_ok, data.conforme_projeto, data.observacoes, data.latitude ?? null, data.longitude ?? null, now]
  );
  return id;
}

export async function updateArmaduraInspecao(id: string, data: ArmaduraInput): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE armadura_inspecoes
     SET obra_id = ?, data = ?, elemento = ?, diametro = ?, espacamento = ?, cobrimento_ok = ?, amarracao_ok = ?, conforme_projeto = ?, observacoes = ?,
         latitude = COALESCE(?, latitude), longitude = COALESCE(?, longitude)
     WHERE id = ?`,
    [data.obra_id, data.data, data.elemento, data.diametro ?? null, data.espacamento ?? null, data.cobrimento_ok, data.amarracao_ok, data.conforme_projeto, data.observacoes, data.latitude ?? null, data.longitude ?? null, id]
  );
}

export async function countTodayArmaduraInspecoes(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM armadura_inspecoes WHERE date(data) = date('now', 'localtime')"
  );
  return result?.count ?? 0;
}
