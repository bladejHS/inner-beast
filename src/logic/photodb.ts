// Progress photos live in IndexedDB (localStorage is far too small for pictures); the state only keeps id + date.

const DB = 'beast-photos';
const STORE = 'photos';

let dbp: Promise<IDBDatabase> | null = null;
function db(): Promise<IDBDatabase> {
  dbp ??= new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  return dbp;
}

function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return db().then(
    (d) =>
      new Promise<T>((res, rej) => {
        const req = fn(d.transaction(STORE, mode).objectStore(STORE));
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
      }),
  );
}

export const putPhoto = (id: string, blob: Blob): Promise<IDBValidKey> => run('readwrite', (s) => s.put(blob, id));
export const getPhoto = (id: string): Promise<Blob | undefined> => run('readonly', (s) => s.get(id) as IDBRequest<Blob | undefined>);
export const delPhoto = (id: string): Promise<undefined> => run('readwrite', (s) => s.delete(id));

/** Phone photos are huge: scale to 1280 px on the long edge, JPEG. ~150 KB each. */
export async function shrink(file: Blob, max = 1280): Promise<Blob> {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close();
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('toBlob'))), 'image/jpeg', 0.82));
}
