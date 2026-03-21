import { getDatabase } from '../connection';
import { DiaryEntry } from '../../models/DiaryEntry';
import { generateId } from '../../utils/generateId';
import { nowISO } from '../../utils/formatDate';
import { ClimaType } from '../../constants/inspectionTypes';

export async function getAllDiaryEntries(): Promise<DiaryEntry[]> {
  const db = await getDatabase();
  return await db.getAllAsync<DiaryEntry>(
    `SELECT d.*, o.nome as obra_nome
     FROM diary_entries d
     LEFT JOIN obras o ON d.obra_id = o.id
     ORDER BY d.data DESC`
  );
}

export async function getDiaryById(id: string): Promise<DiaryEntry | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<DiaryEntry>(
    `SELECT d.*, o.nome as obra_nome
     FROM diary_entries d
     LEFT JOIN obras o ON d.obra_id = o.id
     WHERE d.id = ?`,
    [id]
  );
}

export async function createDiaryEntry(data: {
  obra_id: string;
  data: string;
  equipe: string;
  clima: ClimaType;
  atividades: string;
  ocorrencias: string;
}): Promise<DiaryEntry> {
  const db = await getDatabase();
  const id = generateId();
  const now = nowISO();

  await db.runAsync(
    `INSERT INTO diary_entries (id, obra_id, data, equipe, clima, atividades, ocorrencias, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.obra_id, data.data, data.equipe, data.clima, data.atividades, data.ocorrencias, now]
  );

  return {
    id,
    ...data,
    created_at: now,
  };
}
