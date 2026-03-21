import { getDatabase } from '../connection';
import { Inspection } from '../../models/Inspection';
import { ChecklistItem } from '../../models/ChecklistItem';
import { InspectionType, INSPECTION_CHECKLISTS } from '../../constants/inspectionTypes';
import { generateId } from '../../utils/generateId';
import { nowISO } from '../../utils/formatDate';

export async function getAllInspections(): Promise<Inspection[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Inspection>(
    `SELECT i.*, o.nome as obra_nome
     FROM inspections i
     LEFT JOIN obras o ON i.obra_id = o.id
     ORDER BY i.created_at DESC`
  );
}

export async function getInspectionById(id: string): Promise<Inspection | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<Inspection>(
    `SELECT i.*, o.nome as obra_nome
     FROM inspections i
     LEFT JOIN obras o ON i.obra_id = o.id
     WHERE i.id = ?`,
    [id]
  );
}

export async function getInspectionsByObra(obraId: string): Promise<Inspection[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Inspection>(
    `SELECT i.*, o.nome as obra_nome
     FROM inspections i
     LEFT JOIN obras o ON i.obra_id = o.id
     WHERE i.obra_id = ?
     ORDER BY i.created_at DESC`,
    [obraId]
  );
}

export async function createInspection(
  data: {
    obra_id: string;
    tipo: InspectionType;
    data: string;
    local_descricao: string;
    latitude: number | null;
    longitude: number | null;
    observacoes: string;
  }
): Promise<string> {
  const db = await getDatabase();
  const id = generateId();
  const now = nowISO();

  await db.runAsync(
    `INSERT INTO inspections (id, obra_id, tipo, data, local_descricao, latitude, longitude, observacoes, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendente', ?)`,
    [id, data.obra_id, data.tipo, data.data, data.local_descricao, data.latitude, data.longitude, data.observacoes, now]
  );

  const templates = INSPECTION_CHECKLISTS[data.tipo];
  for (const template of templates) {
    const itemId = generateId();
    await db.runAsync(
      `INSERT INTO checklist_items (id, inspection_id, descricao, conforme, observacao, ordem)
       VALUES (?, ?, ?, 0, '', ?)`,
      [itemId, id, template.descricao, template.ordem]
    );
  }

  return id;
}

export async function getChecklistItems(inspectionId: string): Promise<ChecklistItem[]> {
  const db = await getDatabase();
  return await db.getAllAsync<ChecklistItem>(
    'SELECT * FROM checklist_items WHERE inspection_id = ? ORDER BY ordem ASC',
    [inspectionId]
  );
}

export async function updateChecklistItem(
  id: string,
  conforme: number,
  observacao: string
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE checklist_items SET conforme = ?, observacao = ? WHERE id = ?',
    [conforme, observacao, id]
  );
}

export async function updateInspectionStatus(
  id: string,
  status: string
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE inspections SET status = ? WHERE id = ?',
    [status, id]
  );
}

export async function updateInspectionSignature(
  id: string,
  signaturePath: string
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE inspections SET assinatura_path = ? WHERE id = ?',
    [signaturePath, id]
  );
}

export async function updateInspectionObservacoes(
  id: string,
  observacoes: string
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE inspections SET observacoes = ? WHERE id = ?',
    [observacoes, id]
  );
}

export async function countTodayInspections(): Promise<number> {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const result = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM inspections WHERE date(data) = ?",
    [today]
  );
  return result?.count ?? 0;
}
