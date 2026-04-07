import { getDatabase } from './connection';

interface Migration {
  version: number;
  name: string;
  up: (db: Awaited<ReturnType<typeof getDatabase>>) => Promise<void>;
}

async function getTableColumns(
  db: Awaited<ReturnType<typeof getDatabase>>,
  tableName: string
): Promise<Set<string>> {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${tableName})`);
  return new Set(columns.map((column) => column.name));
}

const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    up: async (db) => {
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
          tipo TEXT NOT NULL,
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
          entity_type TEXT NOT NULL,
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
    },
  },
  {
    version: 2,
    name: 'fundacoes_profundas',
    up: async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS fundacoes (
          id TEXT PRIMARY KEY NOT NULL,
          obra_id TEXT NOT NULL,
          tipo TEXT NOT NULL CHECK (tipo IN (
            'estaca_cravada', 'estaca_escavada', 'estaca_helice_continua',
            'estaca_strauss', 'estaca_raiz', 'tubulao'
          )),
          diametro REAL NOT NULL,
          profundidade_projeto REAL NOT NULL,
          profundidade_atingida REAL,
          latitude REAL,
          longitude REAL,
          localizacao_desc TEXT DEFAULT '',
          data TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'em_execucao' CHECK (status IN (
            'em_execucao', 'concluida', 'com_nc'
          )),
          observacoes TEXT DEFAULT '',
          assinatura_path TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS fundacao_dados_tecnicos (
          id TEXT PRIMARY KEY NOT NULL,
          fundacao_id TEXT NOT NULL,
          campo TEXT NOT NULL,
          valor_numerico REAL,
          valor_texto TEXT DEFAULT '',
          unidade TEXT DEFAULT '',
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (fundacao_id) REFERENCES fundacoes(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS fundacao_checklist_items (
          id TEXT PRIMARY KEY NOT NULL,
          fundacao_id TEXT NOT NULL,
          descricao TEXT NOT NULL,
          conforme INTEGER NOT NULL DEFAULT 0 CHECK (conforme IN (0, 1, 2)),
          observacao TEXT DEFAULT '',
          ordem INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (fundacao_id) REFERENCES fundacoes(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_fundacoes_obra_id ON fundacoes(obra_id);
        CREATE INDEX IF NOT EXISTS idx_fundacao_dados_fundacao_id ON fundacao_dados_tecnicos(fundacao_id);
        CREATE INDEX IF NOT EXISTS idx_fundacao_checklist_fundacao_id ON fundacao_checklist_items(fundacao_id);
      `);
    },
  },
  {
    version: 3,
    name: 'concreto_armadura_formas_cp',
    up: async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS concreto_inspecoes (
          id TEXT PRIMARY KEY NOT NULL,
          obra_id TEXT NOT NULL,
          data TEXT NOT NULL,
          elemento TEXT NOT NULL CHECK (elemento IN ('pilar', 'viga', 'laje', 'fundacao')),
          fck_projeto REAL NOT NULL,
          slump REAL,
          temperatura_concreto REAL,
          adensamento_ok INTEGER DEFAULT 0,
          cura_ok INTEGER DEFAULT 0,
          observacoes TEXT DEFAULT '',
          latitude REAL,
          longitude REAL,
          assinatura_path TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS armadura_inspecoes (
          id TEXT PRIMARY KEY NOT NULL,
          obra_id TEXT NOT NULL,
          data TEXT NOT NULL,
          elemento TEXT NOT NULL,
          diametro REAL,
          espacamento REAL,
          cobrimento_ok INTEGER DEFAULT 0,
          amarracao_ok INTEGER DEFAULT 0,
          conforme_projeto INTEGER DEFAULT 0,
          observacoes TEXT DEFAULT '',
          latitude REAL,
          longitude REAL,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS formas_inspecoes (
          id TEXT PRIMARY KEY NOT NULL,
          obra_id TEXT NOT NULL,
          data TEXT NOT NULL,
          elemento TEXT NOT NULL,
          alinhamento_ok INTEGER DEFAULT 0,
          nivelamento_ok INTEGER DEFAULT 0,
          estanqueidade_ok INTEGER DEFAULT 0,
          limpeza_ok INTEGER DEFAULT 0,
          desmoldante_aplicado INTEGER DEFAULT 0,
          observacoes TEXT DEFAULT '',
          latitude REAL,
          longitude REAL,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS rompimento_corpos_prova (
          id TEXT PRIMARY KEY NOT NULL,
          obra_id TEXT NOT NULL,
          concreto_inspecao_id TEXT,
          data TEXT NOT NULL,
          idade INTEGER NOT NULL,
          resistencia REAL NOT NULL,
          fck_projeto REAL NOT NULL,
          conforme INTEGER DEFAULT 0,
          observacoes TEXT DEFAULT '',
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE,
          FOREIGN KEY (concreto_inspecao_id) REFERENCES concreto_inspecoes(id) ON DELETE SET NULL
        );

        CREATE INDEX IF NOT EXISTS idx_concreto_obra_id ON concreto_inspecoes(obra_id);
        CREATE INDEX IF NOT EXISTS idx_armadura_obra_id ON armadura_inspecoes(obra_id);
        CREATE INDEX IF NOT EXISTS idx_formas_obra_id ON formas_inspecoes(obra_id);
        CREATE INDEX IF NOT EXISTS idx_cp_obra_id ON rompimento_corpos_prova(obra_id);
        CREATE INDEX IF NOT EXISTS idx_cp_concreto_id ON rompimento_corpos_prova(concreto_inspecao_id);
      `);
    },
  },
  {
    version: 4,
    name: 'vedacao',
    up: async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS vedacao_inspecoes (
          id TEXT PRIMARY KEY NOT NULL,
          obra_id TEXT NOT NULL,
          data TEXT NOT NULL,
          tipo_vedacao TEXT NOT NULL CHECK (tipo_vedacao IN ('alvenaria', 'drywall')),
          local_descricao TEXT DEFAULT '',
          material_conforme INTEGER DEFAULT 0,
          base_nivelada INTEGER DEFAULT 0,
          prumo_alinhamento_ok INTEGER DEFAULT 0,
          junta_adequada INTEGER DEFAULT 0,
          amarracao_ok INTEGER DEFAULT 0,
          vergas_contravergas_ok INTEGER DEFAULT 0,
          fixacao_adequada INTEGER DEFAULT 0,
          ausencia_trincas INTEGER DEFAULT 0,
          limpeza_ok INTEGER DEFAULT 0,
          observacoes TEXT DEFAULT '',
          latitude REAL,
          longitude REAL,
          assinatura_path TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_vedacao_obra_id ON vedacao_inspecoes(obra_id);
      `);
    },
  },
  {
    version: 5,
    name: 'pavimentacao_avancada',
    up: async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS pavimentacao_inspecoes (
          id TEXT PRIMARY KEY NOT NULL,
          obra_id TEXT NOT NULL,
          data TEXT NOT NULL,
          trecho TEXT NOT NULL DEFAULT '',
          camada TEXT NOT NULL CHECK (camada IN ('subleito', 'sub_base', 'base', 'cbuq')),
          espessura REAL,
          compactacao_ok INTEGER DEFAULT 0,
          umidade_ok INTEGER DEFAULT 0,
          temperatura REAL,
          latitude REAL,
          longitude REAL,
          km_inicio TEXT DEFAULT '',
          km_fim TEXT DEFAULT '',
          observacoes TEXT DEFAULT '',
          assinatura_path TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS pavimentacao_ensaios (
          id TEXT PRIMARY KEY NOT NULL,
          obra_id TEXT NOT NULL,
          pavimentacao_inspecao_id TEXT,
          data TEXT NOT NULL,
          trecho TEXT NOT NULL DEFAULT '',
          tipo_ensaio TEXT NOT NULL CHECK (tipo_ensaio IN (
            'grau_compactacao', 'densidade_in_situ', 'teor_ligante', 'marshall'
          )),
          resultado REAL,
          unidade TEXT DEFAULT '',
          conforme INTEGER DEFAULT 0,
          observacoes TEXT DEFAULT '',
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE,
          FOREIGN KEY (pavimentacao_inspecao_id) REFERENCES pavimentacao_inspecoes(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS pavimentacao_checklist_items (
          id TEXT PRIMARY KEY NOT NULL,
          pavimentacao_inspecao_id TEXT NOT NULL,
          descricao TEXT NOT NULL,
          conforme INTEGER NOT NULL DEFAULT 0 CHECK (conforme IN (0, 1, 2)),
          observacao TEXT DEFAULT '',
          ordem INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (pavimentacao_inspecao_id) REFERENCES pavimentacao_inspecoes(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_pav_insp_obra_id ON pavimentacao_inspecoes(obra_id);
        CREATE INDEX IF NOT EXISTS idx_pav_ensaio_obra_id ON pavimentacao_ensaios(obra_id);
        CREATE INDEX IF NOT EXISTS idx_pav_checklist_insp_id ON pavimentacao_checklist_items(pavimentacao_inspecao_id);
      `);
    },
  },
  {
    version: 6,
    name: 'rnc_automatic_fields',
    up: async (db) => {
      const columns = await getTableColumns(db, 'rnc');

      if (!columns.has('origem_tipo')) {
        await db.execAsync("ALTER TABLE rnc ADD COLUMN origem_tipo TEXT DEFAULT '';");
      }
      if (!columns.has('origem_id')) {
        await db.execAsync("ALTER TABLE rnc ADD COLUMN origem_id TEXT DEFAULT '';");
      }
      if (!columns.has('causa')) {
        await db.execAsync("ALTER TABLE rnc ADD COLUMN causa TEXT DEFAULT '';");
      }
      if (!columns.has('acao_corretiva')) {
        await db.execAsync("ALTER TABLE rnc ADD COLUMN acao_corretiva TEXT DEFAULT '';");
      }
    },
  },
  {
    version: 7,
    name: 'rnc_numero_por_obra',
    up: async (db) => {
      await db.execAsync(`
        DROP INDEX IF EXISTS idx_rnc_numero_unique;
        CREATE UNIQUE INDEX IF NOT EXISTS idx_rnc_obra_numero_unique ON rnc(obra_id, numero);
      `);
    },
  },
];

export async function runMigrations(): Promise<void> {
  const db = await getDatabase();

  // Create migrations tracking table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Get current version
  const result = await db.getFirstAsync<{ max_version: number | null }>(
    'SELECT MAX(version) as max_version FROM _migrations'
  );
  const currentVersion = result?.max_version ?? 0;

  // Run pending migrations
  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      try {
        await db.execAsync('BEGIN IMMEDIATE TRANSACTION;');
        await migration.up(db);
        await db.runAsync(
          'INSERT INTO _migrations (version, name) VALUES (?, ?)',
          [migration.version, migration.name]
        );
        await db.execAsync('COMMIT;');
        console.log(`Migration v${migration.version} (${migration.name}) applied successfully`);
      } catch (error) {
        try {
          await db.execAsync('ROLLBACK;');
        } catch {
          // Ignore rollback failures when there is no active transaction.
        }
        console.error(`Migration v${migration.version} (${migration.name}) failed:`, error);
        throw error;
      }
    }
  }
}
