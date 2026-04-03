export interface ListeningHighlight {
  id?: number;
  contentId: string;
  title: string;
  thumbnail: string;
  author?: string;
  timestamp: number;
  note: string;
  color: string;
  createdAt: number;
}

const DB_NAME = "audioflix-db";
const DB_VERSION = 1;
const STORE_NAME = "highlights";
const FALLBACK_KEY = "audioflix-highlights-fallback";

const openHighlightsDb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        store.createIndex("contentId", "contentId", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
  });

const readFallback = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(FALLBACK_KEY) ?? "[]") as ListeningHighlight[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeFallback = (items: ListeningHighlight[]) => {
  localStorage.setItem(FALLBACK_KEY, JSON.stringify(items));
};

export const addListeningHighlight = async (entry: Omit<ListeningHighlight, "id">) => {
  try {
    const db = await openHighlightsDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).add(entry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("Failed to save highlight"));
    });
    db.close();
  } catch {
    const existing = readFallback();
    const id = existing.length > 0 ? (existing[existing.length - 1].id ?? 0) + 1 : 1;
    writeFallback([...existing, { ...entry, id }]);
  }
};

export const getHighlightsByContent = async (contentId: string) => {
  try {
    const db = await openHighlightsDb();
    const result = await new Promise<ListeningHighlight[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const index = tx.objectStore(STORE_NAME).index("contentId");
      const req = index.getAll(contentId);
      req.onsuccess = () => resolve((req.result as ListeningHighlight[]) ?? []);
      req.onerror = () => reject(req.error ?? new Error("Failed to read highlights"));
    });
    db.close();
    return result.sort((a, b) => a.timestamp - b.timestamp);
  } catch {
    return readFallback()
      .filter((item) => item.contentId === contentId)
      .sort((a, b) => a.timestamp - b.timestamp);
  }
};

export const getAllHighlights = async () => {
  try {
    const db = await openHighlightsDb();
    const result = await new Promise<ListeningHighlight[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve((req.result as ListeningHighlight[]) ?? []);
      req.onerror = () => reject(req.error ?? new Error("Failed to read all highlights"));
    });
    db.close();
    return result.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return readFallback().sort((a, b) => b.createdAt - a.createdAt);
  }
};
