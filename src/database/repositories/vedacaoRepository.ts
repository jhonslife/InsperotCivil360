import { getDatabase } from '../connection';
import { VedacaoInspecao } from '../../models/VedacaoInspecao';
import { generateId } from '../../utils/generateId';
import { nowISO } from '../../utils/formatDate';

interface VedacaoInput {
  obra_id: string;
  data: string;
  tipo_vedacao: VedacaoInspecao['tipo_vedacao'];
  local_descricao: string;
  material_conforme: number;
  base_nivelada: number;
  prumo_alinhamento_ok: number;
  junta_adequada: number;
  amarracao_ok: number;
  vergas_contravergas_ok: number;
  fixacao_adequada: number;
  ausencia_trincas: number;
  limpeza_ok: number;
  observacoes: string;
  latitude?: number | null;
  longitude?: number | null;
}

export async function getAllVedacaoInspecoes(): Promise<VedacaoInspecao[]> {
  const db = await getDatabase();
  return await db.getAllAsync<VedacaoInspecao>(
    `SELECT v.*, o.nome as obra_nome FROM vedacao_inspecoes v LEFT JOIN obras o ON v.obra_id = o.id ORDER BY v.created_at DESC`
  );
}

export async function getVedacaoById(id: string): Promise<VedacaoInspecao | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<VedacaoInspecao>(
    `SELECT v.*, o.nome as obra_nome FROM vedacao_inspecoes v LEFT JOIN obras o ON v.obra_id = o.id WHERE v.id = ?`, [id]
  );
}

export async function createVedacaoInspecao(data: VedacaoInput): Promise<string> {
  const db = await getDatabase();
  const id = generateId();
  const now = nowISO();
  await db.runAsync(
    `INSERT INTO vedacao_inspecoes (id, obra_id, data, tipo_vedacao, local_descricao, material_conforme, base_nivelada, prumo_alinhamento_ok, junta_adequada, amarracao_ok, vergas_contravergas_ok, fixacao_adequada, ausencia_trincas, limpeza_ok, observacoes, latitude, longitude, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.obra_id, data.data, data.tipo_vedacao, data.local_descricao, data.material_conforme, data.base_nivelada, data.prumo_alinhamento_ok, data.junta_adequada, data.amarracao_ok, data.vergas_contravergas_ok, data.fixacao_adequada, data.ausencia_trincas, data.limpeza_ok, data.observacoes, data.latitude ?? null, data.longitude ?? null, now]
  );
  return id;
}

export async function updateVedacaoInspecao(id: string, data: VedacaoInput): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE vedacao_inspecoes SET obra_id = ?, data = ?, tipo_vedacao = ?, local_descricao = ?, material_conforme = ?, base_nivelada = ?, prumo_alinhamento_ok = ?, junta_adequada = ?, amarracao_ok = ?, vergas_contravergas_ok = ?, fixacao_adequada = ?, ausencia_trincas = ?, limpeza_ok = ?, observacoes = ?, latitude = ?, longitude = ? WHERE id = ?`,
    [data.obra_id, data.data, data.tipo_vedacao, data.local_descricao, data.material_conforme, data.base_nivelada, data.prumo_alinhamento_ok, data.junta_adequada, data.amarracao_ok, data.vergas_contravergas_ok, data.fixacao_adequada, data.ausencia_trincas, data.limpeza_ok, data.observacoes, data.latitude ?? null, data.longitude ?? null, id]
  );
}

export async function updateVedacaoSignature(id: string, signaturePath: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE vedacao_inspecoes SET assinatura_path = ? WHERE id = ?', [signaturePath, id]);
}

export async function countTodayVedacaoInspecoes(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM vedacao_inspecoes WHERE date(data) = date('now', 'localtime')"
  );
  return result?.count ?? 0;
}
