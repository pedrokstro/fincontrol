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
  host: config.db.host,
  port: config.db.port,
  username: config.db.username,
  password: config.db.password,
  database: config.db.database,
  synchronize: config.nodeEnv === 'development', // Only in dev
  logging: config.nodeEnv === 'development',
  entities: [User, Category, Transaction, RefreshToken, UserPreference, VerificationCode, Notification],
  migrations: ['src/database/migrations/**/*.ts'],
  subscribers: [],
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
