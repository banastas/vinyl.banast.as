import type { Vinyl } from '../types/Vinyl';

const STORAGE_KEY = 'vinyl_collection';
const STORAGE_VERSION = '1.0';

interface StorageData {
  version: string;
  lastSynced: string;
  vinyls: Vinyl[];
}

/**
 * Save vinyls to localStorage
 */
export function saveVinylsToStorage(vinyls: Vinyl[]): void {
  try {
    const data: StorageData = {
      version: STORAGE_VERSION,
      lastSynced: new Date().toISOString(),
      vinyls,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log(`✓ Saved ${vinyls.length} records to localStorage`);
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

/**
 * Load vinyls from localStorage
 */
export function loadVinylsFromStorage(): Vinyl[] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      console.log('No stored collection found in localStorage');
      return null;
    }

    const data: StorageData = JSON.parse(stored);

    // Version check
    if (data.version !== STORAGE_VERSION) {
      console.warn('Storage version mismatch, clearing old data');
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    console.log(`✓ Loaded ${data.vinyls.length} records from localStorage (last synced: ${new Date(data.lastSynced).toLocaleString()})`);
    return data.vinyls;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

/**
 * Download vinyls as JSON file
 */
export function downloadVinylsAsJSON(vinyls: Vinyl[], filename = 'vinyl-collection.json'): void {
  try {
    const dataStr = JSON.stringify(vinyls, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
    console.log(`✓ Downloaded ${vinyls.length} records as ${filename}`);
  } catch (error) {
    console.error('Failed to download JSON:', error);
  }
}

/**
 * Clear stored collection
 */
export function clearStoredCollection(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('✓ Cleared stored collection');
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}

/**
 * Get storage info
 */
export function getStorageInfo(): { hasData: boolean; count: number; lastSynced: string | null } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { hasData: false, count: 0, lastSynced: null };
    }

    const data: StorageData = JSON.parse(stored);
    return {
      hasData: true,
      count: data.vinyls.length,
      lastSynced: data.lastSynced,
    };
  } catch (error) {
    return { hasData: false, count: 0, lastSynced: null };
  }
}
