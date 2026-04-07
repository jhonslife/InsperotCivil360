export type CamadaPavimentacao = 'subleito' | 'sub_base' | 'base' | 'cbuq';

export interface PavimentacaoInspecao {
  id: string;
  obra_id: string;
  data: string;
  trecho: string;
  camada: CamadaPavimentacao;
  espessura: number | null;
  compactacao_ok: number;
  umidade_ok: number;
  temperatura: number | null;
  latitude: number | null;
  longitude: number | null;
  km_inicio: string;
  km_fim: string;
  observacoes: string;
  assinatura_path: string | null;
  created_at: string;
  obra_nome?: string;
}
