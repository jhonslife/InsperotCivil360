import { getDatabase } from './connection';

export async function runMigrations(): Promise<void> {
  const db = await getDatabase();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS obras (
      id TEXT PRIMARY KEY NOT NULL,
      nome TEXT NOT NULL,
      local TEXT NOT NULL,
      cliente TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('Rodovia', 'OAE', 'Industrial')),
      data_inicio TEXT NOT NULL,
      responsavel_tecnico TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'concluida', 'paralisada')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS inspections (
      id TEXT PRIMARY KEY NOT NULL,
      obra_id TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('fundacao', 'estrutura', 'oae', 'pavimentacao')),
      data TEXT NOT NULL,
      local_descricao TEXT DEFAULT '',
      latitude REAL,
      longitude REAL,
      observacoes TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('conforme', 'nao_conforme', 'pendente')),
      assinatura_path TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS checklist_items (
      id TEXT PRIMARY KEY NOT NULL,
      inspection_id TEXT NOT NULL,
      descricao TEXT NOT NULL,
      conforme INTEGER NOT NULL DEFAULT 0 CHECK (conforme IN (0, 1, 2)),
      observacao TEXT DEFAULT '',
      ordem INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS rnc (
      id TEXT PRIMARY KEY NOT NULL,
      numero INTEGER NOT NULL,
      obra_id TEXT NOT NULL,
      data TEXT NOT NULL,
      descricao TEXT NOT NULL,
      gravidade TEXT NOT NULL CHECK (gravidade IN ('baixa', 'media', 'alta')),
      responsavel TEXT DEFAULT '',
      prazo TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'em_andamento', 'fechada')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ensaios (
      id TEXT PRIMARY KEY NOT NULL,
      obra_id TEXT NOT NULL,
      tipo_ensaio TEXT NOT NULL CHECK (tipo_ensaio IN ('concreto', 'graute', 'pavimentacao')),
      data TEXT NOT NULL,
      local TEXT NOT NULL DEFAULT '',
      slump REAL,
      temperatura REAL,
      corpo_prova TEXT DEFAULT '',
      fluidez REAL,
      resistencia REAL,
      compactacao REAL,
      deflexao REAL,
      resultado TEXT DEFAULT '',
      situacao TEXT NOT NULL DEFAULT 'conforme' CHECK (situacao IN ('conforme', 'nao_conforme')),
      alerta TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS diary_entries (
      id TEXT PRIMARY KEY NOT NULL,
      obra_id TEXT NOT NULL,
      data TEXT NOT NULL,
      equipe TEXT DEFAULT '',
      clima TEXT DEFAULT 'ensolarado' CHECK (clima IN ('ensolarado', 'nublado', 'chuvoso', 'parcialmente_nublado')),
      atividades TEXT NOT NULL DEFAULT '',
      ocorrencias TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY NOT NULL,
      entity_type TEXT NOT NULL CHECK (entity_type IN ('inspection', 'rnc', 'diary', 'ensaio')),
      entity_id TEXT NOT NULL,
      uri TEXT NOT NULL,
      legenda TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_inspections_obra_id ON inspections(obra_id);
    CREATE INDEX IF NOT EXISTS idx_checklist_inspection_id ON checklist_items(inspection_id);
    CREATE INDEX IF NOT EXISTS idx_rnc_obra_id ON rnc(obra_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_rnc_numero_unique ON rnc(numero);
    CREATE INDEX IF NOT EXISTS idx_ensaios_obra_id ON ensaios(obra_id);
    CREATE INDEX IF NOT EXISTS idx_diary_obra_id ON diary_entries(obra_id);
    CREATE INDEX IF NOT EXISTS idx_photos_entity ON photos(entity_type, entity_id);
  `);
}
