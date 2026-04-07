export interface ArmaduraInspecao {
  id: string;
  obra_id: string;
  data: string;
  elemento: string;
  diametro: number | null;
  espacamento: number | null;
  cobrimento_ok: number;
  amarracao_ok: number;
  conforme_projeto: number;
  observacoes: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  obra_nome?: string;
}
