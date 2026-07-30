import { prisma } from '../config/db';

export interface CreateTransactionDTO {
  userId: string;
  walletId: string;
  categoryId: string;
  amount: number;
  type: string; // INCOME, EXPENSE, TRANSFER
  description: string;
  date?: string;
  paymentMethod?: string;
  location?: string;
  notes?: string;
  tags?: string;
  isRecurring?: boolean;
  recurringFreq?: string;
}

export class TransactionService {
  static async createTransaction(dto: CreateTransactionDTO) {
    const transaction = await prisma.transaction.create({
      data: {
        userId: dto.userId,
        walletId: dto.walletId,
        categoryId: dto.categoryId,
        amount: dto.amount,
        type: dto.type,
        description: dto.description,
        date: dto.date ? new Date(dto.date) : new Date(),
        paymentMethod: dto.paymentMethod || 'Card',
        location: dto.location || null,
        notes: dto.notes || null,
        tags: dto.tags || null,
        isRecurring: dto.isRecurring || false,
        recurringFreq: dto.recurringFreq || 'NONE',
      },
      include: {
        category: true,
        wallet: true,
      },
    });

    // Balance update logic
    if (dto.type === 'INCOME') {
      await prisma.wallet.update({
        where: { id: dto.walletId },
        data: { balance: { increment: dto.amount } },
      });
    } else if (dto.type === 'EXPENSE') {
      await prisma.wallet.update({
        where: { id: dto.walletId },
        data: { balance: { decrement: dto.amount } },
      });
    }

    return transaction;
  }

  static async getTransactions(userId: string, query: {
    type?: string;
    categoryId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const whereClause: any = { userId };

    if (query.type) whereClause.type = query.type;
    if (query.categoryId) whereClause.categoryId = query.categoryId;
    if (query.search) {
      whereClause.OR = [
        { description: { contains: query.search } },
        { location: { contains: query.search } },
        { tags: { contains: query.search } },
      ];
    }
    if (query.startDate || query.endDate) {
      whereClause.date = {};
      if (query.startDate) whereClause.date.gte = new Date(query.startDate);
      if (query.endDate) whereClause.date.lte = new Date(query.endDate);
    }

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
        include: {
          category: true,
          wallet: true,
        },
      }),
      prisma.transaction.count({ where: whereClause }),
    ]);

    return {
      transactions: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async deleteTransaction(userId: string, id: string) {
    const tx = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!tx) throw new Error('Transaction not found');

    if (tx.type === 'INCOME') {
      await prisma.wallet.update({
        where: { id: tx.walletId },
        data: { balance: { decrement: tx.amount } },
      });
    } else if (tx.type === 'EXPENSE') {
      await prisma.wallet.update({
        where: { id: tx.walletId },
        data: { balance: { increment: tx.amount } },
      });
    }

    await prisma.transaction.delete({ where: { id } });
    return { success: true };
  }
}
