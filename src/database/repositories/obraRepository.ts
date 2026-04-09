import { getDatabase } from '../connection';
import { Obra } from '../../models/Obra';
import { generateId } from '../../utils/generateId';
import { nowISO } from '../../utils/formatDate';

export async function getAllObras(): Promise<Obra[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Obra>('SELECT * FROM obras ORDER BY created_at DESC');
}

export async function getObraById(id: string): Promise<Obra | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<Obra>('SELECT * FROM obras WHERE id = ?', [id]);
}

export async function getActiveObras(): Promise<Obra[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Obra>(
    "SELECT * FROM obras WHERE LOWER(status) = 'ativa' ORDER BY nome ASC"
  );
}

export async function createObra(
  obra: Omit<Obra, 'id' | 'created_at' | 'updated_at' | 'status'>
): Promise<Obra> {
  const db = await getDatabase();
  const id = generateId();
  const now = nowISO();

  await db.runAsync(
    `INSERT INTO obras (id, nome, local, cliente, tipo, data_inicio, responsavel_tecnico, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'ativa', ?, ?)`,
    [id, obra.nome, obra.local, obra.cliente, obra.tipo, obra.data_inicio, obra.responsavel_tecnico, now, now]
  );

  return {
    id,
    ...obra,
    status: 'ativa',
    created_at: now,
    updated_at: now,
  };
}

export async function updateObra(id: string, obra: Partial<Obra>): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (obra.nome !== undefined) { fields.push('nome = ?'); values.push(obra.nome); }
  if (obra.local !== undefined) { fields.push('local = ?'); values.push(obra.local); }
  if (obra.cliente !== undefined) { fields.push('cliente = ?'); values.push(obra.cliente); }
  if (obra.tipo !== undefined) { fields.push('tipo = ?'); values.push(obra.tipo); }
  if (obra.data_inicio !== undefined) { fields.push('data_inicio = ?'); values.push(obra.data_inicio); }
  if (obra.responsavel_tecnico !== undefined) { fields.push('responsavel_tecnico = ?'); values.push(obra.responsavel_tecnico); }
  if (obra.status !== undefined) { fields.push('status = ?'); values.push(obra.status); }

  if (fields.length === 0) return;

  fields.push('updated_at = ?');
  values.push(nowISO());
  values.push(id);

  await db.runAsync(`UPDATE obras SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function countActiveObras(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM obras WHERE LOWER(status) = 'ativa'"
  );
  return result?.count ?? 0;
}
