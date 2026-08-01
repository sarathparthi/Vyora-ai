/**
 * Persistent Cloud Store for Vyora SaaS
 * Syncs user accounts and financial data ledgers across devices (Laptop, Phone, Tablet)
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

// In-memory serverless cache (persists within warm serverless instances)
const memoryUsersCache = new Map<string, RegisteredUser>();
const memoryDataCache = new Map<string, UserAccountData>();

// Cloud KV Endpoint Key
const CLOUD_BUCKET = 'vyora_saas_v1_prod_store_2026';
const KV_BASE_URL = `https://kvdb.io/A2Y4mJ2eF4W5c9x2v8z1`; // Public KV Bucket

/**
 * Fetch all registered users from Cloud Store
 */
export async function getCloudRegisteredUsers(): Promise<RegisteredUser[]> {
  try {
    const res = await fetch(`${KV_BASE_URL}/users`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        data.forEach((u: RegisteredUser) => {
          if (u && u.email) {
            memoryUsersCache.set(u.email.toLowerCase().trim(), u);
          }
        });
        return data;
      }
    }
  } catch (err) {
    console.warn('[CloudStore] KV fetch users failed, using memory cache:', err);
  }
  return Array.from(memoryUsersCache.values());
}

/**
 * Save / Update a registered user in Cloud Store
 */
export async function saveCloudRegisteredUser(user: RegisteredUser): Promise<boolean> {
  const emailKey = user.email.toLowerCase().trim();
  memoryUsersCache.set(emailKey, user);

  try {
    const currentUsers = await getCloudRegisteredUsers();
    const updatedUsers = currentUsers.filter((u) => u.email.toLowerCase().trim() !== emailKey);
    updatedUsers.push(user);

    await fetch(`${KV_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUsers),
    });
    return true;
  } catch (err) {
    console.warn('[CloudStore] KV save user failed:', err);
    return false;
  }
}

/**
 * Find user by email in Cloud Store
 */
export async function findCloudUserByEmail(email: string): Promise<RegisteredUser | null> {
  const emailKey = email.toLowerCase().trim();
  if (memoryUsersCache.has(emailKey)) {
    return memoryUsersCache.get(emailKey)!;
  }

  const users = await getCloudRegisteredUsers();
  const matched = users.find((u) => u.email.toLowerCase().trim() === emailKey);
  if (matched) {
    memoryUsersCache.set(emailKey, matched);
    return matched;
  }
  return null;
}

/**
 * Fetch user financial ledger data from Cloud Store
 */
export async function getCloudUserData(email: string): Promise<UserAccountData> {
  const emailKey = email.toLowerCase().trim();
  if (!emailKey) {
    return { transactions: [], wallets: [], budgets: [], goals: [], monthlyBudgetCap: 0 };
  }

  try {
    const safeKey = `data_${emailKey.replace(/[^a-z0-9]/g, '_')}`;
    const res = await fetch(`${KV_BASE_URL}/${safeKey}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        memoryDataCache.set(emailKey, data);
        return data;
      }
    }
  } catch (err) {
    console.warn('[CloudStore] KV fetch user data failed:', err);
  }

  if (memoryDataCache.has(emailKey)) {
    return memoryDataCache.get(emailKey)!;
  }

  return { transactions: [], wallets: [], budgets: [], goals: [], monthlyBudgetCap: 0 };
}

/**
 * Save user financial ledger data to Cloud Store
 */
export async function saveCloudUserData(email: string, storeData: UserAccountData): Promise<boolean> {
  const emailKey = email.toLowerCase().trim();
  if (!emailKey) return false;

  memoryDataCache.set(emailKey, storeData);

  try {
    const safeKey = `data_${emailKey.replace(/[^a-z0-9]/g, '_')}`;
    await fetch(`${KV_BASE_URL}/${safeKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storeData),
    });
    return true;
  } catch (err) {
    console.warn('[CloudStore] KV save user data failed:', err);
    return false;
  }
}
