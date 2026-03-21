import { EnsaioTipo } from '../constants/inspectionTypes';

export type SituacaoEnsaio = 'conforme' | 'nao_conforme';

export interface Ensaio {
  id: string;
  obra_id: string;
  tipo_ensaio: EnsaioTipo;
  data: string;
  local: string;
  slump: number | null;
  temperatura: number | null;
  corpo_prova: string;
  fluidez: number | null;
  resistencia: number | null;
  compactacao: number | null;
  deflexao: number | null;
  resultado: string;
  situacao: SituacaoEnsaio;
  alerta: string;
  created_at: string;
  obra_nome?: string;
}
