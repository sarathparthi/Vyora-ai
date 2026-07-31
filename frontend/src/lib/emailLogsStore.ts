export interface EmailLog {
  id: string;
  timestamp: string;
  toEmail: string;
  otp: string;
  status: 'SUCCESS' | 'FAILED' | 'SIMULATED';
  smtpUser: string;
  error?: string;
}

export const logsStore: EmailLog[] = [];

export function addEmailLog(log: Omit<EmailLog, 'id' | 'timestamp'>) {
  logsStore.unshift({
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...log,
  });

  if (logsStore.length > 50) {
    logsStore.splice(50);
  }
}
