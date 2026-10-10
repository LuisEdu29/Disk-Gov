import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Eye, EyeOff, LogIn, UserRound, Mail, Loader2, ArrowLeft } from "lucide-react";
import { signIn, signUp, resetPassword, authErrorMessage } from "./auth.js";

const TITLES = {
  signin: { eyebrow: "CONTA OPCIONAL", title: "Entrar", lead: "Entre para acessar sua rede de contatos de emergência." },
  signup: { eyebrow: "CONTA OPCIONAL", title: "Criar conta", lead: "Leva menos de um minuto. Usamos só seu nome, e-mail e os contatos que você cadastrar." },
  reset: { eyebrow: "RECUPERAR ACESSO", title: "Esqueci a senha", lead: "Informe seu e-mail e enviaremos um link para criar uma nova senha." }
};

export default function AuthModal({ onClose, onSuccess, setToast }) {
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => { setError(""); setResetSent(false); }, [mode]);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError("");
    if (!email.trim()) { setError("Digite seu e-mail."); return; }
    if (mode !== "reset" && !password) { setError("Digite sua senha."); return; }
    if (mode === "signup" && password.length < 6) { setError("A senha precisa ter pelo menos 6 caracteres."); return; }
    if (mode === "signup" && !name.trim()) { setError("Digite seu nome."); return; }
    setBusy(true);
    try {
      if (mode === "reset") {
        await resetPassword(email);
        setResetSent(true);
      } else if (mode === "signup") {
        onSuccess(await signUp(name, email, password), true);
      } else {
        onSuccess(await signIn(email, password), false);
      }
    } catch (err) {
      // Por segurança, "e-mail não encontrado" na recuperação não é revelado.
      if (mode === "reset" && err?.code === "auth/user-not-found") setResetSent(true);
      else setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const copy = TITLES[mode];

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="service-modal auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <button className="modal-close" aria-label="Fechar" onClick={onClose}><X /></button>
        <div className="modal-icon purple"><UserRound size={30} /></div>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="auth-title">{copy.title}</h2>
        <p className="auth-lead">{copy.lead}</p>

        {resetSent ? (
          <div className="auth-success" role="status">
            <Mail size={20} />
            <span>Se existir uma conta com <strong>{email.trim()}</strong>, você receberá um e-mail com o link para redefinir a senha. Confira também o spam.</span>
          </div>
        ) : (
          <form className="auth-form" onSubmit={submit} noValidate>
            {mode === "signup" && (
              <label className="auth-field">
                <span className="field-label">Nome</span>
                <input className="field-input" type="text" autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="Como quer ser chamado" maxLength={60} />
              </label>
            )}
            <label className="auth-field">
              <span className="field-label">E-mail</span>
              <input className="field-input" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
            </label>
            {mode !== "reset" && (
              <label className="auth-field">
                <span className="field-label">Senha {mode === "signup" && <em>(mínimo 6 caracteres)</em>}</span>
                <span className="password-wrap">
                  <input
                    className="field-input"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Sua senha"
                  />
                  <button type="button" className="password-toggle" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShowPassword(v => !v)}>
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </span>
              </label>
            )}

            {error && <p className="auth-error" role="alert">{error}</p>}

            <button className="primary-btn" type="submit" disabled={busy}>
              {busy ? <Loader2 size={19} className="spin" /> : <LogIn size={19} />}
              {busy ? "Aguarde…" : mode === "signup" ? "Criar minha conta" : mode === "reset" ? "Enviar link" : "Entrar"}
            </button>
          </form>
        )}

        <div className="auth-links">
          {mode === "signin" && (
            <>
              <button type="button" className="link-btn" onClick={() => setMode("reset")}>Esqueci minha senha</button>
              <button type="button" className="link-btn strong" onClick={() => setMode("signup")}>Criar conta</button>
            </>
          )}
          {mode === "signup" && (
            <button type="button" className="link-btn" onClick={() => setMode("signin")}>Já tenho conta · Entrar</button>
          )}
          {mode === "reset" && (
            <button type="button" className="link-btn" onClick={() => setMode("signin")}><ArrowLeft size={14} /> Voltar para entrar</button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
