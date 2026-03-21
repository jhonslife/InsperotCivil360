import { getDatabase } from '../connection';
import { RNC } from '../../models/RNC';
import { generateId } from '../../utils/generateId';
import { nowISO } from '../../utils/formatDate';
import { Gravidade } from '../../constants/inspectionTypes';

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

export async function getNextRNCNumber(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ max_num: number | null }>(
    'SELECT MAX(numero) as max_num FROM rnc'
  );
  return (result?.max_num ?? 0) + 1;
}

export async function createRNC(data: {
  obra_id: string;
  data: string;
  descricao: string;
  gravidade: Gravidade;
  responsavel: string;
  prazo: string;
}): Promise<RNC> {
  const db = await getDatabase();
  const id = generateId();
  const now = nowISO();
  const numero = await getNextRNCNumber();

  await db.runAsync(
    `INSERT INTO rnc (id, numero, obra_id, data, descricao, gravidade, responsavel, prazo, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'aberta', ?)`,
    [id, numero, data.obra_id, data.data, data.descricao, data.gravidade, data.responsavel, data.prazo, now]
  );

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

export async function countOpenRNCs(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM rnc WHERE status != 'fechada'"
  );
  return result?.count ?? 0;
}
