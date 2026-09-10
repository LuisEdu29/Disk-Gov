import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accessibility, AlertTriangle, Bell, Car, Check, ChevronRight, ClipboardList, Clock3, Copy,
  Fingerprint, Flame, Gavel, Hand, HeartHandshake, Home, Info, Landmark, LifeBuoy, Loader2,
  MapPin, Menu, Mic, MicOff, Moon, Phone, Scale, Search, Share2, Shield, ShieldAlert,
  ShoppingBag, Siren, Star, Stethoscope, Sun, Users, Wifi, X
} from "lucide-react";
import "./styles.css";

const services = [
  { id: "policia", title: "Polícia Militar", subtitle: "Emergência e segurança", icon: Shield, tone: "blue", number: "190", description: "Atende situações de emergência relacionadas à segurança pública, como crimes em andamento, ameaças e situações que exigem intervenção policial.", keywords: ["crime", "roubo", "furto", "assalto", "violência", "emergência", "perigo", "socorro", "agressão", "briga"] },
  { id: "bombeiros", title: "Bombeiros", subtitle: "Incêndios e resgates", icon: Flame, tone: "red", number: "193", description: "Atende incêndios, resgates, acidentes e outras situações que envolvam risco à vida, à integridade física ou ao patrimônio.", keywords: ["incêndio", "fogo", "resgate", "acidente", "desabamento", "vazamento de gás", "gato preso", "explosão", "afogamento"] },
  { id: "samu", title: "SAMU", subtitle: "Emergências médicas", icon: HeartHandshake, tone: "green", number: "192", description: "Presta atendimento médico de urgência e emergência, incluindo situações de mal súbito, acidentes e outros problemas de saúde que precisam de atendimento rápido.", keywords: ["mal súbito", "desmaio", "infarto", "avc", "derrame", "ferimento grave", "parada cardíaca", "convulsão", "ambulância", "acidente"] },
  { id: "conselho", title: "Conselho Tutelar", subtitle: "Proteção de crianças", icon: Users, tone: "purple", number: "100", description: "Atua na proteção de crianças e adolescentes quando seus direitos estão ameaçados ou violados.", keywords: ["criança", "adolescente", "maus-tratos infantil", "abuso infantil", "negligência", "trabalho infantil", "abandono de menor"] },
  { id: "defesa", title: "Defesa Civil", subtitle: "Riscos e desastres", icon: Siren, tone: "orange", number: "199", description: "Atua em situações de risco e desastres, como alagamentos, enchentes, deslizamentos e outros eventos que possam colocar a população em perigo.", keywords: ["enchente", "alagamento", "deslizamento", "desabamento", "temporal", "desastre", "risco geológico", "queda de árvore"] },
  { id: "guarda", title: "Guarda Municipal", subtitle: "Segurança urbana", icon: Star, tone: "teal", number: "153", description: "Atua na segurança e proteção de espaços, equipamentos e serviços públicos, conforme as atribuições do município.", keywords: ["segurança urbana", "praça", "parque", "ocupação irregular", "vandalismo", "perturbação"] },
  { id: "prf", title: "Polícia Rodoviária Federal", subtitle: "Emergências em rodovias federais", icon: Car, tone: "indigo", number: "191", description: "Atende ocorrências e situações de emergência em rodovias federais, além de atuar na fiscalização e segurança do trânsito nessas vias.", keywords: ["rodovia", "estrada", "acidente de carro", "acidente na br", "batida", "capotamento", "fiscalização de trânsito"] },
  { id: "mulher", title: "Central de Atendimento à Mulher", subtitle: "Denúncias de violência doméstica", icon: ShieldAlert, tone: "pink", number: "180", description: "Oferece orientação e recebe denúncias relacionadas à violência contra a mulher, incluindo situações de violência doméstica.", keywords: ["violência doméstica", "agressão", "assédio", "abuso", "feminicídio", "ameaça", "maria da penha"] },
  { id: "policiacivil", title: "Polícia Civil", subtitle: "Investigação e ocorrências", icon: Fingerprint, tone: "yellow", number: "197", description: "Recebe informações e ocorrências relacionadas à investigação de crimes e às atividades da Polícia Civil.", keywords: ["investigação", "ocorrência", "furto", "roubo", "crime", "boletim de ocorrência", "b.o.", "delegacia"] },
  { id: "procon", title: "Procon", subtitle: "Defesa do consumidor", icon: ShoppingBag, tone: "cyan", number: "151", description: "Orienta e auxilia consumidores em questões relacionadas a produtos, serviços, cobranças e relações de consumo.", keywords: ["consumidor", "compra", "cobrança indevida", "propaganda enganosa", "produto com defeito", "reclamação"] },
  { id: "anatel", title: "Anatel", subtitle: "Reclamações de telefonia e internet", icon: Wifi, tone: "blue", number: "1331", description: "Canal para questões, reclamações e informações relacionadas a serviços de telecomunicações, como telefonia e internet.", keywords: ["telefone", "internet", "operadora", "sinal", "celular", "linha", "wifi", "cobrança de internet"] },
  { id: "disquedenuncia", title: "Disque Denúncia", subtitle: "Denúncia de crimes, sigilo garantido", icon: AlertTriangle, tone: "red", number: "181", description: "Recebe denúncias sobre crimes e situações suspeitas, com possibilidade de preservação do sigilo do denunciante.", keywords: ["denúncia anônima", "tráfico", "crime organizado", "corrupção", "sigilo", "informante"] },
  { id: "cvv", title: "CVV", subtitle: "Apoio emocional e prevenção ao suicídio", icon: LifeBuoy, tone: "green", number: "188", description: "Oferece apoio emocional e atendimento voluntário para pessoas que precisam conversar ou estão passando por momentos difíceis.", keywords: ["suicídio", "depressão", "apoio emocional", "crise emocional", "ansiedade", "desabafo", "solidão"] },
  { id: "detran", title: "Detran", subtitle: "Emplacamento, CNH e multas", icon: ClipboardList, tone: "purple", number: "154", description: "Atende assuntos relacionados a trânsito e habilitação, incluindo CNH, veículos, emplacamento e multas.", keywords: ["cnh", "carteira de motorista", "multa", "emplacamento", "veículo", "habilitação", "carro"] },
  { id: "inss", title: "INSS", subtitle: "Benefícios e aposentadoria", icon: Landmark, tone: "orange", number: "135", description: "Presta informações e orientações sobre benefícios previdenciários e serviços relacionados ao INSS.", keywords: ["aposentadoria", "benefício", "auxílio doença", "pensão", "previdência", "bpc"] },
  { id: "vigilancia", title: "Vigilância Sanitária", subtitle: "Denúncias sobre estabelecimentos", icon: Stethoscope, tone: "teal", number: "150", description: "Recebe denúncias e informações relacionadas a possíveis problemas sanitários em estabelecimentos e serviços.", keywords: ["estabelecimento sujo", "alimento estragado", "condições sanitárias", "praga", "contaminação"] },
  { id: "mp", title: "Ministério Público", subtitle: "Ouvidoria, denúncias e orientação", icon: Scale, tone: "indigo", number: "127", description: "Canal de ouvidoria, denúncias e orientações sobre situações que podem envolver direitos coletivos e atuação do Ministério Público.", keywords: ["ouvidoria", "direitos coletivos", "denúncia contra órgão público", "irregularidade"] },
  { id: "defensoria", title: "Defensoria Pública", subtitle: "Orientação jurídica gratuita", icon: Gavel, tone: "pink", number: "129", description: "Oferece orientação e assistência jurídica gratuita para pessoas que precisam de apoio para acessar seus direitos.", keywords: ["advogado gratuito", "processo", "orientação jurídica", "direitos", "ação judicial", "sem advogado"] },
  { id: "idoso", title: "Disque Idoso", subtitle: "Proteção aos direitos da pessoa idosa", icon: Accessibility, tone: "yellow", number: "100", description: "Canal para orientação, denúncias e proteção dos direitos da pessoa idosa em situações de violência ou violação de direitos.", keywords: ["idoso", "terceira idade", "maus-tratos idoso", "abandono de idoso", "abuso contra idoso"] },
  { id: "libras", title: "Central de Libras", subtitle: "Intermediação em Libras para serviços públicos", icon: Hand, tone: "cyan", number: "Varia por cidade", description: "Oferece intermediação em Libras para facilitar a comunicação e o acesso a serviços públicos. O canal disponível pode variar conforme a cidade.", keywords: ["surdo", "deficiente auditivo", "libras", "comunicação acessível", "intérprete"] }
];

