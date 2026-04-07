export interface FormaInspecao {
  id: string;
  obra_id: string;
  data: string;
  elemento: string;
  alinhamento_ok: number;
  nivelamento_ok: number;
  estanqueidade_ok: number;
  limpeza_ok: number;
  desmoldante_aplicado: number;
  observacoes: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  obra_nome?: string;
}
