/**
 * In-memory OTP store for password reset.
 * Keyed by lowercase email → { otp, expiresAt }
 * Works within a single Vercel serverless function instance.
 */

interface OTPRecord {
  otp: string;
  expiresAt: number; // Unix ms timestamp
  attempts: number;
}

// Module-level map – persists across requests within the same serverless instance
const otpMap = new Map<string, OTPRecord>();

export function storeOTP(email: string, otp: string, ttlMs = 10 * 60 * 1000) {
  otpMap.set(email.toLowerCase().trim(), {
    otp,
    expiresAt: Date.now() + ttlMs,
    attempts: 0,
  });
}

export function verifyOTP(email: string, otp: string): { valid: boolean; reason?: string } {
  const key = email.toLowerCase().trim();
  const record = otpMap.get(key);

  if (!record) {
    return { valid: false, reason: 'No OTP found for this email. Please request a new one.' };
  }

  if (Date.now() > record.expiresAt) {
    otpMap.delete(key);
    return { valid: false, reason: 'OTP has expired. Please request a new one.' };
  }

  record.attempts += 1;

  if (record.attempts > 5) {
    otpMap.delete(key);
    return { valid: false, reason: 'Too many failed attempts. Please request a new OTP.' };
  }

  if (record.otp !== otp.trim()) {
    return { valid: false, reason: `Invalid OTP code. ${5 - record.attempts} attempt(s) remaining.` };
  }

  // OTP is valid — consume it (one-time use)
  otpMap.delete(key);
  return { valid: true };
}

export function deleteOTP(email: string) {
  otpMap.delete(email.toLowerCase().trim());
}
