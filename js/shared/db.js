/* ═══════════════════════════════════════════════════════════════
   Fercayo · Camada IndexedDB Partilhada
   Usado por: checklist.html, levantamento.html
   ═══════════════════════════════════════════════════════════════ */

/**
 * Abre (ou cria) uma base de dados IndexedDB.
 * @param {string} nome    - Nome da base de dados
 * @param {number} versao  - Versão do schema
 * @param {function} onUpgrade - Callback para onupgradeneeded(db)
 * @returns {Promise<IDBDatabase>}
 */
function abrirDB(nome, versao, onUpgrade) {
  return new Promise((resolve, reject) => {
    const pedido = indexedDB.open(nome, versao);
    pedido.onupgradeneeded = (evento) => {
      onUpgrade(evento.target.result);
    };
    pedido.onsuccess = (e) => resolve(e.target.result);
    pedido.onerror   = ()  => reject(pedido.error);
  });
}

/** Lê todos os registos de uma tabela. */
function dbLerTudo(db, tabela) {
  return new Promise((resolve, reject) => {
    const req = db.transaction(tabela, 'readonly').objectStore(tabela).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

/** Escreve (put) um registo numa tabela. */
function dbEscrever(db, tabela, dados) {
  return new Promise((resolve, reject) => {
    const req = db.transaction(tabela, 'readwrite').objectStore(tabela).put(dados);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

/** Apaga um registo por ID. */
function dbApagar(db, tabela, id) {
  return new Promise((resolve, reject) => {
    const req = db.transaction(tabela, 'readwrite').objectStore(tabela).delete(id);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

/** Lê registos por índice. */
function dbLerPorIndice(db, tabela, indice, valor) {
  return new Promise((resolve, reject) => {
    const req = db.transaction(tabela, 'readonly')
      .objectStore(tabela).index(indice).getAll(valor);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

/** Put genérico (para stores com ou sem keyPath). */
function dbPut(db, store, key, val) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const s  = tx.objectStore(store);
    const r  = (key === null) ? s.put(val) : s.put(val, key);
    r.onsuccess = () => resolve();
    r.onerror   = (e) => reject(e);
  });
}

/** Get genérico por chave. */
function dbGet(db, store, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const r  = tx.objectStore(store).get(key);
    r.onsuccess = (e) => resolve(e.target.result);
    r.onerror   = (e) => reject(e);
  });
}

/** Lê todos os registos de uma store. */
function dbGetAll(db, store) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const r  = tx.objectStore(store).getAll();
    r.onsuccess = (e) => resolve(e.target.result);
    r.onerror   = (e) => reject(e);
  });
}

/** Limpa todos os registos de uma store. */
function dbClear(db, store) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const r  = tx.objectStore(store).clear();
    r.onsuccess = () => resolve();
    r.onerror   = (e) => reject(e);
  });
}