const sosOptions = ["policia", "samu", "bombeiros"];

const recentSeed = [
  { id: "bombeiros", title: "Bombeiros", number: "193", time: "Hoje, 09:42" },
  { id: "policia", title: "Polícia", number: "190", time: "Ontem, 18:20" },
  { id: "conselho", title: "Conselho Tutelar", number: "100", time: "02/09, 14:11" }
];

function Skeleton() {
  return (
    <div className="skeleton-screen" aria-label="Carregando serviços">
      <div className="sk sk-head" />
      <div className="sk sk-title" />
      <div className="sk sk-search" />
      <div className="sk-grid">
        {[1,2,3,4].map(i => <div className="sk sk-card" key={i} />)}
      </div>
    </div>
  );
}

function ServiceCard({ service, onOpen, isFavorite, onToggleFavorite }) {
  const Icon = service.icon;
  return (
    <motion.button
      className={`service-card ${service.tone}`}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -2 }}
      onClick={() => onOpen(service)}
      aria-label={`Abrir ${service.title}`}
    >
      {onToggleFavorite && (
        <span
          role="button"
          tabIndex={0}
          className={`fav-btn${isFavorite ? " active" : ""}`}
          aria-label={isFavorite ? `Remover ${service.title} dos salvos` : `Salvar ${service.title}`}
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(service.id); }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); e.preventDefault(); onToggleFavorite(service.id); } }}
        >
          <Star size={14} strokeWidth={2.2} fill={isFavorite ? "currentColor" : "none"} />
        </span>
      )}
      <span className="service-icon"><Icon size={25} strokeWidth={2.2}/></span>
      <span className="service-copy">
        <strong>{service.title}</strong>
        <small>{service.subtitle}</small>
      </span>
      <ChevronRight size={20} className="chevron" />
    </motion.button>
  );
}

