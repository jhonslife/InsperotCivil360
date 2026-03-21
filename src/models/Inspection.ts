import { InspectionType } from '../constants/inspectionTypes';

export type InspectionStatus = 'conforme' | 'nao_conforme' | 'pendente';

export interface Inspection {
  id: string;
  obra_id: string;
  tipo: InspectionType;
  data: string;
  local_descricao: string;
  latitude: number | null;
  longitude: number | null;
  observacoes: string;
  status: InspectionStatus;
  assinatura_path: string | null;
  created_at: string;
  obra_nome?: string;
}
