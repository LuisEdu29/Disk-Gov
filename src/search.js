// Busca tolerante a erros de digitação e de escrita "como se fala".
// Ex.: "puliça", "polisia", "pulícia" -> Polícia | "bonbeiro" -> Bombeiros

// Palavras que não ajudam a identificar um serviço.
const STOPWORDS = new Set([
  "a", "o", "as", "os", "um", "uma", "de", "da", "do", "das", "dos", "em", "na", "no", "nas", "nos",
  "para", "pra", "por", "com", "sem", "e", "ou", "que", "me", "meu", "minha", "eu", "tem", "ter",
  "quero", "preciso", "precisa", "chamar", "ligar", "falar", "buscar", "procurar", "procure", "ajuda",
  "numero", "telefone de", "servico", "como", "onde", "qual", "favor", "por favor"
]);

// Remove acentos e deixa tudo em minúsculas.
export function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// "Chave fonética" simplificada do português: palavras que SOAM parecido
// ficam com a mesma chave (ç/ss/c/s/z, ch/x, o/u, e/i, h mudo, letras dobradas...).
export function phoneticKey(word) {
  let w = String(word || "").toLowerCase().replace(/ç/g, "s");
  w = normalizeText(w);
  w = w
    .replace(/[^a-z0-9]/g, "")
    .replace(/^h/, "")
    .replace(/ph/g, "f")
    .replace(/sh|ch/g, "x")
    .replace(/qu([ei])/g, "k$1")
    .replace(/qu/g, "ku")
    .replace(/gu([ei])/g, "g$1")
    .replace(/sc([ei])/g, "s$1")
    .replace(/c([ei])/g, "s$1")
    .replace(/c/g, "k")
    .replace(/z/g, "s")
    .replace(/y/g, "i")
    .replace(/w/g, "u")
    .replace(/h/g, "")
    .replace(/u/g, "o") // "puliça" ~ "polícia"
    .replace(/i/g, "e") // "bonbeiro" ~ "bombeiro"
    .replace(/(.)\1+/g, "$1"); // letras dobradas
  return w;
}

// Distância de edição (Damerau-Levenshtein, versão "optimal string alignment"):
// conta troca, falta, sobra e letras trocadas de lugar ("polciia").
export function editDistance(a, b) {
  if (a === b) return 0;
  const la = a.length;
  const lb = b.length;
  if (!la) return lb;
  if (!lb) return la;
  const d = Array.from({ length: la + 1 }, () => new Array(lb + 1).fill(0));
  for (let i = 0; i <= la; i++) d[i][0] = i;
  for (let j = 0; j <= lb; j++) d[0][j] = j;
  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[la][lb];
}

// Quantos erros toleramos, conforme o tamanho da palavra digitada.
function tolerance(len) {
  if (len <= 3) return 0;
  if (len <= 6) return 1;
  return 2;
}

// Divide o texto em palavras mantendo a grafia original (o "ç" importa para o som).
function splitTokens(text) {
  return String(text || "")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .map(original => ({ original, plain: normalizeText(original), key: phoneticKey(original) }));
}

// Cache: lista de palavras (com chave fonética) de cada serviço.
const wordCache = new WeakMap();
function getServiceWords(service) {
  if (wordCache.has(service)) return wordCache.get(service);
  const raw = [
    service.title,
    service.subtitle,
    service.number,
    ...(service.keywords || []),
    ...(service.aliases || [])
  ].join(" ");
  const seen = new Set();
  const words = [];
  // Mantém a grafia original (com acento) para mostrar em "Você quis dizer".
  String(raw).split(/[^\p{L}\p{N}]+/u).filter(Boolean).forEach(original => {
    const plain = normalizeText(original);
    if (plain.length < 2 || seen.has(plain)) return;
    seen.add(plain);
    words.push({ original, plain, key: phoneticKey(original) });
  });
  const result = { words, haystack: normalizeText(raw) };
  wordCache.set(service, result);
  return result;
}

// Compara uma palavra digitada com uma palavra do serviço.
// Retorna a "força" do acerto (0 = não bateu).
function scoreWord(token, entry) {
  const plain = token.plain;
  if (plain === entry.plain) return 4; // igual
  if (plain.length >= 3 && entry.plain.startsWith(plain)) return 3; // ainda digitando
  if (plain.length < 4) return 0; // palavras curtas só valem se forem exatas

  const qKey = token.key;
  const wKey = entry.key;
  if (!qKey || !wKey) return 0;
  const tol = tolerance(qKey.length);
  if (tol === 0) return qKey === wKey ? 2 : 0;
  if (qKey === wKey) return 2; // soa igual (ex.: "polisia" = "polícia")

  // Erros quase nunca acontecem na 1ª letra: exigimos a mesma para evitar falsos positivos.
  if (qKey[0] !== wKey[0]) return 0;
  if (editDistance(qKey, wKey) <= tol) return 1;
  // Digitação incompleta com erro: compara com o começo da palavra do serviço.
  if (qKey.length >= 4 && wKey.length > qKey.length) {
    if (editDistance(qKey, wKey.slice(0, qKey.length)) <= 1) return 1;
  }
  return 0;
}

/**
 * Busca serviços tolerando erros de digitação.
 * @returns {{ items: Array, corrected: boolean, suggestions: string[] }}
 *  - items: serviços encontrados, do mais relevante para o menos
 *  - corrected: true quando só achamos por semelhança (usuário errou a grafia)
 *  - suggestions: palavras "certas" que entendemos (ex.: ["Polícia"])
 */
export function searchServices(services, query) {
  const full = normalizeText(query).trim();
  if (!full) return { items: services, corrected: false, suggestions: [] };

  // 1) Busca exata (comportamento original): o texto inteiro aparece no serviço.
  const exact = services.filter(s => getServiceWords(s).haystack.includes(full));

  // 2) Busca por palavras, com tolerância a erros.
  const tokens = splitTokens(query).filter(t => !STOPWORDS.has(t.plain));

  // Se o texto bateu exatamente, usamos só isso (sem ruído de aproximações).
  if (exact.length) return { items: exact, corrected: false, suggestions: [] };

  const fuzzy = [];
  if (tokens.length) {
    services.forEach(service => {
      const { words } = getServiceWords(service);
      let total = 0;
      let matchedTokens = 0;
      const guesses = [];
      tokens.forEach(token => {
        let best = 0;
        let bestWord = null;
        words.forEach(entry => {
          const sc = scoreWord(token, entry);
          if (sc > best) { best = sc; bestWord = entry; }
        });
        if (best > 0) {
          total += best;
          matchedTokens += 1;
          if (best <= 2 && bestWord && bestWord.plain !== token.plain) guesses.push(bestWord.original);
        }
      });
      if (!matchedTokens) return;
      // Com várias palavras, exige que ao menos metade delas tenha batido.
      if (matchedTokens < Math.ceil(tokens.length / 2)) return;
      fuzzy.push({ service, score: total + matchedTokens, guesses });
    });
  }

  fuzzy.sort((a, b) => b.score - a.score);
  const top = fuzzy.length ? fuzzy[0].score : 0;
  const kept = fuzzy.filter(f => f.score >= top * 0.6);

  const suggestions = [...new Set(kept.flatMap(f => f.guesses))];
  return {
    items: kept.map(f => f.service),
    corrected: kept.length > 0 && suggestions.length > 0,
    suggestions
  };
}
