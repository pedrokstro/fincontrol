import { AppDataSource } from '../config/database';
import { SavingsGoal, CreateSavingsGoalData } from '../models/SavingsGoal';

export class SavingsGoalService {
  /**
   * Criar ou atualizar meta de economia para um mês/ano específico
   */
  async upsertGoal(userId: string, data: CreateSavingsGoalData): Promise<SavingsGoal> {
    const { targetAmount, month, year, description } = data;

    const query = `
      INSERT INTO savings_goals (user_id, target_amount, month, year, description)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, month, year)
      DO UPDATE SET
        target_amount = EXCLUDED.target_amount,
        description = EXCLUDED.description,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await AppDataSource.manager.query(query, [userId, targetAmount, month, year, description || null]);
    return this.mapToSavingsGoal(result[0]);
  }

  /**
   * Buscar meta de economia para um mês/ano específico
   */
  async getGoalByMonthYear(userId: string, month: number, year: number): Promise<SavingsGoal | null> {
    const query = `
      SELECT * FROM savings_goals
      WHERE user_id = $1 AND month = $2 AND year = $3
    `;

    const result = await AppDataSource.manager.query(query, [userId, month, year]);
    
    if (result.length === 0) {
      return null;
    }

    return this.mapToSavingsGoal(result[0]);
  }

  /**
   * Buscar meta atual (mês/ano atual)
   */
  async getCurrentGoal(userId: string): Promise<SavingsGoal | null> {
    const now = new Date();
    const month = now.getMonth() + 1; // JavaScript months are 0-indexed
    const year = now.getFullYear();

    return this.getGoalByMonthYear(userId, month, year);
  }

  /**
   * Atualizar valor atual da meta baseado nas transações do mês
   */
  async updateCurrentAmount(userId: string, month: number, year: number): Promise<void> {
    // Calcular saldo do mês (receitas - despesas)
    const transactionsQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
      FROM transactions
      WHERE "userId" = $1
        AND EXTRACT(MONTH FROM date) = $2
        AND EXTRACT(YEAR FROM date) = $3
    `;

    const transactionsResult = await AppDataSource.manager.query(transactionsQuery, [userId, month, year]);
    const { income, expense } = transactionsResult[0];
    const currentAmount = Math.max(0, parseFloat(income) - parseFloat(expense));

    // Atualizar current_amount na meta
    const updateQuery = `
      UPDATE savings_goals
      SET current_amount = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2 AND month = $3 AND year = $4
    `;

    await AppDataSource.manager.query(updateQuery, [currentAmount, userId, month, year]);
  }

  /**
   * Buscar todas as metas do usuário
   */
  async getAllGoals(userId: string): Promise<SavingsGoal[]> {
    const query = `
      SELECT * FROM savings_goals
      WHERE user_id = $1
      ORDER BY year DESC, month DESC
    `;

    const result = await AppDataSource.manager.query(query, [userId]);
    return result.map((row: any) => this.mapToSavingsGoal(row));
  }

  /**
   * Deletar meta
   */
  async deleteGoal(userId: string, goalId: string): Promise<boolean> {
    const query = `
      DELETE FROM savings_goals
      WHERE id = $1 AND user_id = $2
    `;

    const result = await AppDataSource.manager.query(query, [goalId, userId]);
    return result.length > 0;
  }

  /**
   * Mapear resultado do banco para o modelo
   */
  private mapToSavingsGoal(row: any): SavingsGoal {
    return {
      id: row.id,
      userId: row.user_id,
      targetAmount: parseFloat(row.target_amount),
      currentAmount: parseFloat(row.current_amount || 0),
      month: row.month,
      year: row.year,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default new SavingsGoalService();
