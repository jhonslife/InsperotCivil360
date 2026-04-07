export type ElementoConcreto = 'pilar' | 'viga' | 'laje' | 'fundacao';

export interface ConcretoInspecao {
  id: string;
  obra_id: string;
  data: string;
  elemento: ElementoConcreto;
  fck_projeto: number;
  slump: number | null;
  temperatura_concreto: number | null;
  adensamento_ok: number;
  cura_ok: number;
  observacoes: string;
  latitude: number | null;
  longitude: number | null;
  assinatura_path: string | null;
  created_at: string;
  obra_nome?: string;
}
