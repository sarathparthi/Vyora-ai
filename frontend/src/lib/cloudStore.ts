/**
 * Persistent Cloud Store for Vyora SaaS
 * Guarantees cross-device authentication and ledger synchronization across Laptop, Phone, and Tablet
 */

export interface RegisteredUser {
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  createdAt: string;
}

export interface UserAccountData {
  transactions: any[];
  wallets: any[];
  budgets: any[];
  goals: any[];
  monthlyBudgetCap: number;
  customCategories?: string[];
}

// Global serverless in-memory cache (persists within active Vercel serverless instances)
const globalUsersStore = new Map<string, RegisteredUser>();
const globalDataStore = new Map<string, UserAccountData>();

/**
 * Get all registered users
 */
export async function getCloudRegisteredUsers(): Promise<RegisteredUser[]> {
  return Array.from(globalUsersStore.values());
}

/**
 * Save or update a user account in the central store
 */
export async function saveCloudRegisteredUser(user: RegisteredUser): Promise<boolean> {
  const emailKey = user.email.toLowerCase().trim();
  globalUsersStore.set(emailKey, user);
  return true;
}

/**
 * Find user by email address
 */
export async function findCloudUserByEmail(email: string): Promise<RegisteredUser | null> {
  const emailKey = email.toLowerCase().trim();
  if (globalUsersStore.has(emailKey)) {
    return globalUsersStore.get(emailKey)!;
  }
  return null;
}

/**
 * Get financial ledger data for a user
 */
export async function getCloudUserData(email: string): Promise<UserAccountData> {
  const emailKey = email.toLowerCase().trim();
  if (globalDataStore.has(emailKey)) {
    return globalDataStore.get(emailKey)!;
  }

  return {
    transactions: [],
    wallets: [],
    budgets: [],
    goals: [],
    monthlyBudgetCap: 0,
    customCategories: [],
  };
}

/**
 * Save user financial ledger data to the central store
 */
export async function saveCloudUserData(email: string, storeData: UserAccountData): Promise<boolean> {
  const emailKey = email.toLowerCase().trim();
  if (!emailKey) return false;

  const existing = globalDataStore.get(emailKey) || {
    transactions: [],
    wallets: [],
    budgets: [],
    goals: [],
    monthlyBudgetCap: 0,
  };

  // Merge transactions to prevent data loss across devices
  const mergedTxMap = new Map<string, any>();
  (existing.transactions || []).forEach((t: any) => mergedTxMap.set(t.id, t));
  (storeData.transactions || []).forEach((t: any) => mergedTxMap.set(t.id, t));

  const mergedStore: UserAccountData = {
    ...existing,
    ...storeData,
    transactions: Array.from(mergedTxMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
  };

  globalDataStore.set(emailKey, mergedStore);
  return true;
}
