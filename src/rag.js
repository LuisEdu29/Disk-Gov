// Assistente com IA rodando no próprio navegador (WebGPU, com fallback para WASM/CPU).
// Não usamos um modelo que "escreve" respostas (SLM): ele é pesado (500 MB+), estoura
// memória e inventa informações. Em vez disso fazemos um RAG extrativo:
//   1) quebramos a base do app (serviços e orientações) em trechos;
//   2) vetorizamos cada trecho com um modelo de embeddings do Hugging Face;
//   3) buscamos o trecho mais parecido com a pergunta (similaridade de cosseno);
//   4) respondemos SÓ com o que está na base, ou dizemos que não sabemos.

import { normalizeText, phoneticKey } from "./search.js";

// Modelo multilíngue pequeno (entende português), ~118 MB na versão int8.
// Arquivos em huggingface.co/Xenova/multilingual-e5-small
export const EMBED_MODEL = "Xenova/multilingual-e5-small";
// O E5 foi treinado com estes prefixos para diferenciar pergunta de trecho da base.
const QUERY_PREFIX = "query: ";
const PASSAGE_PREFIX = "passage: ";

// Limites calibrados com perguntas de teste (dentro e fora do tema do app).
// Abaixo desta similaridade consideramos que a base não tem a resposta.
export const MIN_SCORE = 0.83;
// O melhor trecho precisa se destacar da média de todos os trechos por pelo menos isto.
export const MIN_GAP = 0.03;
// Bônus para serviços que têm uma palavra da pergunta (igual ou que soa igual).
export const KEYWORD_BONUS = 0.02;
// Vantagem mínima do melhor serviço sobre o trecho "fora do tema" mais parecido.
export const OFF_TOPIC_MARGIN = 0.005;
// Outros serviços com nota até esta distância do primeiro também são sugeridos.
const ALT_MARGIN = 0.01;

// ── 1) Quebrar ───────────────────────────────────────────────

