import { getDatabase } from '../connection';
import { Inspection } from '../../models/Inspection';
import { ChecklistItem, ChecklistStatus } from '../../models/ChecklistItem';
import { InspectionType, INSPECTION_CHECKLISTS } from '../../constants/inspectionTypes';
import { generateId } from '../../utils/generateId';
import { nowISO } from '../../utils/formatDate';

interface InspectionChecklistInput {
  descricao: string;
  ordem: number;
  conforme?: ChecklistStatus;
  observacao?: string;
}

interface InspectionCreateInput {
  obra_id: string;
  tipo: InspectionType;
  data: string;
  local_descricao: string;
  latitude: number | null;
  longitude: number | null;
  observacoes: string;
  status?: Inspection['status'];
  assinatura_path?: string | null;
  checklistItems?: InspectionChecklistInput[];
}

async function rollbackTransaction(db: Awaited<ReturnType<typeof getDatabase>>) {
  try {
    await db.execAsync('ROLLBACK;');
  } catch {
    // Ignore rollback errors when there is no open transaction.
  }
}

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

export async function createInspection(data: InspectionCreateInput): Promise<string> {
  const db = await getDatabase();
  const id = generateId();
  const now = nowISO();
  const checklistItems = data.checklistItems ?? INSPECTION_CHECKLISTS[data.tipo].map((template) => ({
    descricao: template.descricao,
    ordem: template.ordem,
    conforme: 0 as ChecklistStatus,
    observacao: '',
  }));

  await db.execAsync('BEGIN IMMEDIATE TRANSACTION;');

  try {
    await db.runAsync(
      `INSERT INTO inspections (id, obra_id, tipo, data, local_descricao, latitude, longitude, observacoes, status, assinatura_path, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.obra_id,
        data.tipo,
        data.data,
        data.local_descricao,
        data.latitude,
        data.longitude,
        data.observacoes,
        data.status ?? 'pendente',
        data.assinatura_path ?? null,
        now,
      ]
    );

    for (const item of checklistItems) {
      const itemId = generateId();
      await db.runAsync(
        `INSERT INTO checklist_items (id, inspection_id, descricao, conforme, observacao, ordem)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          itemId,
          id,
          item.descricao,
          item.conforme ?? 0,
          item.observacao ?? '',
          item.ordem,
        ]
      );
    }

    await db.execAsync('COMMIT;');
  } catch (error) {
    await rollbackTransaction(db);
    throw error;
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
  status: Inspection['status']
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE inspections SET status = ? WHERE id = ?',
    [status, id]
  );
}

export async function getInspectionReportData(id: string): Promise<{
  inspection: Inspection;
  checklistItems: ChecklistItem[];
} | null> {
  const [inspection, checklistItems] = await Promise.all([
    getInspectionById(id),
    getChecklistItems(id),
  ]);

  if (!inspection) {
    return null;
  }

  return {
    inspection,
    checklistItems,
  };
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
