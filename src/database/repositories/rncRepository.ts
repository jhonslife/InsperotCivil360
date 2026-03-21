import { getDatabase } from '../connection';
import { RNC } from '../../models/RNC';
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
}

async function rollbackTransaction(db: Awaited<ReturnType<typeof getDatabase>>) {
  try {
    await db.execAsync('ROLLBACK;');
  } catch {
    // Ignore rollback errors when there is no open transaction.
  }
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
      'SELECT COALESCE(MAX(numero), 0) + 1 as next_num FROM rnc'
    );
    numero = result?.next_num ?? 1;

    await db.runAsync(
      `INSERT INTO rnc (id, numero, obra_id, data, descricao, gravidade, responsavel, prazo, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'aberta', ?)`,
      [id, numero, data.obra_id, data.data, data.descricao, data.gravidade, data.responsavel, data.prazo, now]
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
     SET obra_id = ?, data = ?, descricao = ?, gravidade = ?, responsavel = ?, prazo = ?, status = ?
     WHERE id = ?`,
    [
      data.obra_id,
      data.data,
      data.descricao,
      data.gravidade,
      data.responsavel,
      data.prazo,
      data.status,
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
