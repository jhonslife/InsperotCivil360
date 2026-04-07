import { getDatabase } from '../connection';
import { FormaInspecao } from '../../models/FormaInspecao';
import { generateId } from '../../utils/generateId';
import { nowISO } from '../../utils/formatDate';

interface FormaInput {
  obra_id: string;
  data: string;
  elemento: string;
  alinhamento_ok: number;
  nivelamento_ok: number;
  estanqueidade_ok: number;
  limpeza_ok: number;
  desmoldante_aplicado: number;
  observacoes: string;
  latitude?: number | null;
  longitude?: number | null;
}

export async function getAllFormaInspecoes(): Promise<FormaInspecao[]> {
  const db = await getDatabase();
  return await db.getAllAsync<FormaInspecao>(
    `SELECT f.*, o.nome as obra_nome FROM formas_inspecoes f LEFT JOIN obras o ON f.obra_id = o.id ORDER BY f.created_at DESC`
  );
}

export async function getFormaById(id: string): Promise<FormaInspecao | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<FormaInspecao>(
    `SELECT f.*, o.nome as obra_nome FROM formas_inspecoes f LEFT JOIN obras o ON f.obra_id = o.id WHERE f.id = ?`, [id]
  );
}

export async function createFormaInspecao(data: FormaInput): Promise<string> {
  const db = await getDatabase();
  const id = generateId();
  const now = nowISO();
  await db.runAsync(
    `INSERT INTO formas_inspecoes (id, obra_id, data, elemento, alinhamento_ok, nivelamento_ok, estanqueidade_ok, limpeza_ok, desmoldante_aplicado, observacoes, latitude, longitude, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.obra_id, data.data, data.elemento, data.alinhamento_ok, data.nivelamento_ok, data.estanqueidade_ok, data.limpeza_ok, data.desmoldante_aplicado, data.observacoes, data.latitude ?? null, data.longitude ?? null, now]
  );
  return id;
}

export async function updateFormaInspecao(id: string, data: FormaInput): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE formas_inspecoes SET obra_id = ?, data = ?, elemento = ?, alinhamento_ok = ?, nivelamento_ok = ?, estanqueidade_ok = ?, limpeza_ok = ?, desmoldante_aplicado = ?, observacoes = ?, latitude = ?, longitude = ? WHERE id = ?`,
    [data.obra_id, data.data, data.elemento, data.alinhamento_ok, data.nivelamento_ok, data.estanqueidade_ok, data.limpeza_ok, data.desmoldante_aplicado, data.observacoes, data.latitude ?? null, data.longitude ?? null, id]
  );
}

export async function countTodayFormaInspecoes(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM formas_inspecoes WHERE date(data) = date('now', 'localtime')"
  );
  return result?.count ?? 0;
}
