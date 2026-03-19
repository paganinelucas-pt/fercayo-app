/* ═══════════════════════════════════════════════════════════════
   Fercayo · Camada Firebase Firestore Partilhada
   Usado por: checklist.html, levantamento.html
   ═══════════════════════════════════════════════════════════════ */

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyAJtJFh7ZpMKZxzfouj3EUvcacfh5LT0Cs",
  authDomain:        "fercayo-app.firebaseapp.com",
  projectId:         "fercayo-app",
  storageBucket:     "fercayo-app.firebasestorage.app",
  messagingSenderId: "1049622307379",
  appId:             "1:1049622307379:web:56ec6544e4fea254dff946"
};

/** Inicializa o Firebase e devolve a instância Firestore (substitui abrirDB). */
function abrirDB() {
  if (!firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG);
  }
  return Promise.resolve(firebase.firestore());
}

/** Lê todos os documentos de uma coleção. */
function dbLerTudo(db, colecao) {
  return db.collection(colecao).get()
    .then(snap => snap.docs.map(d => d.data()));
}

/**
 * Escreve (set) um documento.
 * Se dados.id existir usa-o como ID do documento;
 * caso contrário gera um ID automático e guarda-o em dados.id.
 */
function dbEscrever(db, colecao, dados) {
  const id = (dados.id !== undefined && dados.id !== null)
    ? String(dados.id)
    : null;

  if (id) {
    return db.collection(colecao).doc(id).set(dados).then(() => id);
  } else {
    const ref = db.collection(colecao).doc();
    return ref.set({ ...dados, id: ref.id }).then(() => ref.id);
  }
}

/** Apaga um documento por ID. */
function dbApagar(db, colecao, id) {
  return db.collection(colecao).doc(String(id)).delete();
}

/** Lê documentos filtrados por campo = valor. */
function dbLerPorIndice(db, colecao, campo, valor) {
  return db.collection(colecao).where(campo, '==', valor).get()
    .then(snap => snap.docs.map(d => d.data()));
}

/* As funções abaixo mantêm compatibilidade com código existente. */
function dbPut(db, colecao, key, val) {
  return dbEscrever(db, colecao, key ? { ...val, id: key } : val);
}

function dbGet(db, colecao, key) {
  return db.collection(colecao).doc(String(key)).get()
    .then(d => d.exists ? d.data() : undefined);
}

function dbGetAll(db, colecao) {
  return dbLerTudo(db, colecao);
}

function dbClear(db, colecao) {
  return db.collection(colecao).get().then(snap => {
    const batch = db.batch();
    snap.docs.forEach(d => batch.delete(d.ref));
    return batch.commit();
  });
}
