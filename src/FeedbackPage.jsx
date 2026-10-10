import React, { useState } from "react";
import { Star, Send, Lightbulb, ThumbsUp, Bug, MessageSquare, Check } from "lucide-react";
import { isAuthConfigured, sendFeedback } from "./auth.js";

const TYPES = [
  { id: "sugestao", label: "Sugestão", icon: Lightbulb },
  { id: "elogio", label: "Elogio", icon: ThumbsUp },
  { id: "problema", label: "Problema", icon: Bug },
  { id: "outro", label: "Outro", icon: MessageSquare }
];
const RATING_LABELS = ["", "Muito ruim", "Ruim", "Regular", "Bom", "Excelente"];
const HISTORY_KEY = "feedbackHistory";

function loadHistory() {
  try {
    const list = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(list) ? list : [];
  } catch { return []; }
}

export default function FeedbackPage({ user, setToast, speak }) {
  const [rating, setRating] = useState(0);
  const [type, setType] = useState("sugestao");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [history, setHistory] = useState(loadHistory);

  const canSend = (rating > 0 || message.trim().length >= 5) && !sending;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSend) {
      setToast("Dê uma nota ou escreva pelo menos uma frase");
      return;
    }
    const entry = {
      id: `${Date.now()}`,
      rating,
      type,
      message: message.trim(),
      email: email.trim(),
      userId: user?.uid || null,
      createdAt: new Date().toISOString(),
      app: "chamou-falou-1.3.0"
    };
    setSending(true);
    let status = "local"; // "sent" | "queued" | "local" (sem Firebase configurado)
    if (isAuthConfigured) {
      try {
        status = await sendFeedback(entry);
      } catch {
        setSending(false);
        setToast("Não foi possível enviar agora. Tente de novo.");
        return;
      }
    }
    const delivered = status === "sent";
    const next = [{ ...entry, delivered }, ...history].slice(0, 10);
    setHistory(next);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* ignora */ }
    setSending(false);
    setSent(true);
    setRating(0);
    setMessage("");
    setToast(status === "sent" ? "Obrigado! Sua avaliação foi enviada"
      : status === "queued" ? "Obrigado! Será enviada quando houver internet"
      : "Obrigado! Avaliação salva neste aparelho");
    speak?.("Obrigado pela sua avaliação!");
  };

  return (
    <>
      <p className="eyebrow">SUA OPINIÃO</p>
      <h1>Sugestões e avaliações</h1>
      <p className="muted-text">Conte como está sendo sua experiência e ajude a melhorar o app. Leva menos de um minuto.</p>

      {sent ? (
        <div className="feedback-thanks" role="status">
          <span className="feedback-thanks-icon"><Check size={22}/></span>
          <div>
            <strong>Obrigado pelo retorno!</strong>
            <span>Cada sugestão ajuda a deixar o CHAMOU, FALOU mais útil para todos.</span>
          </div>
          <button className="secondary-btn" onClick={() => setSent(false)}>Enviar outra</button>
        </div>
      ) : (
        <form className="feedback-form" onSubmit={submit}>
          <fieldset className="feedback-block">
            <legend>Como você avalia o app?</legend>
            <div className="star-rating" role="radiogroup" aria-label="Nota de 1 a 5 estrelas">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  type="button"
                  key={n}
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} ${n === 1 ? "estrela" : "estrelas"}: ${RATING_LABELS[n]}`}
                  className={`star-btn${n <= rating ? " active" : ""}`}
                  onClick={() => setRating(n === rating ? 0 : n)}
                >
                  <Star size={30} strokeWidth={2} fill={n <= rating ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
            <small className="rating-label" aria-live="polite">{rating ? RATING_LABELS[rating] : "Toque em uma estrela"}</small>
          </fieldset>

          <fieldset className="feedback-block">
            <legend>Sobre o que é?</legend>
            <div className="chip-row">
              {TYPES.map(({ id, label, icon: Icon }) => (
                <button type="button" key={id} className={`chip${type === id ? " active" : ""}`} aria-pressed={type === id} onClick={() => setType(id)}>
                  <Icon size={15}/> {label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="feedback-block">
            <span className="field-label">Sua mensagem</span>
            <textarea
              className="field-input"
              rows={5}
              maxLength={800}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Escreva sua sugestão, elogio ou o problema que encontrou…"
            />
            <small className="field-hint">{message.length}/800</small>
          </label>

          <label className="feedback-block">
            <span className="field-label">E-mail <em>(opcional, se quiser receber resposta)</em></span>
            <input className="field-input" type="email" inputMode="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
          </label>

          <button className="primary-btn" type="submit" disabled={!canSend}>
            <Send size={18}/> {sending ? "Enviando…" : "Enviar avaliação"}
          </button>
          {!isAuthConfigured && <small className="field-hint center">Nesta versão, sua avaliação fica salva apenas neste aparelho.</small>}
        </form>
      )}

      {history.length > 0 && (
        <section className="feedback-history" aria-label="Suas avaliações anteriores">
          <h2>Suas avaliações</h2>
          {history.slice(0, 3).map(item => (
            <div className="about-card" key={item.id}>
              <Star size={20} fill={item.rating ? "currentColor" : "none"}/>
              <div>
                <strong>{TYPES.find(t => t.id === item.type)?.label || "Avaliação"}{item.rating ? ` · ${item.rating}/5` : ""}</strong>
                <span>{item.message || "Somente nota."}</span>
                <span>{new Date(item.createdAt).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
          ))}
        </section>
      )}
    </>
  );
}
