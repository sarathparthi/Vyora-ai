import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Vyora Database...');

  // 1. System Default Categories
  const categoriesData = [
    { name: 'Salary', type: 'INCOME', icon: 'Briefcase', color: '#10B981', isSystem: true },
    { name: 'Freelance & Business', type: 'INCOME', icon: 'Laptop', color: '#3B82F6', isSystem: true },
    { name: 'Investments', type: 'INCOME', icon: 'TrendingUp', color: '#8B5CF6', isSystem: true },
    { name: 'Food & Dining', type: 'EXPENSE', icon: 'Utensils', color: '#F59E0B', isSystem: true },
    { name: 'Groceries', type: 'EXPENSE', icon: 'ShoppingBag', color: '#EC4899', isSystem: true },
    { name: 'Rent & Housing', type: 'EXPENSE', icon: 'Home', color: '#EF4444', isSystem: true },
    { name: 'Fuel & Transportation', type: 'EXPENSE', icon: 'Car', color: '#6366F1', isSystem: true },
    { name: 'Utilities & Bills', type: 'EXPENSE', icon: 'Zap', color: '#14B8A6', isSystem: true },
    { name: 'Subscriptions & Entertainment', type: 'EXPENSE', icon: 'Film', color: '#A855F7', isSystem: true },
    { name: 'Shopping & Tech', type: 'EXPENSE', icon: 'Gift', color: '#F97316', isSystem: true },
    { name: 'Healthcare & Fitness', type: 'EXPENSE', icon: 'Activity', color: '#06B6D4', isSystem: true },
  ];

  for (const cat of categoriesData) {
    const existing = await prisma.category.findFirst({ where: { name: cat.name, userId: null } });
    if (!existing) {
      await prisma.category.create({ data: cat });
    }
  }

  // 2. Demo User
  const demoEmail = 'demo@vyora.ai';
  let demoUser = await prisma.user.findUnique({ where: { email: demoEmail } });

  if (!demoUser) {
    const passwordHash = await argon2.hash('Password123!');
    demoUser = await prisma.user.create({
      data: {
        email: demoEmail,
        passwordHash,
        name: 'Alex Vance',
        role: 'ADMIN',
        currency: 'USD',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      },
    });
    console.log('✅ Created Demo User: demo@vyora.ai / Password123!');
  }

  // 3. Demo Wallets
  let mainBank = await prisma.wallet.findFirst({ where: { userId: demoUser.id, name: 'Chase Checking' } });
  if (!mainBank) {
    mainBank = await prisma.wallet.create({
      data: {
        userId: demoUser.id,
        name: 'Chase Checking',
        type: 'BANK_ACCOUNT',
        balance: 8450.0,
        currency: 'USD',
        isDefault: true,
        color: '#2563EB',
      },
    });
  }

  let creditCard = await prisma.wallet.findFirst({ where: { userId: demoUser.id, name: 'Amex Sapphire Card' } });
  if (!creditCard) {
    creditCard = await prisma.wallet.create({
      data: {
        userId: demoUser.id,
        name: 'Amex Sapphire Card',
        type: 'CREDIT_CARD',
        balance: 1200.0,
        currency: 'USD',
        isDefault: false,
        color: '#DC2626',
      },
    });
  }

  let savingsAccount = await prisma.wallet.findFirst({ where: { userId: demoUser.id, name: 'High-Yield Savings' } });
  if (!savingsAccount) {
    savingsAccount = await prisma.wallet.create({
      data: {
        userId: demoUser.id,
        name: 'High-Yield Savings',
        type: 'BANK_ACCOUNT',
        balance: 15300.0,
        currency: 'USD',
        isDefault: false,
        color: '#059669',
      },
    });
  }

  // 4. Fetch Category IDs
  const categories = await prisma.category.findMany();
  const salaryCat = categories.find((c) => c.name === 'Salary')!;
  const freelanceCat = categories.find((c) => c.name === 'Freelance & Business')!;
  const foodCat = categories.find((c) => c.name === 'Food & Dining')!;
  const rentCat = categories.find((c) => c.name === 'Rent & Housing')!;
  const fuelCat = categories.find((c) => c.name === 'Fuel & Transportation')!;
  const subCat = categories.find((c) => c.name === 'Subscriptions & Entertainment')!;

  // 5. Populate Sample Transactions
  const sampleTransactions = [
    {
      userId: demoUser.id,
      walletId: mainBank.id,
      categoryId: salaryCat.id,
      amount: 5200.0,
      type: 'INCOME',
      description: 'Monthly Tech Salary - Vyora Corp',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      paymentMethod: 'Direct Deposit',
      tags: 'salary,tech',
    },
    {
      userId: demoUser.id,
      walletId: mainBank.id,
      categoryId: freelanceCat.id,
      amount: 1400.0,
      type: 'INCOME',
      description: 'Freelance UI Design Contract',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      paymentMethod: 'Bank Transfer',
      tags: 'freelance,side-hustle',
    },
    {
      userId: demoUser.id,
      walletId: mainBank.id,
      categoryId: rentCat.id,
      amount: 1850.0,
      type: 'EXPENSE',
      description: 'Monthly Apartment Rent',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      paymentMethod: 'Bank Transfer',
      tags: 'rent,housing',
    },
    {
      userId: demoUser.id,
      walletId: creditCard.id,
      categoryId: foodCat.id,
      amount: 145.5,
      type: 'EXPENSE',
      description: 'Dinner at Italian Bistro',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      paymentMethod: 'Credit Card',
      location: 'Downtown SF',
      tags: 'dining,food',
    },
    {
      userId: demoUser.id,
      walletId: creditCard.id,
      categoryId: fuelCat.id,
      amount: 65.0,
      type: 'EXPENSE',
      description: 'Gas Station Fuel Refill',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      paymentMethod: 'Credit Card',
      tags: 'fuel,car',
    },
    {
      userId: demoUser.id,
      walletId: mainBank.id,
      categoryId: subCat.id,
      amount: 29.99,
      type: 'EXPENSE',
      description: 'ChatGPT & Cloud Storage Subscription',
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      paymentMethod: 'Auto Debit',
      isRecurring: true,
      tags: 'subscription,software',
    },
  ];

  for (const tx of sampleTransactions) {
    await prisma.transaction.create({ data: tx });
  }

  // 6. Monthly Budget Cap
  const now = new Date();
  await prisma.budget.upsert({
    where: {
      userId_month_year: {
        userId: demoUser.id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      title: 'Vyora Master Budget',
      totalCap: 4500.0,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      alertPercent: 80,
    },
  });

  // 7. Savings Goals
  const goals = [
    { name: 'Emergency Reserve', targetAmount: 10000.0, currentAmount: 6500.0, targetDate: new Date('2026-12-31') },
    { name: 'New M3 MacBook Pro', targetAmount: 3000.0, currentAmount: 2100.0, targetDate: new Date('2026-10-15') },
  ];

  for (const g of goals) {
    const exists = await prisma.savingsGoal.findFirst({ where: { userId: demoUser.id, name: g.name } });
    if (!exists) {
      await prisma.savingsGoal.create({
        data: { userId: demoUser.id, ...g },
      });
    }
  }

  console.log('✅ Vyora Database Seeded Successfully!');
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
