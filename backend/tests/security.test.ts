import { SecurityService } from '../src/services/securityService';

describe('Enterprise Security & Password Policy Tests', () => {
  it('should validate 12+ character password complexity policy', () => {
    // Valid password (12+ chars, Upper, Lower, Number, Special)
    const valid = SecurityService.validatePasswordPolicy('Vyora@2026!Secure');
    expect(valid.isValid).toBe(true);

    // Invalid: Too short (<12 chars)
    const short = SecurityService.validatePasswordPolicy('Vyora@2026!');
    expect(short.isValid).toBe(false);

    // Invalid: Missing uppercase
    const noUpper = SecurityService.validatePasswordPolicy('vyora@2026!secure');
    expect(noUpper.isValid).toBe(false);

    // Invalid: Missing number
    const noNumber = SecurityService.validatePasswordPolicy('Vyora@SecureKey');
    expect(noNumber.isValid).toBe(false);

    // Invalid: Missing special character
    const noSpecial = SecurityService.validatePasswordPolicy('Vyora2026Secure');
    expect(noSpecial.isValid).toBe(false);
  });

  it('should hash and verify passwords using Argon2id', async () => {
    const plaintext = 'Vyora@2026!SecureKey';
    const hash = await SecurityService.hashPassword(plaintext);

    expect(hash).toContain('$argon2id$');

    const isValid = await SecurityService.verifyPassword(hash, plaintext);
    expect(isValid).toBe(true);

    const isWrong = await SecurityService.verifyPassword(hash, 'WrongPassword123!');
    expect(isWrong).toBe(false);
  });

  it('should generate valid 6-digit OTP codes', () => {
    const otp = SecurityService.generateOTP();
    expect(otp).toHaveLength(6);
    expect(Number(otp)).toBeGreaterThanOrEqual(100000);
    expect(Number(otp)).toBeLessThanOrEqual(999999);
  });

  it('should evaluate account lockout state correctly', () => {
    const past = new Date(Date.now() - 5000);
    const future = new Date(Date.now() + 15 * 60 * 1000);

    expect(SecurityService.isAccountLocked(null)).toBe(false);
    expect(SecurityService.isAccountLocked(past)).toBe(false);
    expect(SecurityService.isAccountLocked(future)).toBe(true);
  });
});
