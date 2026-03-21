import { getDatabase } from '../connection';
import { Photo, PhotoEntityType } from '../../models/Photo';
import { generateId } from '../../utils/generateId';
import { nowISO } from '../../utils/formatDate';

export async function getPhotosByEntity(
  entityType: PhotoEntityType,
  entityId: string
): Promise<Photo[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Photo>(
    'SELECT * FROM photos WHERE entity_type = ? AND entity_id = ? ORDER BY created_at ASC',
    [entityType, entityId]
  );
}

export async function addPhoto(
  entityType: PhotoEntityType,
  entityId: string,
  uri: string,
  legenda: string = ''
): Promise<Photo> {
  const db = await getDatabase();
  const id = generateId();
  const now = nowISO();

  await db.runAsync(
    'INSERT INTO photos (id, entity_type, entity_id, uri, legenda, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, entityType, entityId, uri, legenda, now]
  );

  return {
    id,
    entity_type: entityType,
    entity_id: entityId,
    uri,
    legenda,
    created_at: now,
  };
}

export async function deletePhoto(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM photos WHERE id = ?', [id]);
}
