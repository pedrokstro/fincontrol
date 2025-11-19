import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para ajustar datas de transações
 * Adiciona +1 dia à data recebida do frontend
 * 
 * ⚠️ ATENÇÃO: Isso cria inconsistência entre frontend e backend!
 * Frontend mostra: 19/11/2025
 * Backend salva: 20/11/2025
 */
export const adjustTransactionDate = (req: Request, res: Response, next: NextFunction) => {
  // Só aplicar em rotas de criação/atualização de transações
  if (req.method === 'POST' || req.method === 'PUT') {
    if (req.body && req.body.date) {
      const originalDate = req.body.date;
      
      // Converter string YYYY-MM-DD para Date
      const [year, month, day] = originalDate.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      // Adicionar 1 dia
      date.setDate(date.getDate() + 1);
      
      // Converter de volta para string YYYY-MM-DD
      const adjustedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      console.log(`📅 [DATE ADJUST] Original: ${originalDate} → Ajustado: ${adjustedDate}`);
      
      // Substituir a data no body
      req.body.date = adjustedDate;
    }
  }
  
  next();
};
