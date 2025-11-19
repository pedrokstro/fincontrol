import { Request, Response } from 'express';
import { subscriptionService } from '../services/subscription.service';

export class SubscriptionController {
  /**
   * GET /api/subscription/status
   * Obter status da assinatura do usuário
   */
  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
        return;
      }

      const status = await subscriptionService.getSubscriptionStatus(userId);

      res.json({
        success: true,
        data: status,
      });
    } catch (error: any) {
      console.error('Erro ao obter status da assinatura:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao obter status da assinatura',
      });
    }
  }

  /**
   * POST /api/subscription/activate
   * Ativar plano premium
   */
  async activate(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { durationMonths = 1 } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
        return;
      }

      const user = await subscriptionService.activatePremiumPlan(
        userId,
        durationMonths
      );

      res.json({
        success: true,
        message: 'Plano Premium ativado com sucesso!',
        data: {
          planType: user.planType,
          planStartDate: user.planStartDate,
          planEndDate: user.planEndDate,
          isPremium: user.isPremium,
        },
      });
    } catch (error: any) {
      console.error('Erro ao ativar plano premium:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao ativar plano premium',
      });
    }
  }

  /**
   * POST /api/subscription/cancel
   * Cancelar plano premium
   */
  async cancel(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
        return;
      }

      const user = await subscriptionService.cancelPremiumPlan(userId);

      res.json({
        success: true,
        message: 'Plano Premium cancelado com sucesso',
        data: {
          planType: user.planType,
          isPremium: user.isPremium,
        },
      });
    } catch (error: any) {
      console.error('Erro ao cancelar plano premium:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao cancelar plano premium',
      });
    }
  }

  /**
   * POST /api/subscription/renew
   * Renovar plano premium
   */
  async renew(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { durationMonths = 1 } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
        return;
      }

      const user = await subscriptionService.renewPremiumPlan(
        userId,
        durationMonths
      );

      res.json({
        success: true,
        message: 'Plano Premium renovado com sucesso!',
        data: {
          planType: user.planType,
          planStartDate: user.planStartDate,
          planEndDate: user.planEndDate,
          isPremium: user.isPremium,
        },
      });
    } catch (error: any) {
      console.error('Erro ao renovar plano premium:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao renovar plano premium',
      });
    }
  }

  /**
   * GET /api/subscription/features
   * Obter features disponíveis
   */
  async getFeatures(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
        return;
      }

      const status = await subscriptionService.getSubscriptionStatus(userId);

      res.json({
        success: true,
        data: {
          features: status.features,
          isPremium: status.isPremium,
        },
      });
    } catch (error: any) {
      console.error('Erro ao obter features:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao obter features',
      });
    }
  }
}

export const subscriptionController = new SubscriptionController();
