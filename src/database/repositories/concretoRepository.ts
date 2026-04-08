import { getDatabase } from '../connection';
import { ConcretoInspecao } from '../../models/ConcretoInspecao';
import { generateId } from '../../utils/generateId';
import { nowISO } from '../../utils/formatDate';

interface ConcretoInput {
  obra_id: string;
  data: string;
  elemento: ConcretoInspecao['elemento'];
  fck_projeto: number;
  slump?: number | null;
  temperatura_concreto?: number | null;
  adensamento_ok: number;
  cura_ok: number;
  observacoes: string;
  latitude?: number | null;
  longitude?: number | null;
  assinatura_path?: string | null;
}

export async function getAllConcretoInspecoes(): Promise<ConcretoInspecao[]> {
  const db = await getDatabase();
  return await db.getAllAsync<ConcretoInspecao>(
    `SELECT c.*, o.nome as obra_nome FROM concreto_inspecoes c LEFT JOIN obras o ON c.obra_id = o.id ORDER BY c.created_at DESC`
  );
}

export async function getConcretoById(id: string): Promise<ConcretoInspecao | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<ConcretoInspecao>(
    `SELECT c.*, o.nome as obra_nome FROM concreto_inspecoes c LEFT JOIN obras o ON c.obra_id = o.id WHERE c.id = ?`, [id]
  );
}

export async function createConcretoInspecao(data: ConcretoInput): Promise<string> {
  const db = await getDatabase();
  const id = generateId();
  const now = nowISO();

  await db.runAsync(
    `INSERT INTO concreto_inspecoes (id, obra_id, data, elemento, fck_projeto, slump, temperatura_concreto, adensamento_ok, cura_ok, observacoes, latitude, longitude, assinatura_path, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.obra_id, data.data, data.elemento, data.fck_projeto, data.slump ?? null, data.temperatura_concreto ?? null, data.adensamento_ok, data.cura_ok, data.observacoes, data.latitude ?? null, data.longitude ?? null, data.assinatura_path ?? null, now]
  );

  return id;
}

export async function updateConcretoInspecao(id: string, data: ConcretoInput): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE concreto_inspecoes
     SET obra_id = ?, data = ?, elemento = ?, fck_projeto = ?, slump = ?, temperatura_concreto = ?, adensamento_ok = ?, cura_ok = ?, observacoes = ?,
         latitude = COALESCE(?, latitude), longitude = COALESCE(?, longitude), assinatura_path = COALESCE(?, assinatura_path)
     WHERE id = ?`,
    [data.obra_id, data.data, data.elemento, data.fck_projeto, data.slump ?? null, data.temperatura_concreto ?? null, data.adensamento_ok, data.cura_ok, data.observacoes, data.latitude ?? null, data.longitude ?? null, data.assinatura_path ?? null, id]
  );
}

export async function updateConcretoSignature(id: string, signaturePath: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE concreto_inspecoes SET assinatura_path = ? WHERE id = ?', [signaturePath, id]);
}

export async function countTodayConcretoInspecoes(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM concreto_inspecoes WHERE date(data) = date('now', 'localtime')"
  );
  return result?.count ?? 0;
}
