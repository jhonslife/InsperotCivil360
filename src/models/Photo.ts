export type PhotoEntityType =
  | 'inspection' | 'rnc' | 'diary' | 'ensaio'
  | 'fundacao' | 'concreto' | 'armadura' | 'formas'
  | 'vedacao' | 'pavimentacao' | 'pav_ensaio' | 'rompimento_cp';

export interface Photo {
  id: string;
  entity_type: PhotoEntityType;
  entity_id: string;
  uri: string;
  legenda: string;
  created_at: string;
}
