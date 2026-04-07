import { ChecklistTemplate } from './inspectionTypes';

// ─── Tipos de Camada ───

export type CamadaPavimentacao = 'subleito' | 'sub_base' | 'base' | 'cbuq';

export const CAMADA_LABELS: Record<CamadaPavimentacao, string> = {
  subleito: 'Subleito',
  sub_base: 'Sub-base',
  base: 'Base',
  cbuq: 'CBUQ (Asfalto)',
};

// ─── Tipos de Ensaio de Pavimentação ───

export type PavEnsaioTipo = 'grau_compactacao' | 'densidade_in_situ' | 'teor_ligante' | 'marshall';

export const PAV_ENSAIO_LABELS: Record<PavEnsaioTipo, string> = {
  grau_compactacao: 'Grau de Compactação',
  densidade_in_situ: 'Densidade in Situ',
  teor_ligante: 'Teor de Ligante',
  marshall: 'Marshall',
};

export const PAV_ENSAIO_UNIDADES: Record<PavEnsaioTipo, string> = {
  grau_compactacao: '%',
  densidade_in_situ: 'g/cm³',
  teor_ligante: '%',
  marshall: 'kgf',
};

// ─── Checklists por Camada ───

export const PAVIMENTACAO_CHECKLISTS: Record<CamadaPavimentacao, ChecklistTemplate[]> = {
  subleito: [
    { descricao: 'Cota conferida', ordem: 1 },
    { descricao: 'Regularização do subleito', ordem: 2 },
    { descricao: 'Compactação conforme projeto', ordem: 3 },
    { descricao: 'Umidade adequada', ordem: 4 },
    { descricao: 'Ensaio de compactação realizado', ordem: 5 },
    { descricao: 'Liberação para próxima camada', ordem: 6 },
  ],
  sub_base: [
    { descricao: 'Material aprovado', ordem: 1 },
    { descricao: 'Espessura conforme projeto', ordem: 2 },
    { descricao: 'Umidade ótima', ordem: 3 },
    { descricao: 'Compactação atingida', ordem: 4 },
    { descricao: 'Ensaio de densidade realizado', ordem: 5 },
    { descricao: 'Superfície regularizada', ordem: 6 },
  ],
  base: [
    { descricao: 'Material (BGS/BGTC) conforme projeto', ordem: 1 },
    { descricao: 'Espessura conferida', ordem: 2 },
    { descricao: 'Compactação adequada', ordem: 3 },
    { descricao: 'Ensaio de controle executado', ordem: 4 },
    { descricao: 'Regularidade superficial', ordem: 5 },
    { descricao: 'Liberação para revestimento', ordem: 6 },
  ],
  cbuq: [
    { descricao: 'Temperatura da mistura adequada', ordem: 1 },
    { descricao: 'Limpeza da base', ordem: 2 },
    { descricao: 'Aplicação uniforme', ordem: 3 },
    { descricao: 'Espessura conforme projeto', ordem: 4 },
    { descricao: 'Compactação (rolo) adequada', ordem: 5 },
    { descricao: 'Acabamento sem segregação', ordem: 6 },
    { descricao: 'Controle de usina registrado', ordem: 7 },
  ],
};

// ─── Limites para Alertas Automáticos ───

export const PAV_LIMITS = {
  cbuq_temperatura: { min: 107, max: 177, unit: '°C', label: 'Temperatura CBUQ' },
  compactacao_minima: { min: 95, unit: '%', label: 'Compactação Mínima' },
};
