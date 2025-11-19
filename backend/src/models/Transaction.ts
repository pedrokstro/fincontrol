import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Category } from './Category';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum RecurrenceType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ 
    type: 'date',
    transformer: {
      to: (value: any) => {
        // Ao salvar: manter como string se vier como string
        if (typeof value === 'string') {
          return value;
        }
        return value;
      },
      from: (value: any) => {
        // Ao ler: retornar apenas a parte da data (YYYY-MM-DD)
        if (value instanceof Date) {
          const year = value.getFullYear();
          const month = String(value.getMonth() + 1).padStart(2, '0');
          const day = String(value.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
        return value;
      }
    }
  })
  date: Date;

  @Column({ type: 'uuid' })
  categoryId: string;

  @Column({ type: 'uuid' })
  userId: string;

  // Recurring transaction fields
  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({
    type: 'enum',
    enum: RecurrenceType,
    nullable: true,
  })
  recurrenceType: RecurrenceType | null;

  @Column({ type: 'timestamp', nullable: true })
  recurrenceEndDate: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  nextOccurrence: Date | null;

  @Column({ type: 'uuid', nullable: true })
  parentTransactionId: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Category, (category) => category.transactions, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;
}
