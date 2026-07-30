import argon2 from 'argon2';
import crypto from 'crypto';
import { prisma } from '../config/db';

export class SecurityService {
  /**
   * Validates Password Complexity Policy:
   * - Minimum 12 characters
   * - At least 1 Uppercase letter (A-Z)
   * - At least 1 Lowercase letter (a-z)
   * - At least 1 Number (0-9)
   * - At least 1 Special Character (@$!%*?&!#^()-_=+)
   */
  static validatePasswordPolicy(password: string): { isValid: boolean; message?: string } {
    if (!password || password.length < 12) {
      return { isValid: false, message: 'Password must be at least 12 characters long.' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter (A-Z).' };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter (a-z).' };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number (0-9).' };
    }
    if (!/[@$!%*?&!#^()\-=_+]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one special character (@$!%*?&).' };
    }
    return { isValid: true };
  }

  /**
   * Hashes password using Argon2id
   */
  static async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }

  /**
   * Verifies plaintext password against Argon2id hash
   */
  static async verifyPassword(hash: string, plaintext: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plaintext);
    } catch (e) {
      return false;
    }
  }

  /**
   * Generates cryptographically secure 6-Digit OTP code
   */
  static generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Hashes OTP code for secure storage
   */
  static async hashOTP(otp: string): Promise<string> {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  /**
   * Verifies OTP code against stored SHA-256 hash
   */
  static verifyOTPHash(otp: string, storedHash: string): boolean {
    const computedHash = crypto.createHash('sha256').update(otp).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(storedHash));
  }

  /**
   * Checks if a new password was used in the previous 5 passwords for this user
   */
  static async isPasswordReused(userId: string, newPassword: string): Promise<boolean> {
    const history = await prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    for (const record of history) {
      const match = await this.verifyPassword(record.passwordHash, newPassword);
      if (match) return true;
    }

    return false;
  }

  /**
   * Records password in user's history and trims history beyond the last 5
   */
  static async recordPasswordHistory(userId: string, passwordHash: string): Promise<void> {
    await prisma.passwordHistory.create({
      data: { userId, passwordHash },
    });

    // Clean up older records beyond 5
    const history = await prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (history.length > 5) {
      const toDelete = history.slice(5).map((h) => h.id);
      await prisma.passwordHistory.deleteMany({
        where: { id: { in: toDelete } },
      });
    }
  }

  /**
   * Checks if user account is currently locked out
   */
  static isAccountLocked(lockedUntil: Date | null): boolean {
    if (!lockedUntil) return false;
    return new Date() < new Date(lockedUntil);
  }
}
