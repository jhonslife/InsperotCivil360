import { getDatabase } from '../connection';
import { RNC, RNCOrigemTipo } from '../../models/RNC';
import { generateId } from '../../utils/generateId';
import { nowISO } from '../../utils/formatDate';
import { Gravidade } from '../../constants/inspectionTypes';

interface RNCInput {
  obra_id: string;
  data: string;
  descricao: string;
  gravidade: Gravidade;
  responsavel: string;
  prazo: string;
  origem_tipo?: string;
  origem_id?: string;
  causa?: string;
  acao_corretiva?: string;
}

async function rollbackTransaction(db: Awaited<ReturnType<typeof getDatabase>>) {
  try {
    await db.execAsync('ROLLBACK;');
  } catch {
    // Ignore rollback errors when there is no open transaction.
  }
}

export async function findOpenRNCByOrigin(
  obraId: string,
  origemTipo: RNCOrigemTipo,
  origemId: string,
  descricao: string
): Promise<RNC | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<RNC>(
    `SELECT r.*, o.nome as obra_nome
     FROM rnc r
     LEFT JOIN obras o ON r.obra_id = o.id
     WHERE r.obra_id = ?
       AND r.origem_tipo = ?
       AND r.origem_id = ?
       AND r.descricao = ?
       AND r.status != 'fechada'
     LIMIT 1`,
    [obraId, origemTipo, origemId, descricao]
  );
}

export async function getAllRNCs(): Promise<RNC[]> {
  const db = await getDatabase();
  return await db.getAllAsync<RNC>(
    `SELECT r.*, o.nome as obra_nome
     FROM rnc r
     LEFT JOIN obras o ON r.obra_id = o.id
     ORDER BY r.created_at DESC`
  );
}

export async function getRNCById(id: string): Promise<RNC | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<RNC>(
    `SELECT r.*, o.nome as obra_nome
     FROM rnc r
     LEFT JOIN obras o ON r.obra_id = o.id
     WHERE r.id = ?`,
    [id]
  );
}

export async function createRNC(data: RNCInput): Promise<RNC> {
  const db = await getDatabase();
  const id = generateId();
  const now = nowISO();
  let numero = 1;

  await db.execAsync('BEGIN IMMEDIATE TRANSACTION;');

  try {
    const result = await db.getFirstAsync<{ next_num: number | null }>(
      'SELECT COALESCE(MAX(numero), 0) + 1 as next_num FROM rnc WHERE obra_id = ?',
      [data.obra_id]
    );
    numero = result?.next_num ?? 1;

    await db.runAsync(
      `INSERT INTO rnc (id, numero, obra_id, data, descricao, gravidade, responsavel, prazo, status, origem_tipo, origem_id, causa, acao_corretiva, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'aberta', ?, ?, ?, ?, ?)`,
      [id, numero, data.obra_id, data.data, data.descricao, data.gravidade, data.responsavel, data.prazo, data.origem_tipo ?? '', data.origem_id ?? '', data.causa ?? '', data.acao_corretiva ?? '', now]
    );

    await db.execAsync('COMMIT;');
  } catch (error) {
    await rollbackTransaction(db);
    throw error;
  }

  return {
    id,
    numero,
    ...data,
    origem_tipo: (data.origem_tipo ?? '') as RNCOrigemTipo,
    origem_id: data.origem_id ?? '',
    causa: data.causa ?? '',
    acao_corretiva: data.acao_corretiva ?? '',
    status: 'aberta',
    created_at: now,
  };
}

export async function updateRNCStatus(id: string, status: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE rnc SET status = ? WHERE id = ?', [status, id]);
}

export async function updateRNC(
  id: string,
  data: RNCInput & { status: RNC['status'] }
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE rnc
     SET obra_id = ?, data = ?, descricao = ?, gravidade = ?, responsavel = ?, prazo = ?, status = ?,
         origem_tipo = COALESCE(?, origem_tipo), origem_id = COALESCE(?, origem_id), causa = COALESCE(?, causa), acao_corretiva = COALESCE(?, acao_corretiva)
     WHERE id = ?`,
    [
      data.obra_id,
      data.data,
      data.descricao,
      data.gravidade,
      data.responsavel,
      data.prazo,
      data.status,
      data.origem_tipo ?? null,
      data.origem_id ?? null,
      data.causa ?? null,
      data.acao_corretiva ?? null,
      id,
    ]
  );
}

export async function countOpenRNCs(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM rnc WHERE status != 'fechada'"
  );
  return result?.count ?? 0;
}
