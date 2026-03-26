/* ═══════════════════════════════════════════════════════════════
   Fercayo · Autenticação Firebase
   Usado por: checklist.html, levantamento.html, consulta.html
   ═══════════════════════════════════════════════════════════════ */

let papelAtual       = null;
let utilizadorAtual  = null;

function _mostrarLoginOverlay() {
  document.getElementById('login-overlay').style.display = 'flex';
  document.getElementById('app-root').style.display      = 'none';
}

function _esconderLoginOverlay() {
  document.getElementById('login-overlay').style.display = 'none';
  document.getElementById('app-root').style.display      = 'flex';
}

async function _obterPapel(uid) {
  try {
    const firestoreDB = await abrirDB();
    const doc = await firestoreDB.collection('utilizadores').doc(uid).get();
    if (doc.exists) return doc.data().papel || 'preparador';
  } catch (e) {
    console.error('[Auth] Erro ao obter papel:', e);
  }
  return 'preparador';
}

/* Aplica classes CSS e badge. Devolve true se o acesso foi bloqueado. */
function _aplicarPermissoes(papel) {
  document.body.classList.remove('papel-diretor', 'papel-gestao', 'papel-medidor', 'papel-preparador');
  document.body.classList.add('papel-' + papel);

  const badge = document.getElementById('user-badge');
  if (badge) {
    const labels = { diretor: 'Diretor', gestao: 'Gestão', medidor: 'Medidor', preparador: 'Preparador' };
    badge.textContent  = labels[papel] || papel;
    badge.className    = 'user-badge papel-badge-' + papel;
  }

  const emailEl = document.getElementById('user-email');
  if (emailEl && utilizadorAtual) emailEl.textContent = utilizadorAtual.email;

  /* Preparador só tem acesso à Aba C · Consulta */
  if (papel === 'preparador') {
    const naConsulta = window.location.pathname.includes('consulta');
    if (!naConsulta) {
      window.location.href = 'consulta.html';
      return true;
    }
    return false; /* deixa passar em consulta.html */
  }
  return false;
}

async function fazerLogin() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-pass').value;
  const errEl    = document.getElementById('login-err');
  const btn      = document.getElementById('login-btn');

  if (!email || !password) { errEl.textContent = 'Preenche email e password.'; return; }

  btn.disabled    = true;
  btn.textContent = 'A entrar…';
  errEl.textContent = '';

  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
  } catch (err) {
    btn.disabled    = false;
    btn.textContent = 'Entrar';
    const msgs = {
      'auth/user-not-found':     'Utilizador não encontrado.',
      'auth/wrong-password':     'Password incorreta.',
      'auth/invalid-email':      'Email inválido.',
      'auth/too-many-requests':  'Demasiadas tentativas. Tenta mais tarde.',
      'auth/invalid-credential': 'Email ou password incorretos.',
    };
    errEl.textContent = msgs[err.code] || 'Erro ao entrar. Tenta novamente.';
  }
}

function fazerLogout() {
  firebase.auth().signOut();
}

function iniciarAuth(callbackAposLogin) {
  if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);

  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      utilizadorAtual = user;
      papelAtual      = await _obterPapel(user.uid);
      const bloqueado = _aplicarPermissoes(papelAtual);
      if (!bloqueado) {
        _esconderLoginOverlay();
        callbackAposLogin();
      }
    } else {
      utilizadorAtual = null;
      papelAtual      = null;
      document.body.classList.remove('papel-diretor', 'papel-gestao', 'papel-medidor', 'papel-preparador');
      _mostrarLoginOverlay();
      const btn = document.getElementById('login-btn');
      if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
    }
  });
}
