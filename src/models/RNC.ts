import { Gravidade } from '../constants/inspectionTypes';

export type RNCStatus = 'aberta' | 'em_andamento' | 'fechada';

export type RNCOrigemTipo =
  | 'fundacao' | 'concreto' | 'armadura' | 'formas'
  | 'vedacao' | 'pavimentacao' | 'rompimento_cp' | 'ensaio' | 'manual' | '';

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
  origem_tipo: RNCOrigemTipo;
  origem_id: string;
  causa: string;
  acao_corretiva: string;
  created_at: string;
  obra_nome?: string;
}
