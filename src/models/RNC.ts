import { Gravidade } from '../constants/inspectionTypes';

export type RNCStatus = 'aberta' | 'em_andamento' | 'fechada';

export interface RNC {
  id: string;
  numero: number;
  obra_id: string;
  data: string;
  descricao: string;
  gravidade: Gravidade;
  responsavel: string;
  prazo: string;
  status: RNCStatus;
  created_at: string;
  obra_nome?: string;
}
