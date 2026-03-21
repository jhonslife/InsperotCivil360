import { ObraTipo, ObraStatus } from '../constants/inspectionTypes';

export interface Obra {
  id: string;
  nome: string;
  local: string;
  cliente: string;
  tipo: ObraTipo;
  data_inicio: string;
  responsavel_tecnico: string;
  status: ObraStatus;
  created_at: string;
  updated_at: string;
}
