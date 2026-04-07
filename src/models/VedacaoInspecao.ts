export type TipoVedacao = 'alvenaria' | 'drywall';

export interface VedacaoInspecao {
  id: string;
  obra_id: string;
  data: string;
  tipo_vedacao: TipoVedacao;
  local_descricao: string;
  material_conforme: number;
  base_nivelada: number;
  prumo_alinhamento_ok: number;
  junta_adequada: number;
  amarracao_ok: number;
  vergas_contravergas_ok: number;
  fixacao_adequada: number;
  ausencia_trincas: number;
  limpeza_ok: number;
  observacoes: string;
  latitude: number | null;
  longitude: number | null;
  assinatura_path: string | null;
  created_at: string;
  obra_nome?: string;
}
