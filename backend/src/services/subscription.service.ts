import { AppDataSource } from '../config/database';
import { User } from '../models/User';

export class SubscriptionService {
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Obter status da assinatura do usuário
   */
  async getSubscriptionStatus(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const isActive = user.isPlanActive();
    const daysRemaining = this.calculateDaysRemaining(user.planEndDate);

    return {
      planType: user.planType,
      isPremium: isActive,
      isActive: isActive,
      planStartDate: user.planStartDate,
      planEndDate: user.planEndDate,
      daysRemaining,
      features: this.getAvailableFeatures(user),
    };
  }

  /**
   * Ativar plano premium
   */
  async activatePremiumPlan(
    userId: string,
    durationMonths: number = 1
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationMonths);

    user.planType = 'premium';
    user.planStartDate = now;
    user.planEndDate = endDate;
    user.isPremium = true;

    await this.userRepository.save(user);

    return user;
  }

  /**
   * Cancelar plano premium
   */
  async cancelPremiumPlan(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    user.planType = 'free';
    user.planEndDate = new Date(); // Expira imediatamente
    user.isPremium = false;

    await this.userRepository.save(user);

    return user;
  }

  /**
   * Renovar plano premium
   */
  async renewPremiumPlan(
    userId: string,
    durationMonths: number = 1
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Se o plano ainda está ativo, estender a partir da data de fim atual
    // Caso contrário, começar a partir de agora
    const startDate = user.isPlanActive() && user.planEndDate
      ? new Date(user.planEndDate)
      : new Date();

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);

    user.planType = 'premium';
    if (!user.planStartDate) {
      user.planStartDate = new Date();
    }
    user.planEndDate = endDate;
    user.isPremium = true;

    await this.userRepository.save(user);

    return user;
  }

  /**
   * Verificar e expirar planos vencidos
   */
  async expireOldPlans(): Promise<number> {
    const now = new Date();

    const result = await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        planType: 'free',
        isPremium: false,
      })
      .where('planEndDate < :now', { now })
      .andWhere('planType = :planType', { planType: 'premium' })
      .execute();

    return result.affected || 0;
  }

  /**
   * Obter features disponíveis para o usuário
   */
  private getAvailableFeatures(user: User): string[] {
    const allFeatures = [
      'basic_categories',
      'basic_transactions',
      'basic_reports',
      'advanced_emojis',
      'custom_categories',
      'advanced_reports',
      'export_unlimited',
      'priority_support',
    ];

    return allFeatures.filter((feature) => user.hasFeatureAccess(feature));
  }

  /**
   * Calcular dias restantes do plano
   */
  private calculateDaysRemaining(endDate: Date | null): number | null {
    if (!endDate) return null;

    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }
}

export const subscriptionService = new SubscriptionService();
