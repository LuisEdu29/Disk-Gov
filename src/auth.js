// Firebase: login por e-mail/senha (opcional), contatos de emergência e avaliações.
// Os módulos do Firebase só são baixados quando necessário (o app abre rápido sem eles).
import { FIREBASE_CONFIG } from "./config.js";

export const isAuthConfigured =
  !!FIREBASE_CONFIG.apiKey && !FIREBASE_CONFIG.apiKey.startsWith("SUA_") &&
  !!FIREBASE_CONFIG.projectId && !FIREBASE_CONFIG.projectId.startsWith("SEU-");

let firebasePromise = null;
function getFirebase() {
  if (!isAuthConfigured) return Promise.reject(Object.assign(new Error("not-configured"), { code: "app/not-configured" }));
  if (!firebasePromise) {
    firebasePromise = (async () => {
      const [{ initializeApp }, authMod, fsMod] = await Promise.all([
        import("firebase/app"),
        import("firebase/auth"),
        import("firebase/firestore")
      ]);
      const app = initializeApp(FIREBASE_CONFIG);
      // Persistência explícita: funciona no navegador e na WebView do Android (Capacitor).
      const auth = authMod.initializeAuth(app, {
        persistence: [authMod.indexedDBLocalPersistence, authMod.browserLocalPersistence]
      });
      let db;
      try {
        // Cache local: contatos continuam disponíveis offline e sincronizam quando voltar a internet.
        db = fsMod.initializeFirestore(app, {
          localCache: fsMod.persistentLocalCache({ tabManager: fsMod.persistentMultipleTabManager() }),
          experimentalAutoDetectLongPolling: true
        });
      } catch {
        db = fsMod.initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
      }
      return { app, auth, db, authMod, fsMod };
    })().catch(err => { firebasePromise = null; throw err; });
  }
  return firebasePromise;
}

export const toProfile = (u) => u ? {
  uid: u.uid,
  name: u.displayName || (u.email ? u.email.split("@")[0] : "Usuário"),
  email: u.email || "",
  emailVerified: !!u.emailVerified
} : null;

// Mensagens de erro em português.
export function authErrorMessage(err) {
  console.error("[auth]", err?.code, err?.message);
  const code = err?.code || "";
  switch (code) {
    case "auth/invalid-email": return "Esse e-mail não parece válido.";
    case "auth/missing-password": return "Digite sua senha.";
    case "auth/weak-password": return "A senha precisa ter pelo menos 6 caracteres.";
    case "auth/email-already-in-use": return "Já existe uma conta com esse e-mail. Tente entrar.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-login-credentials": return "E-mail ou senha incorretos.";
    case "auth/user-disabled": return "Esta conta foi desativada.";
    case "auth/too-many-requests": return "Muitas tentativas. Aguarde um pouco e tente de novo.";
    case "auth/network-request-failed": return "Sem conexão com a internet.";
    case "auth/operation-not-allowed": return "O login por e-mail ainda não foi ativado no Firebase.";
    case "auth/api-key-not-valid":
    case "auth/invalid-api-key": return "A configuração do Firebase está inválida.";
    case "app/not-configured": return "O login ainda não foi configurado neste app.";
    case "auth/configuration-not-found": return "O Firebase Authentication ainda não foi iniciado no projeto (console → Authentication → Começar).";
    case "auth/internal-error": return "Erro interno do Firebase. Confira se o login por e-mail/senha está ativado e se a chave de API permite este site.";
    default:
      if (code.includes("requests-from-referer")) return "A chave de API do Firebase está bloqueando este site. Libere o domínio no Google Cloud Console.";
      return "Não foi possível concluir. Tente novamente." + (code ? ` (${code})` : "");
  }
}

/** Avisa sempre que a pessoa entrar/sair (inclusive ao reabrir o app já logada). */
export function watchAuth(onUser) {
  if (!isAuthConfigured) { onUser(null); return () => {}; }
  let cancelled = false;
  let unsubscribe = () => {};
  getFirebase()
    .then(({ auth, authMod }) => {
      if (cancelled) return;
      unsubscribe = authMod.onAuthStateChanged(auth, u => onUser(toProfile(u)), () => onUser(null));
    })
    .catch(() => onUser(null));
  return () => { cancelled = true; unsubscribe(); };
}

export async function signUp(name, email, password) {
  const { auth, authMod } = await getFirebase();
  const cred = await authMod.createUserWithEmailAndPassword(auth, email.trim(), password);
  const cleanName = name.trim();
  if (cleanName) {
    try { await authMod.updateProfile(cred.user, { displayName: cleanName }); } catch { /* segue sem nome */ }
  }
  // Confirmar o e-mail é necessário para enviar/receber localizações (evita alguém se passar por outra pessoa).
  try { auth.languageCode = "pt-BR"; await authMod.sendEmailVerification(cred.user); } catch { /* dá para reenviar depois */ }
  const profile = toProfile(auth.currentUser || cred.user);
  saveUserProfile(profile, true);
  return profile;
}

export async function signIn(email, password) {
  const { auth, authMod } = await getFirebase();
  const cred = await authMod.signInWithEmailAndPassword(auth, email.trim(), password);
  const profile = toProfile(cred.user);
  saveUserProfile(profile, false);
  return profile;
}

/**
 * Registra o login no Firestore (documento users/{uid}): nome, e-mail, data da conta e último acesso.
 * A SENHA nunca é salva aqui: ela fica protegida (com hash) no Firebase Authentication.
 * Não bloqueia o login: se falhar ou estiver sem internet, o Firestore tenta de novo sozinho.
 */
