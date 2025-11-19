import { DataSource } from 'typeorm';
import { config } from './env';
import { User } from '@/models/User';
import { Category } from '@/models/Category';
import { Transaction } from '@/models/Transaction';
import { RefreshToken } from '@/models/RefreshToken';
import { UserPreference } from '@/entities/UserPreference';
import { VerificationCode } from '@/entities/VerificationCode';
import { Notification } from '@/models/Notification';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || undefined,
  host: process.env.DATABASE_URL ? undefined : config.db.host,
  port: process.env.DATABASE_URL ? undefined : config.db.port,
  username: process.env.DATABASE_URL ? undefined : config.db.username,
  password: process.env.DATABASE_URL ? undefined : config.db.password,
  database: process.env.DATABASE_URL ? undefined : config.db.database,
  synchronize: false, // DESABILITADO - Usar migrations
  logging: config.nodeEnv === 'development',
  entities: [User, Category, Transaction, RefreshToken, UserPreference, VerificationCode, Notification],
  migrations: ['dist/database/migrations/**/*.js'],
  migrationsRun: true, // Executar migrations automaticamente
  subscribers: [],
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
  extra: {
    // Configurar timezone para UTC
    timezone: 'UTC',
  },
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
    process.exit(1);
  }
};
