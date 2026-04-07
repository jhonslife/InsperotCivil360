import { getDatabase } from '../connection';
import { PavimentacaoInspecao } from '../../models/PavimentacaoInspecao';
import { PavimentacaoEnsaio } from '../../models/PavimentacaoEnsaio';
import { CamadaPavimentacao, PAVIMENTACAO_CHECKLISTS } from '../../constants/pavimentacaoTypes';
import { ChecklistItem } from '../../models/ChecklistItem';
import { generateId } from '../../utils/generateId';
import { nowISO } from '../../utils/formatDate';

interface PavInspecaoInput {
  obra_id: string;
  data: string;
  trecho: string;
  camada: CamadaPavimentacao;
  espessura?: number | null;
  compactacao_ok: number;
  umidade_ok: number;
  temperatura?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  km_inicio: string;
  km_fim: string;
  observacoes: string;
  assinatura_path?: string | null;
}

interface PavChecklistInput {
  descricao: string;
  conforme: ChecklistItem['conforme'];
  observacao: string;
  ordem: number;
}

interface PavEnsaioInput {
  obra_id: string;
  pavimentacao_inspecao_id?: string | null;
  data: string;
  trecho: string;
  tipo_ensaio: PavimentacaoEnsaio['tipo_ensaio'];
  resultado?: number | null;
  unidade: string;
  conforme: number;
  observacoes: string;
}

async function rollbackTransaction(db: Awaited<ReturnType<typeof getDatabase>>) {
  try { await db.execAsync('ROLLBACK;'); } catch { /* ignore */ }
}

export async function getAllPavInspecoes(obraId?: string): Promise<PavimentacaoInspecao[]> {
  const db = await getDatabase();
  if (obraId) {
    return await db.getAllAsync<PavimentacaoInspecao>(
      `SELECT p.*, o.nome as obra_nome
       FROM pavimentacao_inspecoes p
       LEFT JOIN obras o ON p.obra_id = o.id
       WHERE p.obra_id = ?
       ORDER BY p.created_at DESC`,
      [obraId]
    );
  }

  return await db.getAllAsync<PavimentacaoInspecao>(
    `SELECT p.*, o.nome as obra_nome FROM pavimentacao_inspecoes p LEFT JOIN obras o ON p.obra_id = o.id ORDER BY p.created_at DESC`
  );
}

export async function getPavInspecaoById(id: string): Promise<PavimentacaoInspecao | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<PavimentacaoInspecao>(
    `SELECT p.*, o.nome as obra_nome FROM pavimentacao_inspecoes p LEFT JOIN obras o ON p.obra_id = o.id WHERE p.id = ?`, [id]
  );
}

export async function createPavInspecao(
  data: PavInspecaoInput,
  checklistItems?: PavChecklistInput[]
): Promise<string> {
  const db = await getDatabase();
  const id = generateId();
  const now = nowISO();
  const checklist = checklistItems ?? PAVIMENTACAO_CHECKLISTS[data.camada].map((item) => ({
    ...item,
    conforme: 0,
    observacao: '',
  }));

  await db.execAsync('BEGIN IMMEDIATE TRANSACTION;');
  try {
    await db.runAsync(
      `INSERT INTO pavimentacao_inspecoes (id, obra_id, data, trecho, camada, espessura, compactacao_ok, umidade_ok, temperatura, latitude, longitude, km_inicio, km_fim, observacoes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.obra_id, data.data, data.trecho, data.camada, data.espessura ?? null, data.compactacao_ok, data.umidade_ok, data.temperatura ?? null, data.latitude ?? null, data.longitude ?? null, data.km_inicio, data.km_fim, data.observacoes, now]
    );

    for (const item of checklist) {
      await db.runAsync(
        `INSERT INTO pavimentacao_checklist_items (id, pavimentacao_inspecao_id, descricao, conforme, observacao, ordem) VALUES (?, ?, ?, ?, ?, ?)`,
        [generateId(), id, item.descricao, item.conforme, item.observacao, item.ordem]
      );
    }

    if (data.assinatura_path) {
      await db.runAsync('UPDATE pavimentacao_inspecoes SET assinatura_path = ? WHERE id = ?', [data.assinatura_path, id]);
    }

    await db.execAsync('COMMIT;');
  } catch (error) {
    await rollbackTransaction(db);
    throw error;
  }

  return id;
}

export async function getPavChecklistItems(inspecaoId: string): Promise<ChecklistItem[]> {
  const db = await getDatabase();
  return await db.getAllAsync<any>(
    'SELECT id, pavimentacao_inspecao_id as inspection_id, descricao, conforme, observacao, ordem FROM pavimentacao_checklist_items WHERE pavimentacao_inspecao_id = ? ORDER BY ordem ASC', [inspecaoId]
  );
}

export async function updatePavChecklistItem(id: string, conforme: number, observacao: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE pavimentacao_checklist_items SET conforme = ?, observacao = ? WHERE id = ?', [conforme, observacao, id]);
}

export async function updatePavSignature(id: string, signaturePath: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE pavimentacao_inspecoes SET assinatura_path = ? WHERE id = ?', [signaturePath, id]);
}

export async function updatePavInspecao(id: string, data: PavInspecaoInput): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE pavimentacao_inspecoes
     SET obra_id = ?, data = ?, trecho = ?, camada = ?, espessura = ?, compactacao_ok = ?,
         umidade_ok = ?, temperatura = ?, latitude = ?, longitude = ?, km_inicio = ?, km_fim = ?,
         observacoes = ?, assinatura_path = COALESCE(?, assinatura_path)
     WHERE id = ?`,
    [
      data.obra_id,
      data.data,
      data.trecho,
      data.camada,
      data.espessura ?? null,
      data.compactacao_ok,
      data.umidade_ok,
      data.temperatura ?? null,
      data.latitude ?? null,
      data.longitude ?? null,
      data.km_inicio,
      data.km_fim,
      data.observacoes,
      data.assinatura_path ?? null,
      id,
    ]
  );
}

// ─── Ensaios de Pavimentação ───

export async function getAllPavEnsaios(): Promise<PavimentacaoEnsaio[]> {
  const db = await getDatabase();
  return await db.getAllAsync<PavimentacaoEnsaio>(
    `SELECT pe.*, o.nome as obra_nome FROM pavimentacao_ensaios pe LEFT JOIN obras o ON pe.obra_id = o.id ORDER BY pe.created_at DESC`
  );
}

export async function getPavEnsaiosByInspecao(inspecaoId: string): Promise<PavimentacaoEnsaio[]> {
  const db = await getDatabase();
  return await db.getAllAsync<PavimentacaoEnsaio>(
    `SELECT pe.*, o.nome as obra_nome
     FROM pavimentacao_ensaios pe
     LEFT JOIN obras o ON pe.obra_id = o.id
     WHERE pe.pavimentacao_inspecao_id = ?
     ORDER BY pe.data DESC, pe.created_at DESC`,
    [inspecaoId]
  );
}

export async function getPavEnsaioById(id: string): Promise<PavimentacaoEnsaio | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<PavimentacaoEnsaio>(
    `SELECT pe.*, o.nome as obra_nome FROM pavimentacao_ensaios pe LEFT JOIN obras o ON pe.obra_id = o.id WHERE pe.id = ?`, [id]
  );
}

