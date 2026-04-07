export interface RompimentoCP {
  id: string;
  obra_id: string;
  concreto_inspecao_id: string | null;
  data: string;
  idade: number;
  resistencia: number;
  fck_projeto: number;
  conforme: number;
  observacoes: string;
  created_at: string;
  obra_nome?: string;
}
