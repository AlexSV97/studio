import fs from 'fs/promises';
import path from 'path';

const MEMORY_FILE_PATH = path.join(process.cwd(), 'user-memory.json');

export interface UserMemory {
  preference: string | null;
  name: string | null;
}

export async function loadMemory(): Promise<UserMemory> {
  try {
    const data = await fs.readFile(MEMORY_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return { preference: null, name: null };
    }
    console.error(`Error loading user memory from ${MEMORY_FILE_PATH}:`, error);
    return { preference: null, name: null };
  }
}

export async function saveMemory(memory: UserMemory): Promise<void> {
  try {
    await fs.writeFile(MEMORY_FILE_PATH, JSON.stringify(memory, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error saving user memory to ${MEMORY_FILE_PATH}:`, error);
    throw new Error('Failed to save user memory.');
  }
}

export async function clearMemory(): Promise<void> {
  try {
    await fs.unlink(MEMORY_FILE_PATH);
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      console.error('Error clearing memory:', error);
    }
  }
}