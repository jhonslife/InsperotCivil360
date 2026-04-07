import { getDatabase } from '../connection';
import { RompimentoCP } from '../../models/RompimentoCP';
import { generateId } from '../../utils/generateId';
import { nowISO } from '../../utils/formatDate';

interface RompimentoCPInput {
  obra_id: string;
  concreto_inspecao_id?: string | null;
  data: string;
  idade: number;
  resistencia: number;
  fck_projeto: number;
  observacoes: string;
}

function calcularConformidadeRompimento(idade: number, resistencia: number, fckProjeto: number): number {
  if (idade !== 28) {
    return 1;
  }

  return resistencia >= fckProjeto * 0.95 ? 1 : 0;
}

export async function getAllRompimentosCP(): Promise<RompimentoCP[]> {
  const db = await getDatabase();
  return await db.getAllAsync<RompimentoCP>(
    `SELECT r.*, o.nome as obra_nome FROM rompimento_corpos_prova r LEFT JOIN obras o ON r.obra_id = o.id ORDER BY r.created_at DESC`
  );
}

export async function getRompimentoCPById(id: string): Promise<RompimentoCP | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<RompimentoCP>(
    `SELECT r.*, o.nome as obra_nome FROM rompimento_corpos_prova r LEFT JOIN obras o ON r.obra_id = o.id WHERE r.id = ?`, [id]
  );
}

export async function createRompimentoCP(data: RompimentoCPInput): Promise<RompimentoCP> {
  const db = await getDatabase();
  const id = generateId();
  const now = nowISO();
  const conforme = calcularConformidadeRompimento(data.idade, data.resistencia, data.fck_projeto);

  await db.runAsync(
    `INSERT INTO rompimento_corpos_prova (id, obra_id, concreto_inspecao_id, data, idade, resistencia, fck_projeto, conforme, observacoes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.obra_id, data.concreto_inspecao_id ?? null, data.data, data.idade, data.resistencia, data.fck_projeto, conforme, data.observacoes, now]
  );

  return {
    id, obra_id: data.obra_id, concreto_inspecao_id: data.concreto_inspecao_id ?? null,
    data: data.data, idade: data.idade, resistencia: data.resistencia,
    fck_projeto: data.fck_projeto, conforme, observacoes: data.observacoes, created_at: now,
  };
}

export async function updateRompimentoCP(id: string, data: RompimentoCPInput): Promise<void> {
  const db = await getDatabase();
  const conforme = calcularConformidadeRompimento(data.idade, data.resistencia, data.fck_projeto);
  await db.runAsync(
    `UPDATE rompimento_corpos_prova SET obra_id = ?, concreto_inspecao_id = ?, data = ?, idade = ?, resistencia = ?, fck_projeto = ?, conforme = ?, observacoes = ? WHERE id = ?`,
    [data.obra_id, data.concreto_inspecao_id ?? null, data.data, data.idade, data.resistencia, data.fck_projeto, conforme, data.observacoes, id]
  );
}

export async function countNaoConformesRompimentoCP(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM rompimento_corpos_prova WHERE conforme = 0'
  );
  return result?.count ?? 0;
}
