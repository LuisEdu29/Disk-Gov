import React, { useRef, useState } from "react";
import { Bot, ChevronRight, Loader2, Send, Cpu } from "lucide-react";
import { buildKnowledgeBase, loadEmbedder, indexKnowledgeBase, searchKnowledgeBase, answerFromResults } from "./rag.js";

// O modelo só é baixado quando a pessoa usa o assistente (evita 118 MB para quem não usa).
let enginePromise = null;
function getEngine(services, situationGuides, onProgress) {
  if (!enginePromise) {
    enginePromise = (async () => {
      const { extractor, label } = await loadEmbedder(onProgress);
      const index = await indexKnowledgeBase(extractor, buildKnowledgeBase(services, situationGuides));
      return { extractor, index, label };
    })();
    enginePromise.catch(() => { enginePromise = null; });
  }
  return enginePromise;
}

export default function ChatBot({ services, situationGuides, onOpenService, speak }) {
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState({ state: "idle", text: "A IA roda no seu aparelho. Nada do que você digita sai dele." });
  const [answers, setAnswers] = useState([]);
  const [busy, setBusy] = useState(false);
  const engineRef = useRef(null);

  const prepare = async () => {
    if (engineRef.current) return engineRef.current;
    setStatus({ state: "loading", text: "Preparando a IA..." });
    try {
      const engine = await getEngine(services, situationGuides, pct =>
        setStatus({ state: "loading", text: `Baixando o modelo de IA (só na 1ª vez)... ${pct}%` })
      );
      engineRef.current = engine;
      setStatus({ state: "ready", text: `IA pronta · ${engine.label} · roda no seu aparelho` });
      return engine;
    } catch (error) {
      console.error(error);
      setStatus({ state: "error", text: `Não foi possível carregar a IA: ${error.message || error}` });
      return null;
    }
  };

  const ask = async event => {
    event.preventDefault();
    const text = question.trim();
    if (!text || busy) return;
    setBusy(true);
    const engine = await prepare();
    if (engine) {
      const results = await searchKnowledgeBase(engine.extractor, engine.index, text, services);
      const answer = answerFromResults(results, services);
      setAnswers(prev => [{ id: Date.now(), question: text, ...answer }, ...prev].slice(0, 3));
      setQuestion("");
      speak?.(answer.found
        ? `Indicado: ${answer.service.title}, telefone ${answer.service.number}.`
        : "Não encontrei essa informação no aplicativo.");
    }
    setBusy(false);
  };

  return (
    <section className="assistant-section" aria-labelledby="assistant-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">ASSISTENTE COM IA</p>
          <h2 id="assistant-title">Descreva o que aconteceu</h2>
        </div>
      </div>

      <form className="search-box assistant-form" onSubmit={ask}>
        <Bot size={20}/>
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onFocus={prepare}
          placeholder="Ex.: tem um gato preso na árvore"
          aria-label="Pergunta para o assistente"
          maxLength={200}
        />
        <button type="submit" disabled={busy || !question.trim()} aria-label="Perguntar">
          {busy ? <Loader2 size={18} className="spin"/> : <Send size={18}/>}
        </button>
      </form>
      <p className={`assistant-status ${status.state}`} role="status">
        {status.state === "loading" ? <Loader2 size={13} className="spin"/> : <Cpu size={13}/>}
        <span>{status.text}</span>
      </p>

      {answers.map(a => (
        <article key={a.id} className="assistant-answer">
          <p className="assistant-question">“{a.question}”</p>
          {a.found ? (
            <>
              <button className="assistant-service" onClick={() => onOpenService(a.service)}>
                <span>
                  <small>Serviço indicado</small>
                  <strong>{a.service.title}</strong>
                </span>
                <b>{a.service.number}</b>
                <ChevronRight size={18}/>
              </button>
              <p className="assistant-text">{a.service.description}</p>
              {a.alternatives.length > 0 && (
                <div className="chip-row">
                  <span className="assistant-alt-label">Também pode ser:</span>
                  {a.alternatives.map(s => (
                    <button key={s.id} className="chip" onClick={() => onOpenService(s)}>{s.title} · {s.number}</button>
                  ))}
                </div>
              )}
              <p className="assistant-source">Fonte no app: “{a.source}” · similaridade {a.score.toFixed(2)}</p>
            </>
          ) : (
            <p className="assistant-text">
              Não encontrei isso nas informações do app, então prefiro não chutar. Tente descrever a situação
              (ex.: “fui assaltado”, “cheiro de gás”). <strong>Em emergência: Polícia 190, SAMU 192, Bombeiros 193.</strong>
            </p>
          )}
        </article>
      ))}
    </section>
  );
}
