import { createRNC, findOpenRNCByOrigin } from '../database/repositories/rncRepository';
import { RNCOrigemTipo } from '../models/RNC';
import { Gravidade } from '../constants/inspectionTypes';
import { todayISO } from '../utils/formatDate';

interface NCAutoInput {
  obra_id: string;
  origem_tipo: RNCOrigemTipo;
  origem_id: string;
  descricao: string;
  gravidade: Gravidade;
  responsavel: string;
  prazo_dias: number;
  causa: string;
  acao_corretiva: string;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export async function criarNCAutomatica(input: NCAutoInput): Promise<string> {
  const hoje = todayISO();
  const existingRNC = await findOpenRNCByOrigin(
    input.obra_id,
    input.origem_tipo,
    input.origem_id,
    input.descricao
  );

  if (existingRNC) {
    return existingRNC.id;
  }

  const rnc = await createRNC({
    obra_id: input.obra_id,
    data: hoje,
    descricao: input.descricao,
    gravidade: input.gravidade,
    responsavel: input.responsavel,
    prazo: addDays(hoje, input.prazo_dias),
    origem_tipo: input.origem_tipo,
    origem_id: input.origem_id,
    causa: input.causa,
    acao_corretiva: input.acao_corretiva,
  });
  return rnc.id;
}

// ─── Verificações automáticas por módulo ───

export async function verificarNCFundacao(params: {
  obra_id: string;
  fundacao_id: string;
  responsavel: string;
  itensNaoConformes: { descricao: string }[];
}): Promise<string[]> {
  const ids: string[] = [];
  for (const item of params.itensNaoConformes) {
    const gravidade: Gravidade = /(crític|seguran|colapso|desvio|integridade|falha)/i.test(item.descricao)
      ? 'alta'
      : 'media';

    const id = await criarNCAutomatica({
      obra_id: params.obra_id,
      origem_tipo: 'fundacao',
      origem_id: params.fundacao_id,
      descricao: `NC Fundação: ${item.descricao}`,
      gravidade,
      responsavel: params.responsavel,
      prazo_dias: 7,
      causa: `Item de checklist não conforme: ${item.descricao}`,
      acao_corretiva: 'Verificar e corrigir conforme norma ABNT NBR 6122',
    });
    ids.push(id);
  }
  return ids;
}

export async function verificarNCRompimentoCP(params: {
  obra_id: string;
  rompimento_id: string;
  responsavel: string;
  idade: number;
  resistencia: number;
  fck_projeto: number;
}): Promise<string | null> {
  if (params.idade !== 28) return null;

  const limiteMinimo = params.fck_projeto * 0.95;
  if (params.resistencia >= limiteMinimo) return null;

  return await criarNCAutomatica({
    obra_id: params.obra_id,
    origem_tipo: 'rompimento_cp',
    origem_id: params.rompimento_id,
    descricao: 'NC Rompimento CP: resistência abaixo do mínimo de aceitação aos 28 dias',
    gravidade: 'alta',
    responsavel: params.responsavel,
    prazo_dias: 3,
    causa: `Resistência à compressão ${params.resistencia.toFixed(1)} MPa < 95% fck (${limiteMinimo.toFixed(1)} MPa)`,
    acao_corretiva: 'Solicitar extração de testemunho conforme ABNT NBR 7680. Avaliar necessidade de reforço estrutural.',
  });
}

export async function verificarNCPavimentacao(params: {
  obra_id: string;
  inspecao_id: string;
  responsavel: string;
  trecho: string;
  compactacao_ok: boolean;
  temperatura?: number | null;
}): Promise<string[]> {
  const ids: string[] = [];

  if (!params.compactacao_ok) {
    const id = await criarNCAutomatica({
      obra_id: params.obra_id,
      origem_tipo: 'pavimentacao',
      origem_id: params.inspecao_id,
      descricao: 'NC Pavimentação: compactação não conforme',
      gravidade: 'media',
      responsavel: params.responsavel,
      prazo_dias: 3,
      causa: `Grau de compactação abaixo do especificado no trecho ${params.trecho}`,
      acao_corretiva: 'Recompactar trecho conforme DNIT-ES 141/2022. Realizar novo ensaio de compactação.',
    });
    ids.push(id);
  }

  return ids;
}

export async function verificarNCPavimentacaoEnsaio(params: {
  obra_id: string;
  ensaio_id: string;
  responsavel: string;
  trecho: string;
  tipo_ensaio: string;
  resultado?: number | null;
}): Promise<string> {
  return await criarNCAutomatica({
    obra_id: params.obra_id,
    origem_tipo: 'ensaio',
    origem_id: params.ensaio_id,
    descricao: `NC Ensaio de Pavimentação: ${params.tipo_ensaio} não conforme`,
    gravidade: 'media',
    responsavel: params.responsavel,
    prazo_dias: 3,
    causa: `Resultado de ensaio fora do especificado no trecho ${params.trecho}${params.resultado != null ? ` (${params.resultado})` : ''}`,
    acao_corretiva: 'Repetir o ensaio, revisar a execução da camada e corrigir o trecho conforme especificação DNIT.',
  });
}

export async function verificarNCConcreto(params: {
  obra_id: string;
  concreto_id: string;
  responsavel: string;
  slump?: number | null;
  temperatura?: number | null;
}): Promise<string[]> {
  const ids: string[] = [];

  if (params.slump != null && (params.slump < 80 || params.slump > 120)) {
    ids.push(
      await criarNCAutomatica({
        obra_id: params.obra_id,
        origem_tipo: 'concreto',
        origem_id: params.concreto_id,
        descricao: 'NC Concreto: slump fora da faixa 80-120 mm',
        gravidade: 'media',
        responsavel: params.responsavel,
        prazo_dias: 2,
        causa: `Slump ${params.slump} mm fora da faixa especificada para lançamento`,
        acao_corretiva: 'Bloquear o lançamento do lote, revisar traço e registrar nova verificação de consistência.',
      })
    );
  }

  if (params.temperatura != null && params.temperatura > 35) {
    ids.push(
      await criarNCAutomatica({
        obra_id: params.obra_id,
        origem_tipo: 'concreto',
        origem_id: params.concreto_id,
        descricao: 'NC Concreto: temperatura acima de 35°C',
        gravidade: 'media',
        responsavel: params.responsavel,
        prazo_dias: 1,
        causa: `Temperatura do concreto acima do limite de controle (${params.temperatura}°C)`,
        acao_corretiva: 'Adotar controle térmico do lançamento e reavaliar a trabalhabilidade antes da continuidade.',
      })
    );
  }

  return ids;
}

export async function verificarNCArmadura(params: {
  obra_id: string;
  armadura_id: string;
  responsavel: string;
  conforme_projeto: boolean;
}): Promise<string | null> {
  if (params.conforme_projeto) {
    return null;
  }

  return await criarNCAutomatica({
    obra_id: params.obra_id,
    origem_tipo: 'armadura',
    origem_id: params.armadura_id,
    descricao: 'NC Armadura: montagem divergente do projeto estrutural',
    gravidade: 'alta',
    responsavel: params.responsavel,
    prazo_dias: 2,
    causa: 'Posicionamento, diâmetro ou espaçamento da armadura divergente do projeto',
    acao_corretiva: 'Revisar a armação instalada, corrigir o posicionamento e liberar novamente com conferência de projeto.',
  });
}

export async function verificarNCForma(params: {
  obra_id: string;
  forma_id: string;
  responsavel: string;
  alinhamento_ok: boolean;
  nivelamento_ok: boolean;
  estanqueidade_ok: boolean;
}): Promise<string | null> {
  if (params.alinhamento_ok && params.nivelamento_ok && params.estanqueidade_ok) {
    return null;
  }

  return await criarNCAutomatica({
    obra_id: params.obra_id,
    origem_tipo: 'formas',
    origem_id: params.forma_id,
    descricao: 'NC Formas: verificação crítica reprovada antes da concretagem',
    gravidade: 'media',
    responsavel: params.responsavel,
    prazo_dias: 1,
    causa: 'Falha de alinhamento, nivelamento ou estanqueidade na forma',
    acao_corretiva: 'Corrigir a forma e reapresentar para liberação antes da concretagem.',
  });
}

export async function verificarNCVedacao(params: {
  obra_id: string;
  inspecao_id: string;
  responsavel: string;
  tipo_vedacao: 'alvenaria' | 'drywall';
  itensNaoConformes: string[];
}): Promise<string | null> {
  if (params.itensNaoConformes.length === 0) return null;

  const normaReferencia = params.tipo_vedacao === 'drywall'
    ? 'NBR 15758'
    : 'NBR 15961 / NBR 15575';

  return await criarNCAutomatica({
    obra_id: params.obra_id,
    origem_tipo: 'vedacao',
    origem_id: params.inspecao_id,
    descricao: 'NC Vedação: inspeção com itens não conformes',
    gravidade: 'media',
    responsavel: params.responsavel,
    prazo_dias: 5,
    causa: `Itens não conformes: ${params.itensNaoConformes.join('; ')}`,
    acao_corretiva: `Corrigir não conformidades de prumo, alinhamento e execução conforme ${normaReferencia}.`,
  });
}
