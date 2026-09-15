// IndexedDB management for local music library, stats, and playlists

const DB_NAME = 'MyWrappedDB';
const DB_VERSION = 1;

const STORES = {
  SONGS: 'songs',
  PLAYLISTS: 'playlists',
  LISTENING_SESSIONS: 'listeningSessions',
  DAILY_STATS: 'dailyStats',
  BADGES: 'badges',
  SETTINGS: 'settings',
};

let db: IDBDatabase | null = null;

export async function initializeDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Songs store
      if (!database.objectStoreNames.contains(STORES.SONGS)) {
        const songStore = database.createObjectStore(STORES.SONGS, { keyPath: 'id' });
        songStore.createIndex('artist', 'artist', { unique: false });
        songStore.createIndex('album', 'album', { unique: false });
        songStore.createIndex('dateAdded', 'dateAdded', { unique: false });
        songStore.createIndex('lastPlayed', 'lastPlayed', { unique: false });
        songStore.createIndex('isFavorite', 'isFavorite', { unique: false });
      }

      // Playlists store
      if (!database.objectStoreNames.contains(STORES.PLAYLISTS)) {
        database.createObjectStore(STORES.PLAYLISTS, { keyPath: 'id' });
      }

      // Listening sessions
      if (!database.objectStoreNames.contains(STORES.LISTENING_SESSIONS)) {
        const sessionStore = database.createObjectStore(STORES.LISTENING_SESSIONS, { keyPath: 'id' });
        sessionStore.createIndex('songId', 'songId', { unique: false });
        sessionStore.createIndex('date', 'date', { unique: false });
        sessionStore.createIndex('counted', 'counted', { unique: false });
      }

      // Daily stats
      if (!database.objectStoreNames.contains(STORES.DAILY_STATS)) {
        database.createObjectStore(STORES.DAILY_STATS, { keyPath: 'date' });
      }

      // Badges
      if (!database.objectStoreNames.contains(STORES.BADGES)) {
        database.createObjectStore(STORES.BADGES, { keyPath: 'id' });
      }

      // Settings
      if (!database.objectStoreNames.contains(STORES.SETTINGS)) {
        database.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
    };
  });
}

export async function getFromDB<T>(storeName: string, key: string): Promise<T | undefined> {
  const database = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function getAllFromDB<T>(storeName: string): Promise<T[]> {
  const database = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function saveToDB<T extends { id?: string; key?: string }>(storeName: string, data: T): Promise<void> {
  const database = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function deleteFromDB(storeName: string, key: string): Promise<void> {
  const database = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function clearStore(storeName: string): Promise<void> {
  const database = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export const DB_STORES = STORES;
