export type InspectionType = 'fundacao' | 'estrutura' | 'oae' | 'pavimentacao';

export interface ChecklistTemplate {
  descricao: string;
  ordem: number;
}

export const INSPECTION_TYPE_LABELS: Record<InspectionType, string> = {
  fundacao: 'Fundação',
  estrutura: 'Estrutura',
  oae: 'OAE (Pontes/Viadutos)',
  pavimentacao: 'Pavimentação',
};

export const INSPECTION_CHECKLISTS: Record<InspectionType, ChecklistTemplate[]> = {
  fundacao: [
    { descricao: 'Escavação conforme projeto', ordem: 1 },
    { descricao: 'Fundo regularizado', ordem: 2 },
    { descricao: 'Solo adequado', ordem: 3 },
    { descricao: 'Armadura conforme projeto', ordem: 4 },
    { descricao: 'Cobrimento atendido', ordem: 5 },
    { descricao: 'Espaçadores instalados', ordem: 6 },
    { descricao: 'Forma estanque', ordem: 7 },
    { descricao: 'Liberação para concretagem', ordem: 8 },
  ],
  estrutura: [
    { descricao: 'Formas alinhadas e aprumadas', ordem: 1 },
    { descricao: 'Armadura conforme projeto', ordem: 2 },
    { descricao: 'Cobrimento adequado', ordem: 3 },
    { descricao: 'Espaçadores posicionados', ordem: 4 },
    { descricao: 'Escoramentos verificados', ordem: 5 },
    { descricao: 'Juntas de concretagem tratadas', ordem: 6 },
    { descricao: 'Liberação para concretagem', ordem: 7 },
  ],
  oae: [
    { descricao: 'Bloco de fundação conforme projeto', ordem: 1 },
    { descricao: 'Armadura do pilar conferida', ordem: 2 },
    { descricao: 'Alinhamento do pilar', ordem: 3 },
    { descricao: 'Travessa executada corretamente', ordem: 4 },
    { descricao: 'Apoio de vigas verificado', ordem: 5 },
    { descricao: 'Tabuleiro nivelado', ordem: 6 },
    { descricao: 'Guarda-corpo conforme norma', ordem: 7 },
  ],
  pavimentacao: [
    { descricao: 'Sub-base compactada', ordem: 1 },
    { descricao: 'Base regularizada', ordem: 2 },
    { descricao: 'Imprimação aplicada', ordem: 3 },
    { descricao: 'Temperatura do asfalto adequada', ordem: 4 },
    { descricao: 'Espessura da camada verificada', ordem: 5 },
    { descricao: 'Compactação dentro do especificado', ordem: 6 },
    { descricao: 'Acabamento superficial adequado', ordem: 7 },
  ],
};

export type EnsaioTipo = 'concreto' | 'graute' | 'pavimentacao';

export const ENSAIO_TYPE_LABELS: Record<EnsaioTipo, string> = {
  concreto: 'Concreto',
  graute: 'Graute',
  pavimentacao: 'Pavimentação',
};

export const ENSAIO_LIMITS = {
  concreto: {
    slump: { min: 80, max: 120, unit: 'mm', label: 'Slump (Abatimento)' },
    temperatura: { min: 10, max: 35, unit: '°C', label: 'Temperatura' },
  },
  graute: {
    fluidez: { min: 20, max: 30, unit: 's', label: 'Fluidez' },
  },
  pavimentacao: {
    compactacao: { min: 95, max: 105, unit: '%', label: 'Compactação' },
    deflexao: { min: 0, max: 100, unit: '0.01mm', label: 'Deflexão (Viga Benkelman)' },
  },
};

export type ObraTipo = 'Rodovia' | 'OAE' | 'Industrial';

export const OBRA_TIPOS: ObraTipo[] = ['Rodovia', 'OAE', 'Industrial'];

export type ObraStatus = 'ativa' | 'concluida' | 'paralisada';

export const OBRA_STATUS_LABELS: Record<ObraStatus, string> = {
  ativa: 'Ativa',
  concluida: 'Concluída',
  paralisada: 'Paralisada',
};

export type Gravidade = 'baixa' | 'media' | 'alta';

export const GRAVIDADE_LABELS: Record<Gravidade, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
};

export type ClimaType = 'ensolarado' | 'nublado' | 'chuvoso' | 'parcialmente_nublado';

export const CLIMA_LABELS: Record<ClimaType, string> = {
  ensolarado: 'Ensolarado',
  nublado: 'Nublado',
  chuvoso: 'Chuvoso',
  parcialmente_nublado: 'Parcialmente Nublado',
};

export const CLIMA_ICONS: Record<ClimaType, string> = {
  ensolarado: 'weather-sunny',
  nublado: 'weather-cloudy',
  chuvoso: 'weather-rainy',
  parcialmente_nublado: 'weather-partly-cloudy',
};