export function saveUserProfile(profile, isNewAccount) {
  if (!profile?.uid) return;
  getFirebase()
    .then(({ db, fsMod }) => {
      const data = { name: profile.name || "", email: profile.email || "", lastLoginAt: fsMod.serverTimestamp() };
      if (isNewAccount) data.createdAt = fsMod.serverTimestamp();
      return fsMod.setDoc(fsMod.doc(db, "users", profile.uid), data, { merge: true });
    })
    .catch(() => { /* o login segue normalmente */ });
}

export async function resetPassword(email) {
  const { auth, authMod } = await getFirebase();
  auth.languageCode = "pt-BR";
  await authMod.sendPasswordResetEmail(auth, email.trim());
}

export async function signOutUser() {
  const { auth, authMod } = await getFirebase();
  await authMod.signOut(auth);
}

// ── Contatos de emergência (documento users/{uid}) ───────────

/** Acompanha os contatos em tempo real. onData(lista | null, veioDoCache); null = ainda não existe documento. */
export function watchContacts(uid, onData, onError) {
  let cancelled = false;
  let unsubscribe = () => {};
  getFirebase()
    .then(({ db, fsMod }) => {
      if (cancelled) return;
      unsubscribe = fsMod.onSnapshot(
        fsMod.doc(db, "users", uid),
        snap => onData(snap.exists() && Array.isArray(snap.data().contacts) ? snap.data().contacts : null, snap.metadata.fromCache),
        err => onError && onError(err)
      );
    })
    .catch(err => onError && onError(err));
  return () => { cancelled = true; unsubscribe(); };
}

export async function saveContacts(uid, name, contacts) {
  const { db, fsMod } = await getFirebase();
  await fsMod.setDoc(
    fsMod.doc(db, "users", uid),
    { contacts, name: name || "", updatedAt: fsMod.serverTimestamp() },
    { merge: true }
  );
}

// ── Sugestões e avaliações (coleção feedback) ────────────────

/** Envia a avaliação. Retorna "sent" | "queued" (sem internet: será enviada quando voltar). */
export async function sendFeedback(entry) {
  const { db, fsMod } = await getFirebase();
  const write = fsMod.addDoc(fsMod.collection(db, "feedback"), {
    rating: entry.rating,
    type: entry.type,
    message: entry.message,
    email: entry.email,
    userId: entry.userId || null,
    app: entry.app,
    createdAt: fsMod.serverTimestamp()
  });
  // Sem internet o Firestore guarda a escrita e conclui depois; não deixamos a tela travada.
  const result = await Promise.race([
    write.then(() => "sent"),
    new Promise(resolve => setTimeout(() => resolve("queued"), 6000))
  ]);
  write.catch(() => {});
  return result;
}

// ── Confirmação de e-mail ────────────────────────────────────

export async function resendVerification() {
  const { auth, authMod } = await getFirebase();
  if (!auth.currentUser) throw new Error("no-user");
  auth.languageCode = "pt-BR";
  await authMod.sendEmailVerification(auth.currentUser);
}

/** Relê a conta e renova o token (necessário para o Firestore reconhecer o e-mail como confirmado). */
export async function refreshUser() {
  const { auth } = await getFirebase();
  if (!auth.currentUser) return null;
  await auth.currentUser.reload();
  await auth.currentUser.getIdToken(true);
  return toProfile(auth.currentUser);
}

// ── Localização compartilhada (coleção locations/{uid}) ──────

/** Publica a minha localização para os e-mails da lista. Retorna "sent" | "queued". */
export async function publishLocation(uid, name, email, lat, lon, notify) {
  const { db, fsMod } = await getFirebase();
  const write = fsMod.setDoc(fsMod.doc(db, "locations", uid), {
    name: name || "", email: email || "", lat, lon,
    notify: notify.map(e => e.trim().toLowerCase()).slice(0, 5),
    updatedAt: fsMod.serverTimestamp()
  });
  const result = await Promise.race([
    write.then(() => "sent"),
    new Promise(resolve => setTimeout(() => resolve("queued"), 8000))
  ]);
  write.catch(() => {});
  return result;
}

export async function stopSharingLocation(uid) {
  const { db, fsMod } = await getFirebase();
  await fsMod.deleteDoc(fsMod.doc(db, "locations", uid));
}

const toLocation = (d) => {
  const x = d.data();
  return { uid: d.id, name: x.name || "Contato", email: x.email || "", lat: x.lat, lon: x.lon, at: x.updatedAt?.toMillis ? x.updatedAt.toMillis() : Date.now() };
};

/** Localizações que outras pessoas compartilharam com o meu e-mail (precisa estar confirmado). */
export function watchSharedWithMe(email, onData, onError) {
  let cancelled = false;
  let unsubscribe = () => {};
  getFirebase()
    .then(({ db, fsMod }) => {
      if (cancelled) return;
      const q = fsMod.query(fsMod.collection(db, "locations"), fsMod.where("notify", "array-contains", email.trim().toLowerCase()));
      unsubscribe = fsMod.onSnapshot(
        q,
        snap => onData(snap.docs.map(toLocation).sort((a, b) => b.at - a.at)),
        err => onError && onError(err)
      );
    })
    .catch(err => onError && onError(err));
  return () => { cancelled = true; unsubscribe(); };
}

/** Acompanha se eu estou compartilhando a minha localização agora (documento locations/{uid}). */
export function watchMyShare(uid, onData) {
  let cancelled = false;
  let unsubscribe = () => {};
  getFirebase()
    .then(({ db, fsMod }) => {
      if (cancelled) return;
      unsubscribe = fsMod.onSnapshot(fsMod.doc(db, "locations", uid), snap => onData(snap.exists() ? toLocation(snap) : null), () => onData(null));
    })
    .catch(() => onData(null));
  return () => { cancelled = true; unsubscribe(); };
}