function RecentItem({ item, onDelete, onOpen }) {
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);

  return (
    <div className="swipe-wrap">
      <div className="delete-bg"><X size={18}/> Solte para excluir</div>
      <motion.div
        className="recent-item"
        drag="x"
        dragConstraints={{ left: -150, right: 0 }}
        dragElastic={0.08}
        animate={{ x }}
        onDragStart={() => setDragging(true)}
        onDragEnd={(_, info) => {
          setDragging(false);
          if (info.offset.x < -95) {
            onDelete(item.id);
          } else {
            setX(0);
          }
        }}
        onClick={() => { if (!dragging) onOpen(item.id); }}
        role="button"
        tabIndex={0}
        aria-label={`Abrir ${item.title}`}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(item.id); } }}
      >
        <Clock3 size={20} className="recent-icon"/>
        <div>
          <strong>{item.title}</strong>
          <small>{item.time} · {item.number}</small>
        </div>
        {!dragging && <ChevronRight size={18} className="muted"/>}
      </motion.div>
    </div>
  );
}

function getInitialFavorites() {
  if (typeof window === "undefined") return [];
  try {
    const saved = JSON.parse(localStorage.getItem("favorites") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function getInitialRecent() {
  if (typeof window === "undefined") return recentSeed;
  try {
    const saved = localStorage.getItem("recent");
    if (saved === null) return recentSeed;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : recentSeed;
  } catch {
    return recentSeed;
  }
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getInitialTheme() {
  const saved = typeof window !== "undefined" && localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  const prefersDark = typeof window !== "undefined"
    && window.matchMedia
    && window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function App() {
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("inicio");
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [confirmCallTarget, setConfirmCallTarget] = useState(null);
  const [recent, setRecent] = useState(getInitialRecent);
  const [toast, setToast] = useState("");
  const [theme, setTheme] = useState(getInitialTheme);
  const [favorites, setFavorites] = useState(getInitialFavorites);
  const [sosOpen, setSosOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [locationLabel, setLocationLabel] = useState("Sua região");
  const [locating, setLocating] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = React.useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current && recognitionRef.current.stop();
    };
  }, []);

  useEffect(() => {
    if (active !== "inicio" && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  }, [active]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== "Escape") return;
      if (confirmCallTarget) setConfirmCallTarget(null);
      else if (selected) setSelected(null);
      else if (sosOpen) setSosOpen(false);
      else if (menuOpen) setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmCallTarget, selected, sosOpen, menuOpen]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("recent", JSON.stringify(recent));
  }, [recent]);

  const toggleFavorite = (id) => {
    setFavorites(f => {
      const isSaved = f.includes(id);
      const next = isSaved ? f.filter(x => x !== id) : [...f, id];
      const service = services.find(s => s.id === id);
      setToast(isSaved ? `${service.title} removido dos salvos` : `${service.title} salvo`);
      return next;
    });
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => services.filter(s => {
    const words = s.keywords || [];
    const haystack = normalizeText(`${s.title} ${s.subtitle} ${words.join(" ")}`);
    return haystack.includes(normalizeText(search));
  }), [search]);

  const openService = (service) => {
    setSelected(service);
    setToast(`${service.title} selecionado`);
    const now = new Date();
    const time = now.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    setRecent(r => {
      const withoutDuplicate = r.filter(item => item.id !== service.id);
      const entry = { id: service.id, title: service.title, number: service.number, time };
      return [entry, ...withoutDuplicate].slice(0, 8);
    });
  };

  const call = () => {
    if (!selected) return;
    const isRealNumber = /\d/.test(selected.number);
    if (!isRealNumber) {
      setToast(`Consulte o telefone da Central de Libras da sua cidade`);
      return;
    }
    setConfirmCallTarget(selected);
  };

  const confirmCall = () => {
    if (!confirmCallTarget) return;
    const service = confirmCallTarget;
    setConfirmCallTarget(null);
    setSelected(service);
    setToast(`Simulação: chamada para ${service.number}`);
  };

  const cancelCall = () => setConfirmCallTarget(null);

  const copyNumber = async (service) => {
    try {
      await navigator.clipboard.writeText(service.number);
      setCopied(true);
      setToast("Número copiado");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setToast("Não foi possível copiar");
    }
  };

  const shareNumber = (service) => {
    const text = `${service.title}: ${service.number}`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  const quickDial = (id) => {
    const service = services.find(s => s.id === id);
    if (!service) return;
    setSosOpen(false);
    setConfirmCallTarget(service);
  };

  const locateUser = () => {
    if (!navigator.geolocation) {
      setToast("Geolocalização não é suportada neste navegador");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`
          );
          const data = await res.json();
          const city = data.city || data.locality || data.principalSubdivision;
          const state = data.principalSubdivisionCode
            ? data.principalSubdivisionCode.replace("BR-", "")
            : data.principalSubdivision;
          const label = city && state ? `${city} - ${state}` : city || "Localização encontrada";
          setLocationLabel(label);
          setToast("Localização atualizada");
        } catch {
          setLocationLabel("Localização encontrada");
          setToast("Não foi possível identificar a cidade");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        setToast(err.code === err.PERMISSION_DENIED
          ? "Permissão de localização negada"
          : "Não foi possível obter sua localização");
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const toggleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setToast("Busca por voz não é suportada neste navegador");
      return;
    }
    if (listening) {
      recognitionRef.current && recognitionRef.current.stop();
      setListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setSearch(transcript);
      setActive("inicio");
    };
    recognition.onerror = () => {
      setToast("Não entendi, tente novamente");
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  if (loading) return <main className="app-shell"><Skeleton /></main>;

  return (
    <main className="app-shell">
      <div className="mobile-frame">
        <header className="topbar">
          <button className="icon-btn" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}><Menu size={23}/></button>
          <div className="brand"><span>CHAMOU,  </span><b>FALOU</b></div>
          <div className="topbar-actions">
            <button
              className="icon-btn"
              aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
            <button className="icon-btn" aria-label="Notificações" onClick={() => setToast("Nenhuma nova notificação")}>
              <Bell size={21}/>
            </button>
          </div>
        </header>

        <AnimatePresence>
          {menuOpen && (
            <motion.div className="drawer-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setMenuOpen(false)}>
              <motion.aside className="side-drawer" initial={{x:-320}} animate={{x:0}} exit={{x:-320}} onClick={e => e.stopPropagation()}>
                <div className="drawer-head">
                  <div className="brand drawer-brand"><span>CHAMOU,</span><b>FALOU</b></div>
                  <button className="icon-btn" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}><X size={22}/></button>
                </div>
                <p className="drawer-label">NAVEGAÇÃO</p>
                {[["inicio",Home,"Início"],["mapa",MapPin,"Próximos"],["guia",ClipboardList,"Guia"],["salvos",Star,"Salvos"],["sobre",Info,"Sobre"]].map(([id,Icon,label]) => (
                  <button key={id} className={`drawer-item ${active===id ? "active" : ""}`} onClick={() => {setActive(id); setMenuOpen(false);}}>
                    <Icon size={20}/> {label}
                  </button>
                ))}
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {active === "inicio" && (
            <motion.section key="home" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="content">
              <div className="hero">
                <div>
                  <p className="eyebrow">SERVIÇOS ESSENCIAIS</p>
                  <h1>Precisa de ajuda?</h1>
                  <p className="hero-copy">Encontre rapidamente o serviço público que você precisa.</p>
                </div>
                <button className="location-pill" onClick={locateUser} disabled={locating} aria-label="Atualizar localização">
                  {locating ? <Loader2 size={16} className="spin"/> : <MapPin size={16}/>}
                  {locating ? "Localizando..." : locationLabel}
                </button>
              </div>

              <label className="search-box">
                <Search size={20}/>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={listening ? "Ouvindo..." : "Buscar serviço..."}
                  aria-label="Buscar serviço"
                />
                {search && <button onClick={() => setSearch("")} aria-label="Limpar busca"><X size={17}/></button>}
                <button
                  className={`mic-btn${listening ? " listening" : ""}`}
                  onClick={toggleVoiceSearch}
                  aria-label={listening ? "Parar busca por voz" : "Buscar por voz"}
                  type="button"
                >
                  {listening ? <MicOff size={18}/> : <Mic size={18}/>}
                </button>
              </label>

              <div className="section-heading">
                <h2>Serviços</h2>
                <span>{filtered.length} disponíveis</span>
              </div>

              <div className="service-grid">
                {filtered.length === 0 ? (
                  <div className="empty">Nenhum serviço encontrado para "{search}".</div>
                ) : filtered.map(s => (
                  <ServiceCard
                    key={s.id}
                    service={s}
                    onOpen={openService}
                    isFavorite={favorites.includes(s.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>

              <div className="gesture-hint">
                <div className="gesture-arrow">←</div>
                <div><strong>Dica rápida</strong><span>Arraste um atendimento recente para a esquerda para excluir.</span></div>
              </div>

              <div className="section-heading recent-heading">
                <h2>Recentes</h2>
                {recent.length > 0 ? (
                  <button
                    className="clear-recent-btn"
                    onClick={() => { setRecent([]); setToast("Recentes limpos"); }}
                  >
                    Limpar tudo
                  </button>
                ) : (
                  <span>Arraste para excluir</span>
                )}
              </div>

              <div className="recent-list">
                {recent.length === 0 ? (
                  <div className="empty">Nenhum atendimento recente.</div>
                ) : recent.map(item =>
                  <RecentItem
                    key={item.id}
                    item={item}
                    onDelete={(id) => {
                      setRecent(r => r.filter(x => x.id !== id));
                      setToast("Atendimento removido");
                    }}
                    onOpen={(id) => {
                      const service = services.find(s => s.id === id);
                      if (service) openService(service);
                    }}
                  />
                )}
              </div>
            </motion.section>
          )}

          {active === "mapa" && (
            <motion.section key="map" initial={{opacity:0,x:15}} animate={{opacity:1,x:0}} className="content simple-page">
              <p className="eyebrow">LOCALIZAÇÃO</p>
              <h1>Serviços próximos</h1>
              <div className="fake-map">
                <MapPin size={42}/>
                <strong>Mapa de serviços</strong>
                <span>{locationLabel === "Sua região" ? "Toque abaixo para localizar sua região." : `Região identificada: ${locationLabel}`}</span>
                <span>Protótipo — integração de mapas pode ser adicionada depois.</span>
              </div>
              <button className="primary-btn" onClick={locateUser} disabled={locating}>
                {locating ? <Loader2 size={19} className="spin"/> : <MapPin size={19}/>}
                {locating ? "Localizando..." : "Atualizar localização"}
              </button>
            </motion.section>
          )}

          {active === "guia" && (
            <motion.section key="guide" initial={{opacity:0,x:15}} animate={{opacity:1,x:0}} className="content simple-page guide-page">
              <p className="eyebrow">CONHEÇA OS SERVIÇOS</p>
              <h1>Guia de serviços</h1>
              <p className="muted-text">Entenda para que serve cada serviço disponível na página principal e saiba qual canal procurar em cada situação.</p>
              <div className="guide-list">
                {services.map(item => {
                  const Icon = item.icon;
                  return (
                    <details className="guide-card" key={item.id}>
                      <summary><span className={`guide-icon ${item.tone}`}><Icon size={21}/></span><span><strong>{item.title}</strong><small>{item.number}</small></span><ChevronRight size={19} className="guide-chevron"/></summary>
                      <div className="guide-content">
                        <h3>Para que serve?</h3>
                        <p>{item.description}</p>
                        <div className="guide-number"><Phone size={16}/><span><strong>Contato:</strong> {item.number}</span></div>
                        <button className="secondary-btn guide-open-btn" onClick={() => openService(services.find(s => s.id === item.id))}>Ver serviço</button>
                      </div>
                    </details>
                  );
                })}
              </div>
              <div className="about-card guide-warning"><ShieldAlert size={20}/><div><strong>Em caso de emergência</strong><span>Use o botão SOS para acessar rapidamente Polícia, SAMU ou Bombeiros.</span></div></div>
            </motion.section>
          )}

          {active === "salvos" && (
            <motion.section key="saved" initial={{opacity:0,x:15}} animate={{opacity:1,x:0}} className="content simple-page">
              <p className="eyebrow">ACESSO RÁPIDO</p>
              <h1>Serviços salvos</h1>
              <p className="muted-text">Toque na estrela de um serviço para salvá-lo aqui e acessá-lo mais rápido depois.</p>
              {favorites.length === 0 ? (
                <div className="empty">Nenhum serviço salvo ainda.</div>
              ) : (
                <div className="service-grid">
                  {services.filter(s => favorites.includes(s.id)).map(s => (
                    <ServiceCard
                      key={s.id}
                      service={s}
                      onOpen={openService}
                      isFavorite={true}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              )}
            </motion.section>
          )}

          {active === "sobre" && (
            <motion.section key="about" initial={{opacity:0,x:15}} animate={{opacity:1,x:0}} className="content simple-page">
              <p className="eyebrow">SOBRE</p>
              <h1>CHAMOU, FALOU</h1>
              <p className="muted-text">
                Este aplicativo reúne em um só lugar os principais números de serviços públicos
                essenciais do Brasil, para que qualquer pessoa encontre ajuda rapidamente.
              </p>

              <div className="about-card">
                <Info size={20}/>
                <div>
                  <strong>Números oficiais</strong>
                  <span>Todos os contatos listados correspondem aos canais nacionais oficiais de cada serviço.</span>
                </div>
              </div>

              <div className="about-card">
                <ShieldAlert size={20}/>
                <div>
                  <strong>Não substitui o atendimento oficial</strong>
                  <span>Este é um protótipo. Em uma emergência real, disque diretamente para o número do serviço pelo seu telefone.</span>
                </div>
              </div>

              <div className="about-meta">
                <span>Versão 1.0.0</span>
                <span>Números atualizados em setembro de 2026</span>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {sosOpen && (
            <>
              <div className="sos-backdrop" onClick={() => setSosOpen(false)} />
              <motion.div
                className="sos-menu"
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.96 }}
              >
                <strong className="sos-menu-label">Ligação rápida</strong>
                {sosOptions.map(id => {
                  const service = services.find(s => s.id === id);
                  const Icon = service.icon;
                  return (
                    <button key={id} className="sos-menu-item" onClick={() => quickDial(id)}>
                      <Icon size={18} />
                      <span>{service.title}</span>
                      <strong>{service.number}</strong>
                    </button>
                  );
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <motion.button
          className="sos-fab"
          aria-label="Emergência — ligação rápida"
          whileTap={{ scale: 0.94 }}
          onClick={() => setSosOpen(o => !o)}
        >
          {sosOpen ? <X size={24}/> : <Siren size={24}/>}
        </motion.button>

        <nav className="bottom-nav" aria-label="Navegação principal">
          <button className={active==="inicio" ? "active" : ""} onClick={() => setActive("inicio")}><Home size={21}/><span>Início</span></button>
          <button className={active==="mapa" ? "active" : ""} onClick={() => setActive("mapa")}><MapPin size={21}/><span>Próximos</span></button>
          <button className={active==="guia" ? "active" : ""} onClick={() => setActive("guia")}><ClipboardList size={21}/><span>Guia</span></button>
          <button className={active==="sobre" ? "active" : ""} onClick={() => setActive("sobre")}><Info size={21}/><span>Sobre</span></button>
        </nav>

        <AnimatePresence>
          {selected && (
            <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setSelected(null)}>
              <motion.div className="service-modal" initial={{y:60,opacity:0}} animate={{y:0,opacity:1}} exit={{y:60,opacity:0}} onClick={e=>e.stopPropagation()}>
                <button className="modal-close" onClick={() => setSelected(null)}><X/></button>
                <button
                  className={`modal-close modal-fav${favorites.includes(selected.id) ? " active" : ""}`}
                  aria-label={favorites.includes(selected.id) ? "Remover dos salvos" : "Salvar serviço"}
                  onClick={() => toggleFavorite(selected.id)}
                >
                  <Star size={18} fill={favorites.includes(selected.id) ? "currentColor" : "none"} />
                </button>
                <div className={`modal-icon ${selected.tone}`}><selected.icon size={30}/></div>
                <p className="eyebrow">SERVIÇO PÚBLICO</p>
                <h2>{selected.title}</h2>
                <p>{selected.subtitle}. Em uma versão real, esta tela poderia mostrar endereço, distância, horário e orientações.</p>
                <div className="number-box"><span>Número de emergência</span><strong>{selected.number}</strong></div>
                <div className="modal-actions">
                  <button className="secondary-btn" onClick={() => copyNumber(selected)}>
                    {copied ? <Check size={17}/> : <Copy size={17}/>} {copied ? "Copiado" : "Copiar"}
                  </button>
                  <button className="secondary-btn" onClick={() => shareNumber(selected)}>
                    <Share2 size={17}/> Compartilhar
                  </button>
                </div>
                <button className="primary-btn" onClick={call}><Phone size={19}/> Ligar</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {confirmCallTarget && (
            <motion.div
              className="modal-backdrop confirm-backdrop"
              initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              onClick={cancelCall}
            >
              <motion.div
                className="confirm-modal"
                role="alertdialog"
                aria-labelledby="confirm-call-title"
                aria-describedby="confirm-call-desc"
                initial={{y:60,opacity:0}} animate={{y:0,opacity:1}} exit={{y:60,opacity:0}}
                onClick={e=>e.stopPropagation()}
              >
                <div className="confirm-icon"><AlertTriangle size={28}/></div>
                <h2 id="confirm-call-title">Tem certeza que quer ligar?</h2>
                <p id="confirm-call-desc">
                  Você está prestes a ligar para <strong>{confirmCallTarget.title}</strong> ({confirmCallTarget.number}).
                  Fazer um trote com esse número é crime e pode atrasar o atendimento de quem realmente precisa de ajuda.
                  Ligue apenas se for uma emergência real.
                </p>
                <div className="confirm-actions">
                  <button className="secondary-btn" onClick={cancelCall}>Cancelar</button>
                  <button className="primary-btn confirm-danger" onClick={confirmCall}>
                    <Phone size={18}/> Sim, é uma emergência real
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toast && (
            <motion.div className="toast" role="status" aria-live="polite" initial={{y:40,opacity:0}} animate={{y:0,opacity:1}} exit={{y:40,opacity:0}}>
              <span className="toast-check">✓</span>{toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
