import fs from 'fs';
import path from 'path';

export interface EmailLogEntry {
  id: string;
  timestamp: string;
  toEmail: string;
  subject: string;
  otp?: string;
  status: 'SUCCESS' | 'FAILED' | 'SIMULATED';
  smtpUser: string;
  error?: string;
  previewUrl?: string;
}

export class EmailLogger {
  private static logFilePath = path.join(process.cwd(), 'email_logs.json');
  private static inMemoryLogs: EmailLogEntry[] = [];

  static logEmail(entry: Omit<EmailLogEntry, 'id' | 'timestamp'>) {
    const log: EmailLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };

    this.inMemoryLogs.unshift(log);
    if (this.inMemoryLogs.length > 50) {
      this.inMemoryLogs = this.inMemoryLogs.slice(0, 50);
    }

    try {
      fs.writeFileSync(this.logFilePath, JSON.stringify(this.inMemoryLogs, null, 2), 'utf-8');
    } catch (e) {
      // Ignore file write errors on read-only environments
    }

    console.log(`[EMAIL DISPATCH ${log.status}] To: ${log.toEmail} | SMTP: ${log.smtpUser || 'None'} | OTP: ${log.otp || 'N/A'}${log.error ? ` | Error: ${log.error}` : ''}`);
  }

  static getLogs(): EmailLogEntry[] {
    if (this.inMemoryLogs.length > 0) return this.inMemoryLogs;

    try {
      if (fs.existsSync(this.logFilePath)) {
        const data = fs.readFileSync(this.logFilePath, 'utf-8');
        return JSON.parse(data || '[]');
      }
    } catch (e) {}

    return [];
  }
}
