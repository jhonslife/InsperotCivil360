export type PhotoEntityType = 'inspection' | 'rnc' | 'diary' | 'ensaio';

export interface Photo {
  id: string;
  entity_type: PhotoEntityType;
  entity_id: string;
  uri: string;
  legenda: string;
  created_at: string;
}
