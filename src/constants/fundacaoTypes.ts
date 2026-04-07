import { ChecklistTemplate } from './inspectionTypes';

// ─── Tipos de Fundação Profunda ───

export type FundacaoTipo =
  | 'estaca_cravada'
  | 'estaca_escavada'
  | 'estaca_helice_continua'
  | 'estaca_strauss'
  | 'estaca_raiz'
  | 'tubulao';

export const FUNDACAO_TIPO_LABELS: Record<FundacaoTipo, string> = {
  estaca_cravada: 'Estaca Cravada',
  estaca_escavada: 'Estaca Escavada (Broca)',
  estaca_helice_continua: 'Estaca Hélice Contínua (CFA)',
  estaca_strauss: 'Estaca Strauss',
  estaca_raiz: 'Estaca Raiz (Microestaca)',
  tubulao: 'Tubulão',
};

export const FUNDACAO_TIPO_ICONS: Record<FundacaoTipo, string> = {
  estaca_cravada: 'arrow-down-bold',
  estaca_escavada: 'shovel',
  estaca_helice_continua: 'screw-flat-top',
  estaca_strauss: 'hammer',
  estaca_raiz: 'needle',
  tubulao: 'cylinder',
};

// ─── Dados Técnicos por Tipo ───

export interface DadoTecnicoTemplate {
  campo: string;
  label: string;
  unidade: string;
  tipo: 'numerico' | 'texto';
}

export const FUNDACAO_DADOS_TECNICOS: Record<FundacaoTipo, DadoTecnicoTemplate[]> = {
  estaca_cravada: [
    { campo: 'nega_final', label: 'Nega Final', unidade: 'mm', tipo: 'numerico' },
    { campo: 'desvio_prumo', label: 'Desvio de Prumo', unidade: '%', tipo: 'numerico' },
    { campo: 'golpes_por_metro', label: 'Golpes por Metro', unidade: 'golpes/m', tipo: 'numerico' },
  ],
  estaca_escavada: [
    { campo: 'volume_concreto', label: 'Volume de Concreto', unidade: 'm³', tipo: 'numerico' },
    { campo: 'solo_encontrado', label: 'Solo Encontrado', unidade: '', tipo: 'texto' },
  ],
  estaca_helice_continua: [
    { campo: 'volume_concreto', label: 'Volume de Concreto', unidade: 'm³', tipo: 'numerico' },
    { campo: 'pressao_injecao', label: 'Pressão de Injeção', unidade: 'kgf/cm²', tipo: 'numerico' },
    { campo: 'tempo_execucao', label: 'Tempo de Execução', unidade: 'min', tipo: 'numerico' },
  ],
  estaca_strauss: [
    { campo: 'volume_concreto', label: 'Volume de Concreto', unidade: 'm³', tipo: 'numerico' },
  ],
  estaca_raiz: [
    { campo: 'pressao_injecao', label: 'Pressão de Injeção', unidade: 'kgf/cm²', tipo: 'numerico' },
    { campo: 'consumo_calda', label: 'Consumo de Calda', unidade: 'litros', tipo: 'numerico' },
    { campo: 'inclinacao', label: 'Inclinação', unidade: '°', tipo: 'numerico' },
  ],
  tubulao: [
    { campo: 'volume_concreto', label: 'Volume de Concreto', unidade: 'm³', tipo: 'numerico' },
    { campo: 'solo_encontrado', label: 'Solo Encontrado', unidade: '', tipo: 'texto' },
  ],
};

// ─── Checklists por Tipo de Fundação Profunda ───

