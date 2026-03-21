import { ClimaType } from '../constants/inspectionTypes';

export interface DiaryEntry {
  id: string;
  obra_id: string;
  data: string;
  equipe: string;
  clima: ClimaType;
  atividades: string;
  ocorrencias: string;
  created_at: string;
  obra_nome?: string;
}
