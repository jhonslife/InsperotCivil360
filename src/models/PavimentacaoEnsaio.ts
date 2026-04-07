export type PavEnsaioTipo = 'grau_compactacao' | 'densidade_in_situ' | 'teor_ligante' | 'marshall';

export interface PavimentacaoEnsaio {
  id: string;
  obra_id: string;
  pavimentacao_inspecao_id: string | null;
  data: string;
  trecho: string;
  tipo_ensaio: PavEnsaioTipo;
  resultado: number | null;
  unidade: string;
  conforme: number;
  observacoes: string;
  created_at: string;
  obra_nome?: string;
}
