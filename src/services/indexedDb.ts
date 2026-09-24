/**
 * IndexedDB helper for VYBE Studio
 * Safely persists customer artwork Blobs/DataURLs without blowing LocalStorage quotas
 */

const DB_NAME = 'vybe_studio_db';
const DB_VERSION = 1;
const STORE_ARTWORKS = 'artworks';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB não suportado neste navegador'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_ARTWORKS)) {
        db.createObjectStore(STORE_ARTWORKS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export interface StoredArtworkRecord {
  id: string; // customId
  fileName: string;
  fileType: string;
  fileSize: number;
  dataUrl: string;
  createdAt: number;
}

export async function saveArtworkToIndexedDB(record: StoredArtworkRecord): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_ARTWORKS, 'readwrite');
      const store = transaction.objectStore(STORE_ARTWORKS);
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('Erro ao salvar artwork no IndexedDB:', error);
  }
}

export async function getArtworkFromIndexedDB(id: string): Promise<StoredArtworkRecord | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_ARTWORKS, 'readonly');
      const store = transaction.objectStore(STORE_ARTWORKS);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('Erro ao carregar artwork do IndexedDB:', error);
    return null;
  }
}

export async function deleteArtworkFromIndexedDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_ARTWORKS, 'readwrite');
      const store = transaction.objectStore(STORE_ARTWORKS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('Erro ao excluir artwork do IndexedDB:', error);
  }
}
