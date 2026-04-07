export type InspectionType =
  | 'fundacao_rasa'
  | 'fundacao_profunda'
  | 'bloco_coroamento'
  | 'estrutura'
  | 'oae'
  | 'pavimentacao'
  | 'vedacao';

export interface ChecklistTemplate {
  descricao: string;
  ordem: number;
}

export const INSPECTION_TYPE_LABELS: Record<InspectionType, string> = {
  fundacao_rasa: 'Fundação Rasa',
  fundacao_profunda: 'Fundação Profunda',
  bloco_coroamento: 'Bloco de Coroamento',
  estrutura: 'Concreto e Estrutura',
  oae: 'OAE (Pontes/Viadutos)',
  pavimentacao: 'Pavimentação',
  vedacao: 'Vedação',
};

export const INSPECTION_TYPE_ICONS: Record<InspectionType, string> = {
  fundacao_rasa: 'home-foundation',
  fundacao_profunda: 'arrow-down-bold-box',
  bloco_coroamento: 'cube-outline',
  estrutura: 'pillar',
  oae: 'bridge',
  pavimentacao: 'road',
  vedacao: 'wall',
};

export const INSPECTION_CHECKLISTS: Record<InspectionType, ChecklistTemplate[]> = {
  fundacao_rasa: [
    { descricao: 'Locação conferida conforme projeto', ordem: 1 },
    { descricao: 'Escavação nas dimensões corretas', ordem: 2 },
    { descricao: 'Fundo da cava regularizado e limpo', ordem: 3 },
    { descricao: 'Solo com capacidade adequada', ordem: 4 },
    { descricao: 'Lastro de concreto magro executado', ordem: 5 },
    { descricao: 'Armadura conforme projeto', ordem: 6 },
    { descricao: 'Cobrimento respeitado', ordem: 7 },
    { descricao: 'Forma alinhada e nivelada', ordem: 8 },
    { descricao: 'Conferência de embutidos', ordem: 9 },
    { descricao: 'Liberação para concretagem', ordem: 10 },
    { descricao: 'Slump test realizado', ordem: 11 },
    { descricao: 'Cura iniciada corretamente', ordem: 12 },
  ],
  fundacao_profunda: [
    { descricao: 'Locação da estaca conferida', ordem: 1 },
    { descricao: 'Equipamento calibrado', ordem: 2 },
    { descricao: 'Diâmetro conforme projeto', ordem: 3 },
    { descricao: 'Profundidade atingida', ordem: 4 },
    { descricao: 'Limpeza do furo (quando aplicável)', ordem: 5 },
    { descricao: 'Concreto conforme especificação', ordem: 6 },
    { descricao: 'Registro de concretagem', ordem: 7 },
    { descricao: 'Controle de volume aplicado', ordem: 8 },
    { descricao: 'Ensaio de integridade (PIT)', ordem: 9 },
    { descricao: 'Estaca sem desvio ou falha', ordem: 10 },
  ],
  bloco_coroamento: [
    { descricao: 'Cabeça das estacas regularizadas', ordem: 1 },
    { descricao: 'Armadura conforme projeto', ordem: 2 },
    { descricao: 'Amarração adequada', ordem: 3 },
    { descricao: 'Cobrimento correto', ordem: 4 },
    { descricao: 'Forma alinhada', ordem: 5 },
    { descricao: 'Limpeza antes da concretagem', ordem: 6 },
    { descricao: 'Liberação da engenharia', ordem: 7 },
    { descricao: 'Controle de concreto (slump e fck)', ordem: 8 },
    { descricao: 'Cura realizada', ordem: 9 },
  ],
  estrutura: [
    { descricao: 'Forma limpa e estanque', ordem: 1 },
    { descricao: 'Armadura posicionada corretamente', ordem: 2 },
    { descricao: 'Espaçadores instalados', ordem: 3 },
    { descricao: 'Conferência de cobrimento', ordem: 4 },
    { descricao: 'Slump test dentro do padrão', ordem: 5 },
    { descricao: 'Tempo de transporte adequado', ordem: 6 },
    { descricao: 'Lançamento sem segregação', ordem: 7 },
    { descricao: 'Adensamento correto (vibrador)', ordem: 8 },
    { descricao: 'Acabamento adequado', ordem: 9 },
    { descricao: 'Cura iniciada no tempo correto', ordem: 10 },
    { descricao: 'Registro de rastreabilidade', ordem: 11 },
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
  vedacao: [
    { descricao: 'Material conforme especificação', ordem: 1 },
    { descricao: 'Base nivelada', ordem: 2 },
    { descricao: 'Prumo e alinhamento corretos', ordem: 3 },
    { descricao: 'Junta com espessura adequada', ordem: 4 },
    { descricao: 'Amarração correta', ordem: 5 },
    { descricao: 'Vergas e contravergas executadas', ordem: 6 },
    { descricao: 'Fixação adequada (drywall)', ordem: 7 },
    { descricao: 'Ausência de trincas', ordem: 8 },
    { descricao: 'Limpeza da execução', ordem: 9 },
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
