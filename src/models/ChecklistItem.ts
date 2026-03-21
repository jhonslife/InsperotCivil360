export type ChecklistStatus = 0 | 1 | 2; // 0=pendente, 1=conforme, 2=não conforme

export interface ChecklistItem {
  id: string;
  inspection_id: string;
  descricao: string;
  conforme: ChecklistStatus;
  observacao: string;
  ordem: number;
}
