import { getDatabase } from '../connection';
import { Fundacao, FundacaoDadoTecnico } from '../../models/Fundacao';
import { ChecklistItem } from '../../models/ChecklistItem';
import { FundacaoTipo, FUNDACAO_PROFUNDA_CHECKLISTS } from '../../constants/fundacaoTypes';
import { generateId } from '../../utils/generateId';
import { nowISO } from '../../utils/formatDate';

interface FundacaoInput {
  obra_id: string;
  tipo: FundacaoTipo;
  diametro: number;
  profundidade_projeto: number;
  profundidade_atingida?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  localizacao_desc: string;
  data: string;
  observacoes: string;
  status?: Fundacao['status'];
  assinatura_path?: string | null;
}

interface DadoTecnicoInput {
  campo: string;
  valor_numerico?: number | null;
  valor_texto?: string;
  unidade: string;
}

interface FundacaoChecklistInput {
  descricao: string;
  conforme: ChecklistItem['conforme'];
  observacao: string;
  ordem: number;
}

async function rollbackTransaction(db: Awaited<ReturnType<typeof getDatabase>>) {
  try { await db.execAsync('ROLLBACK;'); } catch { /* ignore */ }
}

export async function getAllFundacoes(obraId?: string): Promise<Fundacao[]> {
  const db = await getDatabase();
  if (obraId) {
    return await db.getAllAsync<Fundacao>(
      `SELECT f.*, o.nome as obra_nome
       FROM fundacoes f
       LEFT JOIN obras o ON f.obra_id = o.id
       WHERE f.obra_id = ?
       ORDER BY f.created_at DESC`,
      [obraId]
    );
  }

  return await db.getAllAsync<Fundacao>(
    `SELECT f.*, o.nome as obra_nome FROM fundacoes f LEFT JOIN obras o ON f.obra_id = o.id ORDER BY f.created_at DESC`
  );
}

export async function getFundacaoById(id: string): Promise<Fundacao | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<Fundacao>(
    `SELECT f.*, o.nome as obra_nome FROM fundacoes f LEFT JOIN obras o ON f.obra_id = o.id WHERE f.id = ?`, [id]
  );
}

export async function getFundacoesByObra(obraId: string): Promise<Fundacao[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Fundacao>(
    `SELECT f.*, o.nome as obra_nome FROM fundacoes f LEFT JOIN obras o ON f.obra_id = o.id WHERE f.obra_id = ? ORDER BY f.created_at DESC`, [obraId]
  );
}

export async function createFundacao(
  data: FundacaoInput,
  checklistItems?: FundacaoChecklistInput[],
  dadosTecnicos?: DadoTecnicoInput[]
): Promise<string> {
  const db = await getDatabase();
  const id = generateId();
  const now = nowISO();
  const checklist = checklistItems ?? FUNDACAO_PROFUNDA_CHECKLISTS[data.tipo].map((item) => ({
    ...item,
    conforme: 0,
    observacao: '',
  }));

  await db.execAsync('BEGIN IMMEDIATE TRANSACTION;');
  try {
    await db.runAsync(
      `INSERT INTO fundacoes (id, obra_id, tipo, diametro, profundidade_projeto, profundidade_atingida, latitude, longitude, localizacao_desc, data, status, observacoes, assinatura_path, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.obra_id, data.tipo, data.diametro, data.profundidade_projeto, data.profundidade_atingida ?? null, data.latitude ?? null, data.longitude ?? null, data.localizacao_desc, data.data, data.status ?? 'em_execucao', data.observacoes, data.assinatura_path ?? null, now]
    );

    for (const item of checklist) {
      await db.runAsync(
        `INSERT INTO fundacao_checklist_items (id, fundacao_id, descricao, conforme, observacao, ordem) VALUES (?, ?, ?, ?, ?, ?)`,
        [generateId(), id, item.descricao, item.conforme, item.observacao, item.ordem]
      );
    }


    if (dadosTecnicos && dadosTecnicos.length > 0) {
      for (const dado of dadosTecnicos) {
        await db.runAsync(
          'INSERT INTO fundacao_dados_tecnicos (id, fundacao_id, campo, valor_numerico, valor_texto, unidade, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [generateId(), id, dado.campo, dado.valor_numerico ?? null, dado.valor_texto ?? '', dado.unidade, nowISO()]
        );
      }
    }
    await db.execAsync('COMMIT;');
  } catch (error) {
    await rollbackTransaction(db);
    throw error;
  }

  return id;
}

export async function getFundacaoChecklistItems(fundacaoId: string): Promise<ChecklistItem[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(
    'SELECT id, fundacao_id as inspection_id, descricao, conforme, observacao, ordem FROM fundacao_checklist_items WHERE fundacao_id = ? ORDER BY ordem ASC', [fundacaoId]
  );
  return rows;
}

export async function updateFundacaoChecklistItem(id: string, conforme: number, observacao: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE fundacao_checklist_items SET conforme = ?, observacao = ? WHERE id = ?', [conforme, observacao, id]);
}

export async function getDadosTecnicos(fundacaoId: string): Promise<FundacaoDadoTecnico[]> {
  const db = await getDatabase();
  return await db.getAllAsync<FundacaoDadoTecnico>(
    'SELECT * FROM fundacao_dados_tecnicos WHERE fundacao_id = ? ORDER BY created_at ASC', [fundacaoId]
  );
}

export async function saveDadosTecnicos(fundacaoId: string, dados: DadoTecnicoInput[]): Promise<void> {
  const db = await getDatabase();
  await db.execAsync('BEGIN IMMEDIATE TRANSACTION;');
  try {
    await db.runAsync('DELETE FROM fundacao_dados_tecnicos WHERE fundacao_id = ?', [fundacaoId]);
    for (const dado of dados) {
      await db.runAsync(
        'INSERT INTO fundacao_dados_tecnicos (id, fundacao_id, campo, valor_numerico, valor_texto, unidade, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [generateId(), fundacaoId, dado.campo, dado.valor_numerico ?? null, dado.valor_texto ?? '', dado.unidade, nowISO()]
      );
    }
    await db.execAsync('COMMIT;');
  } catch (error) {
    await rollbackTransaction(db);
    throw error;
  }
}

export async function updateFundacao(id: string, data: FundacaoInput): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE fundacoes
     SET obra_id = ?, tipo = ?, diametro = ?, profundidade_projeto = ?, profundidade_atingida = ?,
         latitude = COALESCE(?, latitude), longitude = COALESCE(?, longitude), localizacao_desc = ?, data = ?, status = ?, observacoes = ?, assinatura_path = COALESCE(?, assinatura_path)
     WHERE id = ?`,
    [
      data.obra_id,
      data.tipo,
      data.diametro,
      data.profundidade_projeto,
      data.profundidade_atingida ?? null,
      data.latitude ?? null,
      data.longitude ?? null,
      data.localizacao_desc,
      data.data,
      data.status ?? 'em_execucao',
      data.observacoes,
      data.assinatura_path ?? null,
      id,
    ]
  );
}

export async function updateFundacaoStatus(id: string, status: Fundacao['status']): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE fundacoes SET status = ? WHERE id = ?', [status, id]);
}

export async function updateFundacaoSignature(id: string, signaturePath: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE fundacoes SET assinatura_path = ? WHERE id = ?', [signaturePath, id]);
}

export async function countFundacoesEmExecucao(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM fundacoes WHERE LOWER(status) = 'em_execucao'");
  return result?.count ?? 0;
}

export async function countTodayFundacoes(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM fundacoes WHERE date(data) = date('now', 'localtime')"
  );
  return result?.count ?? 0;
}
