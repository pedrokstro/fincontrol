import { AppDataSource } from '@/config/database';
import { Transaction, TransactionType } from '@/models/Transaction';
import { NotFoundError } from '@/utils/errors';
import { Between } from 'typeorm';

export class TransactionService {
  private transactionRepository = AppDataSource.getRepository(Transaction);

  async create(userId: string, data: any) {
    // Log para debug
    console.log('📅 [DEBUG] Data recebida:', data.date, 'Tipo:', typeof data.date);
    
    // Garantir que a data seja tratada corretamente (sem timezone)
    // ADICIONAR 2 DIAS para compensar o timezone do PostgreSQL
    let transactionDate: string;
    if (data.date) {
      if (typeof data.date === 'string') {
        // Adicionar 2 dias à data
        const [year, month, day] = data.date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        dateObj.setDate(dateObj.getDate() + 2); // ADICIONAR 2 DIAS
        
        const newYear = dateObj.getFullYear();
        const newMonth = String(dateObj.getMonth() + 1).padStart(2, '0');
        const newDay = String(dateObj.getDate()).padStart(2, '0');
        transactionDate = `${newYear}-${newMonth}-${newDay}`;
        
        console.log('📅 [DEBUG] Data original:', data.date);
        console.log('📅 [DEBUG] Data +2 dias:', transactionDate);
      } else {
        const dateObj = new Date(data.date);
        dateObj.setDate(dateObj.getDate() + 2); // ADICIONAR 2 DIAS
        
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        transactionDate = `${year}-${month}-${day}`;
      }
    } else {
      // Se não vier data, usar hoje no formato string + 2 dias
      const today = new Date();
      today.setDate(today.getDate() + 2); // ADICIONAR 2 DIAS
      transactionDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }
    
    // Log dos parâmetros que serão enviados
    console.log('💾 [DEBUG] Salvando transação com parâmetros:');
    console.log('  - Data:', transactionDate);
    console.log('  - Tipo:', data.type);
    console.log('  - Descrição:', data.description);
    
    // Testar query direta para ver o que o PostgreSQL está fazendo
    const testResult = await this.transactionRepository.query(
      `SELECT $1::date as test_date, CURRENT_TIMESTAMP as current_time, current_setting('TIMEZONE') as timezone`,
      [transactionDate]
    );
    console.log('🧪 [DEBUG] Teste de conversão PostgreSQL:');
    console.log('  - Input:', transactionDate);
    console.log('  - Output:', testResult[0].test_date);
    console.log('  - Timezone:', testResult[0].timezone);
    console.log('  - Current time:', testResult[0].current_time);
    
    // Usar query SQL direta com cast simples para date
    // O PostgreSQL vai interpretar a string como data local
    const result = await this.transactionRepository.query(
      `INSERT INTO transactions (type, amount, description, date, "categoryId", "userId", "isRecurring", "recurrenceType", "recurrenceEndDate", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING id, date::text as date`,
      [
        data.type,
        data.amount,
        data.description,
        transactionDate, // String no formato YYYY-MM-DD (sem cast, deixar PostgreSQL interpretar)
        data.categoryId,
        userId,
        data.isRecurring || false,
        data.recurrenceType || null,
        data.recurrenceEndDate || null
      ]
    );
    
    console.log('💾 [DEBUG] Transação salva no banco:');
    console.log('  - ID:', result[0].id);
    console.log('  - Data retornada:', result[0].date);
    console.log('  - Data retornada (tipo):', typeof result[0].date);
    console.log('  - Data retornada (instanceof Date):', result[0].date instanceof Date);
    
    const transactionId = result[0].id;
    console.log('✅ [DEBUG] Transação criada com ID:', transactionId);
    
    return this.transactionRepository.findOne({
      where: { id: transactionId },
      relations: ['category'],
    });
  }

  async findAll(userId: string, filters: any) {
    console.log('🔍 [DEBUG] Buscando transações...');
    const { 
      month, 
      year, 
      type, 
      categoryId, 
      page = 1, 
      limit = 10, 
      sortBy = 'date', 
      sortOrder = 'desc' 
    } = filters;
    
    const where: any = { userId };
    
    if (type) {
      where.type = type;
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Filtro por mês/ano
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      where.date = Between(startDate, endDate);
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      where.date = Between(startDate, endDate);
    }

    const [transactions, total] = await this.transactionRepository.findAndCount({
      where,
      relations: ['category'],
      order: { [sortBy]: sortOrder.toUpperCase() },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Converter datas para string no formato YYYY-MM-DD
    const transactionsWithFixedDates = transactions.map((t: any) => {
      let dateString: string;
      const dateValue = t.date;
      
      if (typeof dateValue === 'string') {
        // Se já é string, extrair apenas YYYY-MM-DD
        dateString = dateValue.includes('T') ? dateValue.split('T')[0] : dateValue;
      } else if (dateValue instanceof Date) {
        // Se é Date, extrair apenas a parte da data usando toISOString
        dateString = dateValue.toISOString().split('T')[0];
      } else {
        dateString = String(dateValue);
      }
      
      return {
        ...t,
        date: dateString
      };
    });

    console.log('🔍 [DEBUG] Primeira transação após conversão:');
    if (transactionsWithFixedDates.length > 0) {
      console.log('  - Descrição:', transactionsWithFixedDates[0].description);
      console.log('  - Data:', transactionsWithFixedDates[0].date);
    }

    return { 
      transactions: transactionsWithFixedDates as any, 
      total, 
      page: Number(page), 
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    };
  }

  async findById(id: string, userId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { id, userId },
      relations: ['category'],
    });
    
    if (!transaction) {
      throw new NotFoundError('Transação não encontrada');
    }
    
    return transaction;
  }

  async update(id: string, userId: string, data: Partial<Transaction>) {
    const transaction = await this.findById(id, userId);
    Object.assign(transaction, data);
    await this.transactionRepository.save(transaction);
    
    return this.transactionRepository.findOne({
      where: { id: transaction.id },
      relations: ['category'],
    });
  }

  async delete(id: string, userId: string) {
    const transaction = await this.findById(id, userId);
    await this.transactionRepository.remove(transaction);
  }

  async getDashboardData(userId: string, month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();
    
    // Criar strings de data no formato YYYY-MM-DD
    const startOfMonth = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(targetYear, targetMonth, 0).getDate();
    const endOfMonth = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const transactions = await this.transactionRepository.find({
      where: {
        userId,
        date: Between(startOfMonth, endOfMonth),
      },
      relations: ['category'],
      order: { date: 'DESC' },
    });

    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Agrupar por categoria
    const byCategory = transactions.reduce((acc: any, t) => {
      const categoryName = t.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = {
          name: categoryName,
          type: t.type,
          total: 0,
          color: t.category.color,
          icon: t.category.icon,
        };
      }
      acc[categoryName].total += Number(t.amount);
      return acc;
    }, {});

    return {
      summary: {
        income,
        expense,
        balance: income - expense,
        month: targetMonth,
        year: targetYear,
      },
      recentTransactions: transactions.slice(0, 10),
      byCategory: Object.values(byCategory),
    };
  }
}
