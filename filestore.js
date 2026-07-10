// filestore.js — IndexedDB storage for large files (pitch decks, PDFs)
// Images stay in localStorage as base64 (for card thumbnails)
// PDFs & large files go into IndexedDB (no practical size limit)
(function () {
  const DB_NAME = 'crm_filestore';
  const STORE   = 'files';
  let _db = null;

  function open() {
    if (_db) return Promise.resolve(_db);
    return new Promise((res, rej) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = e => e.target.result.createObjectStore(STORE);
      req.onsuccess  = e => { _db = e.target.result; res(_db); };
      req.onerror    = e => rej(e.target.error);
    });
  }

  function genKey() {
    return 'f_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  }

  async function save(key, arrayBuffer) {
    const db = await open();
    return new Promise((res, rej) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(arrayBuffer, key);
      tx.oncomplete = () => res();
      tx.onerror    = e => rej(e.target.error);
    });
  }

  async function get(key) {
    const db = await open();
    return new Promise((res, rej) => {
      const tx  = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = e => res(e.target.result);
      req.onerror   = e => rej(e.target.error);
    });
  }

  async function remove(keys) {
    if (!keys || !keys.length) return;
    const db = await open();
    return new Promise((res, rej) => {
      const tx = db.transaction(STORE, 'readwrite');
      keys.forEach(k => tx.objectStore(STORE).delete(k));
      tx.oncomplete = () => res();
      tx.onerror    = e => rej(e.target.error);
    });
  }

  // Returns a temporary object URL for opening in a new tab
  async function openUrl(meta) {
    const buf = await get(meta.key);
    if (!buf) return null;
    const blob = new Blob([buf], { type: meta.type || 'application/octet-stream' });
    return URL.createObjectURL(blob);
  }

  window.fileStore = { genKey, save, get, remove, openUrl };
  console.log('✓ fileStore (IndexedDB) ready');
})();
