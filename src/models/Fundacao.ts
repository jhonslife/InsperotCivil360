export type FundacaoTipo =
  | 'estaca_cravada'
  | 'estaca_escavada'
  | 'estaca_helice_continua'
  | 'estaca_strauss'
  | 'estaca_raiz'
  | 'tubulao';

export type FundacaoStatus = 'em_execucao' | 'concluida' | 'com_nc';

export interface Fundacao {
  id: string;
  obra_id: string;
  tipo: FundacaoTipo;
  diametro: number;
  profundidade_projeto: number;
  profundidade_atingida: number | null;
  latitude: number | null;
  longitude: number | null;
  localizacao_desc: string;
  data: string;
  status: FundacaoStatus;
  observacoes: string;
  assinatura_path: string | null;
  created_at: string;
  obra_nome?: string;
}

export interface FundacaoDadoTecnico {
  id: string;
  fundacao_id: string;
  campo: string;
  valor_numerico: number | null;
  valor_texto: string;
  unidade: string;
  created_at: string;
}