export const FUNDACAO_PROFUNDA_CHECKLISTS: Record<FundacaoTipo, ChecklistTemplate[]> = {
  estaca_cravada: [
    { descricao: 'Locação da estaca conferida', ordem: 1 },
    { descricao: 'Equipamento calibrado', ordem: 2 },
    { descricao: 'Diâmetro conforme projeto', ordem: 3 },
    { descricao: 'Profundidade atingida', ordem: 4 },
    { descricao: 'Registro de nega final', ordem: 5 },
    { descricao: 'Controle de prumo (% desvio)', ordem: 6 },
    { descricao: 'Integridade da estaca verificada (sem trincas)', ordem: 7 },
    { descricao: 'Relatório de golpes por metro registrado', ordem: 8 },
    { descricao: 'Estaca sem desvio ou falha', ordem: 9 },
    { descricao: 'Ensaio de integridade (PIT)', ordem: 10 },
  ],
  estaca_escavada: [
    { descricao: 'Locação da estaca conferida', ordem: 1 },
    { descricao: 'Equipamento calibrado', ordem: 2 },
    { descricao: 'Diâmetro conforme projeto', ordem: 3 },
    { descricao: 'Profundidade atingida registrada', ordem: 4 },
    { descricao: 'Verificação de colapso de paredes', ordem: 5 },
    { descricao: 'Controle de volume de concreto', ordem: 6 },
    { descricao: 'Registro de solo encontrado', ordem: 7 },
    { descricao: 'Limpeza do furo realizada', ordem: 8 },
    { descricao: 'Concreto conforme especificação', ordem: 9 },
    { descricao: 'Registro de concretagem', ordem: 10 },
  ],
  estaca_helice_continua: [
    { descricao: 'Locação da estaca conferida', ordem: 1 },
    { descricao: 'Equipamento calibrado', ordem: 2 },
    { descricao: 'Diâmetro conforme projeto', ordem: 3 },
    { descricao: 'Volume de concreto x profundidade registrado', ordem: 4 },
    { descricao: 'Pressão de injeção controlada', ordem: 5 },
    { descricao: 'Tempo de execução registrado', ordem: 6 },
    { descricao: 'Registro automático verificado', ordem: 7 },
    { descricao: 'Profundidade atingida', ordem: 8 },
    { descricao: 'Concreto conforme especificação', ordem: 9 },
    { descricao: 'Controle de volume aplicado', ordem: 10 },
  ],
  estaca_strauss: [
    { descricao: 'Locação da estaca conferida', ordem: 1 },
    { descricao: 'Diâmetro conforme projeto', ordem: 2 },
    { descricao: 'Controle de verticalidade', ordem: 3 },
    { descricao: 'Integridade do fuste verificada', ordem: 4 },
    { descricao: 'Controle de concretagem', ordem: 5 },
    { descricao: 'Registro de profundidade', ordem: 6 },
    { descricao: 'Concreto conforme especificação', ordem: 7 },
    { descricao: 'Estaca sem desvio ou falha', ordem: 8 },
  ],
  estaca_raiz: [
    { descricao: 'Locação da estaca conferida', ordem: 1 },
    { descricao: 'Diâmetro conforme projeto', ordem: 2 },
    { descricao: 'Pressão de injeção controlada', ordem: 3 },
    { descricao: 'Consumo de calda registrado', ordem: 4 },
    { descricao: 'Inclinação da estaca conforme projeto', ordem: 5 },
    { descricao: 'Controle de profundidade', ordem: 6 },
    { descricao: 'Concreto/calda conforme especificação', ordem: 7 },
    { descricao: 'Estaca sem desvio ou falha', ordem: 8 },
  ],
  tubulao: [
    { descricao: 'Locação do tubulão conferida', ordem: 1 },
    { descricao: 'Diâmetro conforme projeto', ordem: 2 },
    { descricao: 'Inspeção visual do solo realizada', ordem: 3 },
    { descricao: 'Verificação da base (alargamento)', ordem: 4 },
    { descricao: 'Segurança do operador verificada (item crítico)', ordem: 5 },
    { descricao: 'Controle de volume de concreto', ordem: 6 },
    { descricao: 'Profundidade atingida conforme projeto', ordem: 7 },
    { descricao: 'Concreto conforme especificação', ordem: 8 },
    { descricao: 'Registro de concretagem', ordem: 9 },
  ],
};

// ─── Checklist de Fundação Rasa (Expandido - 12 itens) ───

export const FUNDACAO_RASA_CHECKLIST: ChecklistTemplate[] = [
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
];

// ─── Checklist de Bloco de Coroamento ───

export const BLOCO_COROAMENTO_CHECKLIST: ChecklistTemplate[] = [
  { descricao: 'Cabeça das estacas regularizadas', ordem: 1 },
  { descricao: 'Armadura conforme projeto', ordem: 2 },
  { descricao: 'Amarração adequada', ordem: 3 },
  { descricao: 'Cobrimento correto', ordem: 4 },
  { descricao: 'Forma alinhada', ordem: 5 },
  { descricao: 'Limpeza antes da concretagem', ordem: 6 },
  { descricao: 'Liberação da engenharia', ordem: 7 },
  { descricao: 'Controle de concreto (slump e fck)', ordem: 8 },
  { descricao: 'Cura realizada', ordem: 9 },
];
