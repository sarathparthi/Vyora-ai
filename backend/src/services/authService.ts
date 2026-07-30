import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { prisma } from '../config/db';
import { ENV } from '../config/env';
import { SecurityService } from './securityService';
import { EmailService } from './emailService';

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
  rememberMe?: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export class AuthService {
  private static saveDevAccount(account: { name: string; email: string; password: string }) {
    try {
      const filePath = path.join(process.cwd(), 'dev_accounts.json');
      let accounts: any[] = [];

      if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, 'utf-8');
        accounts = JSON.parse(fileData || '[]');
      }

      accounts = accounts.filter((a) => a.email !== account.email);

      accounts.push({
        name: account.name,
        email: account.email,
        password: account.password,
        registeredAt: new Date().toISOString(),
      });

      fs.writeFileSync(filePath, JSON.stringify(accounts, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Dev account logging skipped:', err);
    }
  }

  static async registerUser(dto: RegisterDTO) {
    const emailLower = dto.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email: emailLower } });
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const policyCheck = SecurityService.validatePasswordPolicy(dto.password);
    if (!policyCheck.isValid) {
      throw new Error(policyCheck.message);
    }

    const passwordHash = await SecurityService.hashPassword(dto.password);

    const user = await prisma.user.create({
      data: {
        email: emailLower,
        passwordHash,
        name: dto.name,
        isVerified: false,
      },
    });

    this.saveDevAccount({ name: dto.name, email: emailLower, password: dto.password });
    await SecurityService.recordPasswordHistory(user.id, passwordHash);

    // Generate 6-Digit Verification OTP Code
    const otp = SecurityService.generateOTP();
    const otpHash = await SecurityService.hashOTP(otp);

    await prisma.emailOTP.create({
      data: {
        email: emailLower,
        otpHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // Send Real Email with 6-digit OTP code
    await EmailService.sendVerificationEmail(emailLower, dto.name, otp);

    await prisma.securityAuditLog.create({
      data: {
        userId: user.id,
        event: 'USER_REGISTERED',
        details: `User registered: ${emailLower}. Verification OTP sent via email.`,
        ipAddress: '127.0.0.1',
        userAgent: 'Registration Form',
      },
    });

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      message: 'Registration successful! Verification OTP code sent directly to your email address.',
    };
  }

  static async verifyEmailOTP(email: string, otp: string) {
    const emailLower = email.toLowerCase().trim();
    const record = await prisma.emailOTP.findFirst({
      where: { email: emailLower },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new Error('Invalid or expired verification code.');
    }

    if (new Date() > record.expiresAt) {
      throw new Error('Verification code has expired. Please request a new code.');
    }

    if (record.attempts >= 5) {
      throw new Error('Maximum verification attempts exceeded. Please request a new code.');
    }

    const isValid = SecurityService.verifyOTPHash(otp, record.otpHash);
    if (!isValid) {
      await prisma.emailOTP.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      throw new Error('Invalid verification code.');
    }

    const user = await prisma.user.update({
      where: { email: emailLower },
      data: { isVerified: true },
    });

    await prisma.emailOTP.deleteMany({ where: { email: emailLower } });

    await prisma.securityAuditLog.create({
      data: {
        userId: user.id,
        event: 'OTP_VERIFIED',
        details: 'Email verification completed successfully.',
        ipAddress: '127.0.0.1',
        userAgent: 'Verification Form',
      },
    });

    return { success: true, message: 'Email address verified successfully!' };
  }

  static async loginUser(dto: LoginDTO) {
    const emailLower = dto.email.toLowerCase().trim();
    const genericError = 'Invalid email or password.';

    const user = await prisma.user.findUnique({ where: { email: emailLower } });
    if (!user) {
      throw new Error(genericError);
    }

    this.saveDevAccount({ name: user.name, email: emailLower, password: dto.password });

    if (SecurityService.isAccountLocked(user.lockedUntil)) {
      const remainingMins = Math.ceil((new Date(user.lockedUntil!).getTime() - Date.now()) / 60000);
      throw new Error(`Too many failed login attempts. Your account has been temporarily locked. Try again in ${remainingMins} minutes.`);
    }

    const isMatch = await SecurityService.verifyPassword(user.passwordHash, dto.password);
    if (!isMatch) {
      const attempts = user.failedLoginAttempts + 1;
      let updateData: any = { failedLoginAttempts: attempts };

      if (attempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        await prisma.securityAuditLog.create({
          data: {
            userId: user.id,
            event: 'ACCOUNT_LOCKED',
            details: `Account locked for 15 minutes after 5 consecutive failed login attempts.`,
            ipAddress: dto.ipAddress || '127.0.0.1',
            userAgent: dto.userAgent || 'Unknown',
          },
        });
      } else {
        await prisma.securityAuditLog.create({
          data: {
            userId: user.id,
            event: 'FAILED_LOGIN',
            details: `Failed login attempt ${attempts}/5.`,
            ipAddress: dto.ipAddress || '127.0.0.1',
            userAgent: dto.userAgent || 'Unknown',
          },
        });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      if (attempts >= 5) {
        throw new Error('Too many failed login attempts. Your account has been temporarily locked.');
      }

      throw new Error(genericError);
    }

    if (!user.isVerified) {
      throw new Error('Please verify your email address before signing in.');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });

    const sessionDurationDays = dto.rememberMe ? 30 : 1;
    const expiresAt = new Date(Date.now() + sessionDurationDays * 24 * 60 * 60 * 1000);

    const session = await prisma.deviceSession.create({
      data: {
        userId: user.id,
        device: this.parseDeviceType(dto.userAgent),
        browser: this.parseBrowser(dto.userAgent),
        os: this.parseOS(dto.userAgent),
        ipAddress: dto.ipAddress || '127.0.0.1',
        isCurrent: true,
        expiresAt,
      },
    });

    const tokens = this.generateTokens(user.id, user.email, user.role, session.id);

    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.securityAuditLog.create({
      data: {
        userId: user.id,
        event: 'LOGIN_SUCCESS',
        details: `Successful login from ${session.device} (${session.browser} / ${session.os}).`,
        ipAddress: dto.ipAddress || '127.0.0.1',
        userAgent: dto.userAgent || 'Unknown',
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        currency: user.currency,
      },
      tokens,
      session,
    };
  }

  static async requestPasswordReset(email: string) {
    const emailLower = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: emailLower } });

    if (!user) {
      return { message: 'If an account exists for this email, a password reset OTP code has been sent to your inbox.' };
    }

    const otp = SecurityService.generateOTP();
    const otpHash = await SecurityService.hashOTP(otp);

    await prisma.passwordResetOTP.create({
      data: {
        email: emailLower,
        otpHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // Send Real Email with Password Reset OTP
    await EmailService.sendPasswordResetEmail(emailLower, user.name, otp);

    await prisma.securityAuditLog.create({
      data: {
        userId: user.id,
        event: 'PASSWORD_RESET_REQUESTED',
        details: `Password reset OTP sent to email.`,
        ipAddress: '127.0.0.1',
        userAgent: 'Forgot Password Form',
      },
    });

    return {
      message: 'If an account exists for this email, a password reset OTP code has been sent to your inbox.',
    };
  }

  static async resetPassword(email: string, otp: string, newPassword: string) {
    const emailLower = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: emailLower } });
    if (!user) throw new Error('Invalid request or expired OTP.');

    const record = await prisma.passwordResetOTP.findFirst({
      where: { email: emailLower },
      orderBy: { createdAt: 'desc' },
    });

    if (!record || new Date() > record.expiresAt) {
      throw new Error('Invalid or expired password reset OTP.');
    }

    const isValidOTP = SecurityService.verifyOTPHash(otp, record.otpHash);
    if (!isValidOTP) {
      throw new Error('Invalid password reset OTP.');
    }

    const policyCheck = SecurityService.validatePasswordPolicy(newPassword);
    if (!policyCheck.isValid) {
      throw new Error(policyCheck.message);
    }

    const isReused = await SecurityService.isPasswordReused(user.id, newPassword);
    if (isReused) {
      throw new Error('You cannot reuse any of your previous 5 passwords. Please choose a new password.');
    }

    const passwordHash = await SecurityService.hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
    });

    this.saveDevAccount({ name: user.name, email: emailLower, password: newPassword });
    await SecurityService.recordPasswordHistory(user.id, passwordHash);

    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    await prisma.deviceSession.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetOTP.deleteMany({ where: { email: emailLower } });

    await prisma.securityAuditLog.create({
      data: {
        userId: user.id,
        event: 'PASSWORD_RESET_SUCCESS',
        details: 'Password reset completed. All active sessions invalidated.',
        ipAddress: '127.0.0.1',
        userAgent: 'Reset Password Form',
      },
    });

    return { success: true, message: 'Password reset successfully! Please sign in with your new password.' };
  }

  static async getActiveSessions(userId: string) {
    return await prisma.deviceSession.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async revokeSession(userId: string, sessionId: string) {
    await prisma.deviceSession.deleteMany({ where: { id: sessionId, userId } });
    await prisma.securityAuditLog.create({
      data: {
        userId,
        event: 'SESSION_REVOKED',
        details: `Device session ${sessionId} revoked.`,
        ipAddress: '127.0.0.1',
        userAgent: 'Security Settings',
      },
    });
    return { success: true };
  }

  static generateTokens(userId: string, email: string, role: string, sessionId: string) {
    const accessToken = jwt.sign({ userId, email, role, sessionId }, ENV.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId, email, role, sessionId }, ENV.JWT_REFRESH_SECRET, { expiresIn: '30d' });
    return { accessToken, refreshToken };
  }

  private static parseDeviceType(ua?: string): string {
    if (!ua) return 'Desktop';
    if (/mobile/i.test(ua)) return 'Mobile';
    if (/tablet|ipad/i.test(ua)) return 'Tablet';
    return 'Desktop';
  }

  private static parseBrowser(ua?: string): string {
    if (!ua) return 'Chrome';
    if (/chrome/i.test(ua)) return 'Chrome';
    if (/safari/i.test(ua)) return 'Safari';
    if (/firefox/i.test(ua)) return 'Firefox';
    if (/edge/i.test(ua)) return 'Edge';
    return 'Browser';
  }

  private static parseOS(ua?: string): string {
    if (!ua) return 'Windows';
    if (/windows/i.test(ua)) return 'Windows';
    if (/mac/i.test(ua)) return 'macOS';
    if (/android/i.test(ua)) return 'Android';
    if (/iphone|ipad/i.test(ua)) return 'iOS';
    if (/linux/i.test(ua)) return 'Linux';
    return 'OS';
  }
}
