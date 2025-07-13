import { promises as fs } from 'fs';
import path from 'path';

interface UserData {
  userId: string;
  interests: string[];
  gmailConnected: boolean;
  calendarConnected: boolean;
  onboardingCompleted: boolean;
  onboardingStep: number;
  googleTokens?: {
    access_token?: string | null;
    refresh_token?: string | null;
    scope?: string | null;
    token_type?: string | null;
    expiry_date?: number | null;
  };
}

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function loadUsers(): Promise<Record<string, UserData>> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveUsers(users: Record<string, UserData>) {
  await ensureDataDir();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

export async function getUserData(userId: string): Promise<UserData | null> {
  console.log(`[Storage] Getting user data for: ${userId}`);
  const users = await loadUsers();
  const userData = users[userId] || null;
  console.log(`[Storage] User data found:`, userData);
  return userData;
}

export async function setUserData(userId: string, data: Partial<UserData>) {
  console.log(`[Storage] Setting user data for: ${userId}`, data);
  const users = await loadUsers();
  const defaults = {
    userId,
    interests: [],
    gmailConnected: false,
    calendarConnected: false,
    onboardingCompleted: false,
    onboardingStep: 0,
  };
  
  users[userId] = { 
    ...defaults,
    ...users[userId], 
    ...data 
  };
  await saveUsers(users);
  console.log(`[Storage] User data saved for: ${userId}`, users[userId]);
  return users[userId];
}

export async function updateUserData(userId: string, data: Partial<UserData>) {
  console.log(`[Storage] Updating user data for: ${userId}`, data);
  return await setUserData(userId, data);
} 