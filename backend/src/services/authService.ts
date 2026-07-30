import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { ENV } from '../config/env';

export class AuthService {
  static async registerUser(data: { email: string; password: string; name: string; role?: string }) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await argon2.hash(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role || 'USER',
      },
    });

    await prisma.wallet.create({
      data: {
        userId: user.id,
        name: 'Main Bank Account',
        type: 'BANK_ACCOUNT',
        balance: 5000.0,
        isDefault: true,
        color: '#3B82F6',
      },
    });

    await prisma.wallet.create({
      data: {
        userId: user.id,
        name: 'Cash Wallet',
        type: 'CASH_WALLET',
        balance: 450.0,
        isDefault: false,
        color: '#10B981',
      },
    });

    const tokens = this.generateTokens(user.id, user.email, user.role);
    return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, ...tokens };
  }

  static async loginUser(email: string, password: string, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await argon2.verify(user.passwordHash, password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    await prisma.userSession.create({
      data: {
        userId: user.id,
        ipAddress: ipAddress || '127.0.0.1',
        userAgent: userAgent || 'Unknown',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const tokens = this.generateTokens(user.id, user.email, user.role);

    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        currency: user.currency,
        avatarUrl: user.avatarUrl,
      },
      ...tokens,
    };
  }

  static generateTokens(userId: string, email: string, role: string) {
    const accessToken = jwt.sign({ userId, email, role }, ENV.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId, email, role }, ENV.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }
}