// Divide um texto em trechos de até `maxChars`, sem cortar frases no meio.
export function splitIntoChunks(text, maxChars = 220) {
  const sentences = String(text || "").match(/[^.!?]+[.!?]*/g)?.map(s => s.trim()).filter(Boolean) || [];
  const chunks = [];
  let current = "";
  sentences.forEach(sentence => {
    if (current && (current + " " + sentence).length > maxChars) {
      chunks.push(current);
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  });
  if (current) chunks.push(current);
  return chunks;
}

// Monta os trechos da base. Cada trecho começa com o nome do serviço,
// para não perder o contexto depois de quebrado.
export function buildKnowledgeBase(services, situationGuides) {
  const chunks = [];
  services.forEach(service => {
    const header = `${service.title} (${service.subtitle}), telefone ${service.number}.`;
    splitIntoChunks(service.description).forEach(text => {
      chunks.push({ serviceId: service.id, text: `${header} ${text}` });
    });
    // Os casos atendidos viram trechos curtos (3 por vez): perguntas curtas casam melhor com eles.
    const cases = [...(service.keywords || []), ...(service.aliases || [])];
    for (let i = 0; i < cases.length; i += 3) {
      chunks.push({ serviceId: service.id, text: `${service.title}: ${cases.slice(i, i + 3).join(", ")}.` });
    }
  });
  situationGuides.forEach(guide => {
    const service = services.find(s => s.id === guide.service);
    if (!service) return;
    chunks.push({
      serviceId: service.id,
      text: `${guide.title}: ${guide.description} Serviço indicado: ${service.title}, telefone ${service.number}.`
    });
  });
  OFF_TOPIC.forEach(text => chunks.push({ serviceId: null, text }));
  return chunks;
}

// Trechos "fora do tema": se um deles for o mais parecido, a pergunta não é sobre
// serviços públicos e o assistente responde que não sabe (em vez de chutar um serviço).
const OFF_TOPIC = [
  "Conversa casual: oi, olá, bom dia, tudo bem, obrigado, tchau, piadas e brincadeiras.",
  "Esportes, futebol, times, jogos, filmes, séries, música e celebridades.",
  "Conhecimentos gerais: geografia, história, ciência, matemática, capitais e países.",
  "Política, notícias, economia, cotação do dólar, preços e investimentos.",
  "Receitas culinárias, dicas de cozinha, viagens, turismo e passagens.",
  "Tecnologia, programação, estudos, cursos e aprender idiomas."
];

// ── 2) Vetorizar ─────────────────────────────────────────────

async function hasWorkingWebGPU() {
  try {
    if (!navigator.gpu) return null;
    return await navigator.gpu.requestAdapter();
  } catch {
    return null;
  }
}

// Carrega o modelo de embeddings. A 1ª vez baixa os arquivos do Hugging Face;
// depois o Transformers.js os guarda no cache do navegador.
export async function loadEmbedder(onProgress) {
  const { pipeline, env } = await import("@huggingface/transformers");
  env.allowLocalModels = false;
  env.allowRemoteModels = true;

  const progress_callback = p => {
    if (p.status === "progress" && p.file?.endsWith(".onnx")) onProgress?.(Math.round(p.progress || 0));
  };

  const adapter = typeof navigator !== "undefined" ? await hasWorkingWebGPU() : null;
  if (adapter) {
    try {
      // fp16 roda inteiro na GPU; sem suporte a f16, a versão int8 (menor) também funciona no WebGPU.
      const dtype = adapter.features?.has("shader-f16") ? "fp16" : "q8";
      const extractor = await pipeline("feature-extraction", EMBED_MODEL, { device: "webgpu", dtype, progress_callback });
      return { extractor, label: `WebGPU (${dtype})` };
    } catch (error) {
      console.warn("WebGPU falhou, usando CPU:", error);
    }
  }
  const extractor = await pipeline("feature-extraction", EMBED_MODEL, { device: "wasm", dtype: "q8", progress_callback });
  return { extractor, label: "CPU (WASM, q8)" };
}

async function embed(extractor, texts) {
  const output = await extractor(texts, { pooling: "mean", normalize: true });
  return output.tolist();
}

export async function indexKnowledgeBase(extractor, chunks) {
  const vectors = await embed(extractor, chunks.map(c => `${PASSAGE_PREFIX}${c.text}`));
  return chunks.map((chunk, i) => ({ ...chunk, vector: vectors[i] }));
}

// ── 3) Buscar ────────────────────────────────────────────────

// Os vetores já vêm normalizados, então o cosseno é só o produto escalar.
function cosine(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

// Serviços que contêm alguma palavra da pergunta, escrita igual ou que soa igual
// ("polisia" = "polícia"). Palavras com menos de 4 letras são ignoradas.
function keywordMatches(services, question) {
  const keys = new Set(
    String(question).split(/[^\p{L}\p{N}]+/u)
      .filter(w => normalizeText(w).length >= 4)
      .map(phoneticKey)
  );
  return services
    .filter(service => {
      const words = [service.title, ...(service.keywords || []), ...(service.aliases || [])]
        .join(" ").split(/[^\p{L}\p{N}]+/u)
        .filter(w => normalizeText(w).length >= 4);
      return words.some(w => keys.has(phoneticKey(w)));
    })
    .map(service => service.id);
}

// Retorna os serviços do mais parecido para o menos, cada um com o seu melhor trecho.
// Busca híbrida: a nota do significado (embeddings) ganha um bônus quando o serviço
// também tem uma palavra da pergunta.
export async function searchKnowledgeBase(extractor, index, question, services) {
  const keywordIds = keywordMatches(services, question);
  const [queryVector] = await embed(extractor, [`${QUERY_PREFIX}${question}`]);
  const scored = index.map(chunk => ({ chunk, score: cosine(queryVector, chunk.vector) }));
  const mean = scored.reduce((sum, r) => sum + r.score, 0) / scored.length;

  const bestByService = new Map();
  scored.forEach(r => {
    const current = bestByService.get(r.chunk.serviceId);
    if (!current || r.score > current.score) bestByService.set(r.chunk.serviceId, r);
  });
  const ranking = [...bestByService.values()]
    .map(r => ({
      serviceId: r.chunk.serviceId,
      source: r.chunk.text,
      score: r.score + (keywordIds.includes(r.chunk.serviceId) ? KEYWORD_BONUS : 0)
    }))
    .sort((a, b) => b.score - a.score);
  return { mean, ranking, keywordIds };
}

// ── 4) Responder (sem inventar) ──────────────────────────────

// Retorna o serviço encontrado, o trecho usado como fonte e alternativas próximas.
// O modelo E5 dá notas parecidas para quase tudo, então exigimos: nota alta, destaque
// claro sobre a média e vantagem sobre os trechos "fora do tema".
// Senão, `found` é false e o app diz que não sabe.
export function answerFromResults({ mean, ranking }, services) {
  const [best, ...others] = ranking;
  const offTopic = ranking.find(r => r.serviceId === null);
  if (
    !best || best.serviceId === null ||
    best.score < MIN_SCORE ||
    best.score - mean < MIN_GAP ||
    (offTopic && best.score - offTopic.score < OFF_TOPIC_MARGIN)
  ) {
    return { found: false, score: best?.score ?? 0 };
  }
  const alternatives = others
    .filter(r => r.serviceId !== null && r.score >= MIN_SCORE && best.score - r.score <= ALT_MARGIN)
    .slice(0, 2)
    .map(r => services.find(s => s.id === r.serviceId));
  return {
    found: true,
    score: best.score,
    service: services.find(s => s.id === best.serviceId),
    source: best.source,
    alternatives
  };
}