export async function createPavEnsaio(data: PavEnsaioInput): Promise<string> {
  const db = await getDatabase();
  const id = generateId();
  const now = nowISO();
  await db.runAsync(
    `INSERT INTO pavimentacao_ensaios (id, obra_id, pavimentacao_inspecao_id, data, trecho, tipo_ensaio, resultado, unidade, conforme, observacoes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.obra_id, data.pavimentacao_inspecao_id ?? null, data.data, data.trecho, data.tipo_ensaio, data.resultado ?? null, data.unidade, data.conforme, data.observacoes, now]
  );
  return id;
}

export async function updatePavEnsaio(id: string, data: PavEnsaioInput): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE pavimentacao_ensaios SET obra_id = ?, pavimentacao_inspecao_id = ?, data = ?, trecho = ?, tipo_ensaio = ?, resultado = ?, unidade = ?, conforme = ?, observacoes = ? WHERE id = ?`,
    [data.obra_id, data.pavimentacao_inspecao_id ?? null, data.data, data.trecho, data.tipo_ensaio, data.resultado ?? null, data.unidade, data.conforme, data.observacoes, id]
  );
}

export async function countTodayPavInspecoes(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM pavimentacao_inspecoes WHERE date(data) = date('now', 'localtime')"
  );
  return result?.count ?? 0;
}

export async function countPavEnsaiosNaoConformes(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM pavimentacao_ensaios WHERE conforme = 0'
  );
  return result?.count ?? 0;
}

// ─── Dashboard Stats ───

export async function getPavDashboardStats(obraId?: string): Promise<{
  percentualCompactacaoConforme: number;
  totalEnsaiosRealizados: number;
  ncPorTrecho: { trecho: string; count: number }[];
}> {
  const db = await getDatabase();
  const whereObra = obraId ? ' WHERE obra_id = ?' : '';
  const params = obraId ? [obraId] : [];

  const totalResult = await db.getFirstAsync<{ total: number; conformes: number }>(
    `SELECT COUNT(*) as total, SUM(CASE WHEN compactacao_ok = 1 THEN 1 ELSE 0 END) as conformes FROM pavimentacao_inspecoes${whereObra}`, params
  );
  const total = totalResult?.total ?? 0;
  const conformes = totalResult?.conformes ?? 0;
  const percentual = total > 0 ? Math.round((conformes / total) * 100) : 0;

  const ensaiosResult = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM pavimentacao_ensaios${whereObra}`, params
  );

  const ncTrecho = await db.getAllAsync<{ trecho: string; count: number }>(
    `SELECT trecho, COUNT(*) as count FROM pavimentacao_inspecoes WHERE compactacao_ok = 0${obraId ? ' AND obra_id = ?' : ''} GROUP BY trecho ORDER BY count DESC`, params
  );

  return {
    percentualCompactacaoConforme: percentual,
    totalEnsaiosRealizados: ensaiosResult?.count ?? 0,
    ncPorTrecho: ncTrecho,
  };
}
