const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fincontrol_db',
  user: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD || '360106'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Tabela para controle de migrations
const MIGRATIONS_TABLE = 'schema_migrations';

async function createMigrationsTable(client) {
  const query = `
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id SERIAL PRIMARY KEY,
      version VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  await client.query(query);
  console.log('✅ Tabela de migrations criada/verificada');
}

async function getExecutedMigrations(client) {
  const result = await client.query(
    `SELECT version FROM ${MIGRATIONS_TABLE} ORDER BY version`
  );
  return result.rows.map(row => row.version);
}

async function executeMigration(client, migration) {
  const { version, name, sql } = migration;
  
  console.log(`\n🔄 Executando migration: ${version} - ${name}`);
  
  try {
    // Iniciar transação
    await client.query('BEGIN');
    
    // Executar SQL da migration
    await client.query(sql);
    
    // Registrar migration executada
    await client.query(
      `INSERT INTO ${MIGRATIONS_TABLE} (version, name) VALUES ($1, $2)`,
      [version, name]
    );
    
    // Commit
    await client.query('COMMIT');
    
    console.log(`✅ Migration ${version} executada com sucesso`);
    return true;
  } catch (error) {
    // Rollback em caso de erro
    await client.query('ROLLBACK');
    console.error(`❌ Erro ao executar migration ${version}:`, error.message);
    throw error;
  }
}

async function getMigrationFiles() {
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.log('⚠️  Diretório de migrations não encontrado');
    return [];
  }
  
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  return files.map(file => {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Formato esperado: YYYYMMDDHHMMSS_nome_da_migration.sql
    const match = file.match(/^(\d{14})_(.+)\.sql$/);
    
    if (!match) {
      throw new Error(`Nome de arquivo inválido: ${file}. Use o formato: YYYYMMDDHHMMSS_nome.sql`);
    }
    
    return {
      version: match[1],
      name: match[2].replace(/_/g, ' '),
      filename: file,
      sql
    };
  });
}

async function runMigrations() {
  const client = new Client(dbConfig);
  
  try {
    console.log('🔌 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado ao banco de dados');
    
    // Criar tabela de controle de migrations
    await createMigrationsTable(client);
    
    // Obter migrations já executadas
    const executedMigrations = await getExecutedMigrations(client);
    console.log(`\n📊 Migrations já executadas: ${executedMigrations.length}`);
    
    // Obter arquivos de migration
    const migrationFiles = await getMigrationFiles();
    console.log(`📁 Arquivos de migration encontrados: ${migrationFiles.length}`);
    
    // Filtrar migrations pendentes
    const pendingMigrations = migrationFiles.filter(
      migration => !executedMigrations.includes(migration.version)
    );
    
    if (pendingMigrations.length === 0) {
      console.log('\n✅ Nenhuma migration pendente. Banco de dados está atualizado!');
      return;
    }
    
    console.log(`\n🚀 Executando ${pendingMigrations.length} migration(s) pendente(s)...\n`);
    
    // Executar migrations pendentes
    for (const migration of pendingMigrations) {
      await executeMigration(client, migration);
    }
    
    console.log('\n✅ Todas as migrations foram executadas com sucesso!');
    
  } catch (error) {
    console.error('\n❌ Erro ao executar migrations:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Conexão com banco de dados encerrada');
  }
}

// Executar
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('\n✅ Processo de migrations concluído');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Falha no processo de migrations:', error);
      process.exit(1);
    });
}

module.exports = { runMigrations };
