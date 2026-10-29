import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence } from "framer-motion";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import { SpeechRecognition } from "@capacitor-community/speech-recognition";
import {
  Accessibility, AlertTriangle, Car, Check, ChevronRight, ClipboardList, Clock3, Copy,
  Fingerprint, Flame, Gavel, Hand, HeartHandshake, Home, Info, Landmark, LifeBuoy, Loader2,
  MapPin, Menu, Mic, MicOff, Phone, Scale, Search, Share2, Shield, ShieldAlert,
  ShoppingBag, Siren, Star, Stethoscope, Users, Wifi, X, Volume2, Navigation, ExternalLink, UserPlus, Send, LocateFixed,
  Eye, SunMoon, MessageSquare, LogIn, LogOut, UserRound, MessageCircle, Mail, MapPinOff
} from "lucide-react";
import FeedbackPage from "./FeedbackPage.jsx";
import ChatBot from "./ChatBot.jsx";
import logoUrl from "./assets/logo.png";
import { searchServices, normalizeText } from "./search.js";
import AuthModal from "./AuthModal.jsx";
import { isAuthConfigured, watchAuth, watchContacts, saveContacts, signOutUser, resendVerification, refreshUser, publishLocation, stopSharingLocation, watchSharedWithMe, watchMyShare } from "./auth.js";
import "./styles.css";

const services = [
  { id: "policia", title: "Polícia Militar", subtitle: "Emergência e segurança", icon: Shield, tone: "blue", number: "190", description: "Atende situações de emergência relacionadas à segurança pública, como crimes em andamento, ameaças e situações que exigem intervenção policial.", aliases: ["policial", "pm", "ladrão", "bandido", "assaltante", "delegado"], keywords: ["crime", "roubo", "furto", "assalto", "violência", "emergência", "perigo", "socorro", "agressão", "briga"] },
  { id: "bombeiros", title: "Bombeiros", subtitle: "Incêndios e resgates", icon: Flame, tone: "red", number: "193", description: "Atende incêndios, resgates, acidentes e outras situações que envolvam risco à vida, à integridade física ou ao patrimônio.", aliases: ["bombeiro", "salvamento", "gás"], keywords: ["incêndio", "fogo", "resgate", "acidente", "desabamento", "vazamento de gás", "gato preso", "explosão", "afogamento"] },
  { id: "samu", title: "SAMU", subtitle: "Emergências médicas", icon: HeartHandshake, tone: "green", number: "192", description: "Presta atendimento médico de urgência e emergência, incluindo situações de mal súbito, acidentes e outros problemas de saúde que precisam de atendimento rápido.", aliases: ["hospital", "médico", "passando mal", "pronto socorro", "enfermeiro"], keywords: ["mal súbito", "desmaio", "infarto", "avc", "derrame", "ferimento grave", "parada cardíaca", "convulsão", "ambulância", "acidente"] },
  { id: "conselho", title: "Conselho Tutelar", subtitle: "Proteção de crianças", icon: Users, tone: "purple", number: "100", description: "Atua na proteção de crianças e adolescentes quando seus direitos estão ameaçados ou violados.", aliases: ["menor", "filho", "criancas", "bebê"], keywords: ["criança", "adolescente", "maus-tratos infantil", "abuso infantil", "negligência", "trabalho infantil", "abandono de menor"] },
  { id: "defesa", title: "Defesa Civil", subtitle: "Riscos e desastres", icon: Siren, tone: "orange", number: "199", description: "Atua em situações de risco e desastres, como alagamentos, enchentes, deslizamentos e outros eventos que possam colocar a população em perigo.", keywords: ["enchente", "alagamento", "deslizamento", "desabamento", "temporal", "desastre", "risco geológico", "queda de árvore"] },
  { id: "guarda", title: "Guarda Municipal", subtitle: "Segurança urbana", icon: Star, tone: "teal", number: "153", description: "Atua na segurança e proteção de espaços, equipamentos e serviços públicos, conforme as atribuições do município.", keywords: ["segurança urbana", "praça", "parque", "ocupação irregular", "vandalismo", "perturbação"] },
  { id: "prf", title: "Polícia Rodoviária Federal", subtitle: "Emergências em rodovias federais", icon: Car, tone: "indigo", number: "191", description: "Atende ocorrências e situações de emergência em rodovias federais, além de atuar na fiscalização e segurança do trânsito nessas vias.", keywords: ["rodovia", "estrada", "acidente de carro", "acidente na br", "batida", "capotamento", "fiscalização de trânsito"] },
  { id: "mulher", title: "Central de Atendimento à Mulher", subtitle: "Denúncias de violência doméstica", icon: ShieldAlert, tone: "pink", number: "180", description: "Oferece orientação e recebe denúncias relacionadas à violência contra a mulher, incluindo situações de violência doméstica.", aliases: ["marido", "namorado", "companheiro", "espancamento"], keywords: ["violência doméstica", "agressão", "assédio", "abuso", "feminicídio", "ameaça", "maria da penha"] },
  { id: "policiacivil", title: "Polícia Civil", subtitle: "Investigação e ocorrências", icon: Fingerprint, tone: "yellow", number: "197", description: "Recebe informações e ocorrências relacionadas à investigação de crimes e às atividades da Polícia Civil.", keywords: ["investigação", "ocorrência", "furto", "roubo", "crime", "boletim de ocorrência", "b.o.", "delegacia"] },
  { id: "procon", title: "Procon", subtitle: "Defesa do consumidor", icon: ShoppingBag, tone: "cyan", number: "151", description: "Orienta e auxilia consumidores em questões relacionadas a produtos, serviços, cobranças e relações de consumo.", keywords: ["consumidor", "compra", "cobrança indevida", "propaganda enganosa", "produto com defeito", "reclamação"] },
  { id: "anatel", title: "Anatel", subtitle: "Reclamações de telefonia e internet", icon: Wifi, tone: "blue", number: "1331", description: "Canal para questões, reclamações e informações relacionadas a serviços de telecomunicações, como telefonia e internet.", keywords: ["telefone", "internet", "operadora", "sinal", "celular", "linha", "wifi", "cobrança de internet"] },
  { id: "disquedenuncia", title: "Disque Denúncia", subtitle: "Denúncia de crimes, sigilo garantido", icon: AlertTriangle, tone: "red", number: "181", description: "Recebe denúncias sobre crimes e situações suspeitas, com possibilidade de preservação do sigilo do denunciante.", keywords: ["denúncia anônima", "tráfico", "crime organizado", "corrupção", "sigilo", "informante"] },
  { id: "cvv", title: "CVV", subtitle: "Apoio emocional e prevenção ao suicídio", icon: LifeBuoy, tone: "green", number: "188", description: "Oferece apoio emocional e atendimento voluntário para pessoas que precisam conversar ou estão passando por momentos difíceis.", keywords: ["suicídio", "depressão", "apoio emocional", "crise emocional", "ansiedade", "desabafo", "solidão", "vontade de morrer", "pensamentos suicidas"] },
  { id: "detran", title: "Detran", subtitle: "Emplacamento, CNH e multas", icon: ClipboardList, tone: "purple", number: "154", description: "Atende assuntos relacionados a trânsito e habilitação, incluindo CNH, veículos, emplacamento e multas.", keywords: ["cnh", "carteira de motorista", "multa", "emplacamento", "veículo", "habilitação", "carro"] },
  { id: "inss", title: "INSS", subtitle: "Benefícios e aposentadoria", icon: Landmark, tone: "orange", number: "135", description: "Presta informações e orientações sobre benefícios previdenciários e serviços relacionados ao INSS.", keywords: ["aposentadoria", "benefício", "auxílio doença", "pensão", "previdência", "bpc"] },
  { id: "vigilancia", title: "Vigilância Sanitária", subtitle: "Denúncias sobre estabelecimentos", icon: Stethoscope, tone: "teal", number: "150", description: "Recebe denúncias e informações relacionadas a possíveis problemas sanitários em estabelecimentos e serviços.", keywords: ["estabelecimento sujo", "alimento estragado", "condições sanitárias", "praga", "contaminação"] },
  { id: "mp", title: "Ministério Público", subtitle: "Ouvidoria, denúncias e orientação", icon: Scale, tone: "indigo", number: "127", description: "Canal de ouvidoria, denúncias e orientações sobre situações que podem envolver direitos coletivos e atuação do Ministério Público.", keywords: ["ouvidoria", "direitos coletivos", "denúncia contra órgão público", "irregularidade"] },
  { id: "defensoria", title: "Defensoria Pública", subtitle: "Orientação jurídica gratuita", icon: Gavel, tone: "pink", number: "129", description: "Oferece orientação e assistência jurídica gratuita para pessoas que precisam de apoio para acessar seus direitos.", keywords: ["advogado gratuito", "processo", "orientação jurídica", "direitos", "ação judicial", "sem advogado"] },
  { id: "idoso", title: "Disque Idoso", subtitle: "Proteção aos direitos da pessoa idosa", icon: Accessibility, tone: "yellow", number: "100", description: "Canal para orientação, denúncias e proteção dos direitos da pessoa idosa em situações de violência ou violação de direitos.", keywords: ["idoso", "terceira idade", "maus-tratos idoso", "abandono de idoso", "abuso contra idoso", "avó", "avô", "cuidador de idoso"] },
  { id: "libras", title: "Central de Libras", subtitle: "Intermediação em Libras para serviços públicos", icon: Hand, tone: "cyan", number: "Varia por cidade", description: "Oferece intermediação em Libras para facilitar a comunicação e o acesso a serviços públicos. O canal disponível pode variar conforme a cidade.", keywords: ["surdo", "deficiente auditivo", "libras", "comunicação acessível", "intérprete"] }
];

const sosOptions = ["policia", "samu", "bombeiros"];
const popularServiceIds = ["policia", "samu", "bombeiros", "procon", "anatel"];

const situationGuides = [
  { id: "saude", icon: HeartHandshake, title: "Problema de saúde", description: "Mal súbito, desmaio, convulsão, ferimento grave ou outra emergência médica.", service: "samu", color: "green" },
  { id: "crime", icon: ShieldAlert, title: "Crime ou violência", description: "Crime em andamento, ameaça, agressão, roubo ou situação de perigo imediato.", service: "policia", color: "blue" },
  { id: "incendio", icon: Flame, title: "Incêndio ou resgate", description: "Fogo, explosão, acidente, afogamento, desabamento ou necessidade de resgate.", service: "bombeiros", color: "red" },
  { id: "alagamento", icon: Siren, title: "Alagamento ou risco", description: "Enchente, alagamento, deslizamento, queda de árvore ou outro risco da Defesa Civil.", service: "defesa", color: "orange" },
  { id: "crianca", icon: Users, title: "Criança ou adolescente", description: "Violência, abuso, abandono, negligência ou violação de direitos.", service: "conselho", color: "purple" },
  { id: "mulher", icon: Shield, title: "Violência contra a mulher", description: "Ameaça, agressão, violência doméstica ou necessidade de orientação.", service: "mulher", color: "pink" },
  { id: "transito", icon: Car, title: "Acidente de trânsito", description: "Acidente com feridos, capotamento ou ocorrência em rodovia.", service: "samu", color: "indigo" },
  { id: "outro", icon: Search, title: "Não sei qual serviço", description: "Abra o guia ou pesquise uma situação para encontrar o canal adequado.", service: null, color: "cyan" }
];

const nearbyCategories = [
  { label: "Hospitais", query: "hospital" },
  { label: "Delegacias", query: "delegacia" },
  { label: "Bombeiros", query: "corpo de bombeiros" },
  { label: "UBS", query: "UBS" },
  { label: "Guarda Municipal", query: "guarda municipal" },
  { label: "Defesa Civil", query: "defesa civil" }
];

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
  const [showAllServices, setShowAllServices] = useState(false);
  const [selected, setSelected] = useState(null);
  const [confirmCallTarget, setConfirmCallTarget] = useState(null);
  const [recent, setRecent] = useState(getInitialRecent);
  const [toast, setToast] = useState("");
  const [theme, setTheme] = useState(getInitialTheme);
  const [accessibilityMode, setAccessibilityMode] = useState(() => localStorage.getItem("accessibilityMode") === "true");
  const [favorites, setFavorites] = useState(getInitialFavorites);
  const [sosOpen, setSosOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [locationLabel, setLocationLabel] = useState("Sua região");
  const [locating, setLocating] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceAssistantOpen, setVoiceAssistantOpen] = useState(false);
  const [situationOpen, setSituationOpen] = useState(false);
  const [selectedSituation, setSelectedSituation] = useState(null);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [contactsError, setContactsError] = useState(false);
  const [myPos, setMyPos] = useState(null);          // { lat, lon } da localização atual
  const [posStatus, setPosStatus] = useState("idle"); // idle | loading | ok | denied
  const [sharedWithMe, setSharedWithMe] = useState([]); // localizações que outras pessoas compartilharam comigo
  const [myShare, setMyShare] = useState(null);         // minha localização publicada no app (ou null)
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [online, setOnline] = useState(() => typeof navigator === "undefined" ? true : navigator.onLine);
  const [voiceStatus, setVoiceStatus] = useState("Toque no microfone e diga o que precisa.");
  const nativeVoiceRef = React.useRef(false);
  const voiceListenerRef = React.useRef(null);
  const recognitionRef = React.useRef(null);
  const touchStartRef = React.useRef(null);
  const touchSwipedRef = React.useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current && recognitionRef.current.stop();
      if (voiceListenerRef.current) voiceListenerRef.current.remove().catch(() => {});
      TextToSpeech.stop().catch(() => {});
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
      else if (authOpen) setAuthOpen(false);
      else if (contactsOpen) setContactsOpen(false);
      else if (selected) setSelected(null);
      else if (sosOpen) setSosOpen(false);
      else if (menuOpen) setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmCallTarget, authOpen, contactsOpen, selected, sosOpen, menuOpen]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle("accessibility-mode", accessibilityMode);
    localStorage.setItem("accessibilityMode", String(accessibilityMode));
  }, [accessibilityMode]);

  // Login opcional (Firebase): acompanha entrada/saída. A sessão é lembrada entre aberturas do app.
  useEffect(() => watchAuth(setUser), []);

  // Contatos de emergência ficam na conta (Firestore) e também em cache para uso offline.
  const uid = user?.uid;
  useEffect(() => {
    setContactsError(false);
    if (!uid) { setEmergencyContacts([]); return; }
    return watchContacts(
      uid,
      (list, fromCache) => {
        setContactsError(false);
        if (list !== null) { setEmergencyContacts(list); return; }

        // Conta sem contatos ainda: leva os que a pessoa tinha salvo neste aparelho (versões antigas do app).
        // Só com resposta do servidor: sem internet não dá para saber se a conta já tem contatos.
        let legacy = [];
        if (!fromCache) {
          try { legacy = JSON.parse(localStorage.getItem("emergencyContacts") || "[]"); } catch { legacy = []; }
        }
        if (Array.isArray(legacy) && legacy.length) {
          const migrated = legacy.slice(0, 5);
          setEmergencyContacts(migrated);
          saveContacts(uid, user?.name, migrated).then(() => localStorage.removeItem("emergencyContacts")).catch(() => {});
        } else {
          setEmergencyContacts([]);
        }
      },
      () => setContactsError(true)
    );
  }, [uid]);

  const persistContacts = (next) => {
    setEmergencyContacts(next);
    saveContacts(uid, user?.name, next).catch(() => setToast("Não foi possível salvar na sua conta. Verifique a conexão."));
  };

  const openAuth = () => {
    if (!isAuthConfigured) { setToast("O login ainda não foi configurado neste app"); return; }
    setMenuOpen(false);
    setAuthOpen(true);
  };

  const handleAuthSuccess = (profile, isNewAccount) => {
    setUser(profile);
    setAuthOpen(false);
    setToast(isNewAccount ? `Conta criada! Bem-vindo, ${profile.name.split(" ")[0]}` : `Bem-vindo de volta, ${profile.name.split(" ")[0]}`);
  };

  const startLogout = async () => {
    setMenuOpen(false);
    setContactsOpen(false);
    try { await signOutUser(); } catch { /* segue: limpamos a tela de qualquer jeito */ }
    setUser(null);
    setToast("Você saiu da conta");
  };

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

  // Busca tolerante a erros: "puliça", "polisia" e "bonbeiro" também acham o serviço certo.
  const searchResult = useMemo(() => searchServices(services, search), [search]);
  const filtered = searchResult.items;

  const popularServices = useMemo(
    () => popularServiceIds.map(id => services.find(s => s.id === id)).filter(Boolean),
    []
  );

  const favoriteServices = useMemo(
    () => favorites.map(id => services.find(s => s.id === id)).filter(Boolean),
    [favorites]
  );

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

  const requestCall = (service) => {
    if (!service) return;
    const isRealNumber = /\d/.test(service.number);
    if (!isRealNumber) {
      setToast(`Consulte o telefone da Central de Libras da sua cidade`);
      return;
    }
    setConfirmCallTarget(service);
  };

  const call = () => requestCall(selected);

  const confirmCall = () => {
    if (!confirmCallTarget) return;
    const service = confirmCallTarget;
    setConfirmCallTarget(null);
    setSelected(null);
    setToast(`Abrindo chamada para ${service.number}`);
    window.location.href = `tel:${String(service.number).replace(/\D/g, "")}`;
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
    requestCall(service);
  };

  const shareCurrentLocation = () => {
    const share = (lat, lon) => {
      const mapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
      const text = `Minha localização atual: ${mapsUrl}`;
      if (navigator.share) navigator.share({ title: "Minha localização", text, url: mapsUrl }).catch(() => {});
      else if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => setToast("Localização copiada"));
      else window.open(mapsUrl, "_blank");
    };
    if (!navigator.geolocation) { setToast("Localização não disponível neste aparelho"); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => share(coords.latitude, coords.longitude),
      () => setToast("Permita o acesso à localização para compartilhar"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Localização para compartilhar com a rede de contatos. Buscada ao abrir "Meus contatos",
  // assim os botões já têm o link pronto (abrir WhatsApp/SMS exige um toque direto do usuário).
  const fetchMyPosition = () => {
    if (!navigator.geolocation) { setPosStatus("denied"); return; }
    setPosStatus("loading");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setMyPos({ lat: coords.latitude, lon: coords.longitude }); setPosStatus("ok"); },
      () => setPosStatus("denied"),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  };

  useEffect(() => {
    if (contactsOpen && uid) fetchMyPosition();
    else { setMyPos(null); setPosStatus("idle"); }
  }, [contactsOpen, uid]);

  const locationText = myPos
    ? `${user?.name ? user.name + " compartilhou" : "Compartilhei"} a localização atual: https://www.google.com/maps?q=${myPos.lat},${myPos.lon}`
    : "";

  // Telefone no formato internacional para o WhatsApp (assume Brasil quando vier só DDD + número).
  const waPhone = (phone) => {
    const d = String(phone).replace(/\D/g, "");
    return d.length <= 11 ? `55${d}` : d;
  };
  const whatsappLocationUrl = (phone) => `https://wa.me/${waPhone(phone)}?text=${encodeURIComponent(locationText)}`;
  const smsLocationUrl = (phone) => `sms:${String(phone).replace(/[^\d+]/g, "")}?&body=${encodeURIComponent(locationText)}`;

  const shareLocationWithAll = () => {
    if (!locationText) return;
    if (navigator.share) navigator.share({ title: "Minha localização", text: locationText }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(locationText).then(() => setToast("Localização copiada. Cole na conversa que quiser"));
    else window.open(`https://wa.me/?text=${encodeURIComponent(locationText)}`, "_blank");
  };

  // Localizações recebidas e estado do meu compartilhamento (só com e-mail confirmado).
  const emailOk = !!user?.emailVerified;
  useEffect(() => {
    if (!contactsOpen || !uid || !emailOk || !user?.email) { setSharedWithMe([]); setMyShare(null); return; }
    const stopA = watchSharedWithMe(user.email, setSharedWithMe, () => setSharedWithMe([]));
    const stopB = watchMyShare(uid, setMyShare);
    return () => { stopA(); stopB(); };
  }, [contactsOpen, uid, emailOk]);

  const contactEmails = emergencyContacts.map(c => (c.email || "").trim().toLowerCase()).filter(Boolean);

  const publishMyLocation = async () => {
    if (!myPos) return;
    if (!contactEmails.length) { setToast("Adicione o e-mail de um contato (ícone de e-mail no cartão dele)"); return; }
    try {
      const r = await publishLocation(uid, user.name, user.email, myPos.lat, myPos.lon, contactEmails);
      setToast(r === "sent" ? `Localização enviada para ${contactEmails.length} contato(s) no app` : "Sem internet: será enviada quando voltar a conexão");
    } catch { setToast("Não foi possível compartilhar agora"); }
  };

  const stopMyShare = async () => {
    try { await stopSharingLocation(uid); setToast("Você parou de compartilhar a localização"); }
    catch { setToast("Não foi possível parar agora. Tente de novo"); }
  };

  const editContactEmail = (id) => {
    const current = emergencyContacts.find(c => c.id === id);
    const email = window.prompt("E-mail do contato (a pessoa precisa ter conta no app com este e-mail). Deixe vazio para remover:", current?.email || "");
    if (email === null) return;
    const clean = email.trim().toLowerCase();
    if (clean && !/^\S+@\S+\.\S+$/.test(clean)) { setToast("Esse e-mail não parece válido"); return; }
    persistContacts(emergencyContacts.map(c => c.id === id ? { ...c, email: clean } : c));
  };

  const resendVerificationEmail = async () => {
    setVerifyBusy(true);
    try { await resendVerification(); setToast("E-mail de confirmação enviado. Confira também o spam"); }
    catch { setToast("Não foi possível enviar agora. Tente em instantes"); }
    finally { setVerifyBusy(false); }
  };

  const checkVerified = async () => {
    setVerifyBusy(true);
    try {
      const profile = await refreshUser();
      if (profile) setUser(profile);
      setToast(profile?.emailVerified ? "E-mail confirmado!" : "Ainda não confirmado. Abra o link que enviamos por e-mail");
    } catch { setToast("Não foi possível verificar agora"); }
    finally { setVerifyBusy(false); }
  };

  const timeAgo = (ms) => {
    const min = Math.max(0, Math.round((Date.now() - ms) / 60000));
    if (min < 1) return "agora mesmo";
    if (min < 60) return `há ${min} min`;
    const h = Math.round(min / 60);
    return h < 24 ? `há ${h} h` : `há ${Math.round(h / 24)} dia(s)`;
  };

  const addEmergencyContact = () => {
    const name = window.prompt("Nome do contato de emergência:");
    if (!name) return;
    const phone = window.prompt("Telefone do contato:");
    if (!phone) return;
    const emailRaw = (window.prompt("E-mail do contato (opcional). Se ele tiver conta no app com este e-mail, receberá sua localização aqui dentro:") || "").trim().toLowerCase();
    const email = /^\S+@\S+\.\S+$/.test(emailRaw) ? emailRaw : "";
    persistContacts([...emergencyContacts, { id: `${Date.now()}`, name: name.trim(), phone: phone.trim(), ...(email ? { email } : {}) }].slice(-5));
    setToast(`${name} adicionado aos contatos de emergência`);
  };

  const removeEmergencyContact = (id) => persistContacts(emergencyContacts.filter(item => item.id !== id));

  const openMapsSearch = (query) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query + " perto de mim")}`;
    window.open(url, "_blank");
  };

  const openSituation = (situation) => {
    setSelectedSituation(situation);
    setSituationOpen(true);
    if (accessibilityMode) speakText(`${situation.title}. ${situation.description}`);
  };

  const useSituation = (situation) => {
    setSituationOpen(false);
    if (situation.service) {
      const service = services.find(s => s.id === situation.service);
      if (service) { openService(service); return; }
    }
    setActive("guia");
    setToast("Use a busca ou o guia para encontrar o serviço adequado");
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

  const swipePages = ["inicio", "mapa", "guia", "salvos", "sobre", "feedback"];

  const handleTouchStart = (e) => {
    if (!e.touches?.length) return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      edge: touch.clientX <= 28
    };
    touchSwipedRef.current = false;
  };

  const handleTouchMove = (e) => {
    if (!touchStartRef.current || !e.touches?.length) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    if (Math.abs(dx) > 18 && Math.abs(dx) > Math.abs(dy) * 1.15) {
      touchSwipedRef.current = true;
      if (e.cancelable) e.preventDefault();
    }
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const start = touchStartRef.current;
    const touch = e.changedTouches?.[0];
    touchStartRef.current = null;
    if (!touch) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const duration = Date.now() - start.time;
    const isHorizontal = Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.2;
    const isQuickEnough = duration < 700;
    if (!isHorizontal || !isQuickEnough) return;

    if (menuOpen) {
      if (dx < -70) setMenuOpen(false);
      return;
    }

    // Puxar da borda esquerda abre o menu lateral.
    if (start.edge && dx > 70) {
      setMenuOpen(true);
      return;
    }

    const currentIndex = swipePages.indexOf(active);
    if (currentIndex === -1) return;
    const nextIndex = dx < 0 ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < swipePages.length) {
      setActive(swipePages[nextIndex]);
      setSosOpen(false);
      setSelected(null);
      setVoiceAssistantOpen(false);
    }
  };

  const speakText = async (text) => {
    if (!text) return;
    try {
      await TextToSpeech.stop();
      await TextToSpeech.speak({
        text,
        lang: "pt-BR",
        rate: 0.92,
        pitch: 1,
        volume: 1,
        queueStrategy: 0
      });
      return;
    } catch {
      // Fallback para navegador/WebView sem o plugin nativo.
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 0.92;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const describeCurrentScreen = () => {
    const screenNames = {
      inicio: "Início. Emergência com Polícia, SAMU e Bombeiros. Abaixo você encontra busca, serviços mais usados e atendimentos recentes. Use o botão de microfone para falar com o assistente.",
      mapa: `Serviços próximos. ${locationLabel === "Sua região" ? "Sua região ainda não foi identificada. Use o botão Atualizar localização." : `Sua região é ${locationLabel}.`} Você pode abrir hospitais, delegacias, bombeiros, UBS e outros locais no mapa.`,
      guia: "Guia de serviços. Abra cada item para ouvir para que ele serve e o número de contato.",
      salvos: favorites.length ? `Serviços salvos. Você tem ${favorites.length} serviço${favorites.length === 1 ? " salvo" : "s salvos"}. Toque em um item para ouvir seus detalhes.` : "Serviços salvos. Você ainda não tem favoritos. Salve um serviço usando a estrela.",
      feedback: "Sugestões e avaliações. Dê uma nota de uma a cinco estrelas, escolha o assunto e escreva sua mensagem para ajudar a melhorar o aplicativo.",
      sobre: "Sobre o CHAMOU, FALOU. Um aplicativo para facilitar o acesso a serviços públicos e de emergência. Esta versão possui um modo de acessibilidade com narração e comandos de voz."
    };
    const text = screenNames[active] || "Tela atual do aplicativo.";
    setVoiceStatus(text);
    speakText(text);
  };

  useEffect(() => {
    if (!accessibilityMode || loading || voiceAssistantOpen) return;
    const timer = setTimeout(() => describeCurrentScreen(), 250);
    return () => clearTimeout(timer);
  }, [active, accessibilityMode, loading]);

  const executeVoiceCommand = (rawCommand) => {
    const command = normalizeText(rawCommand || "").trim();
    if (!command) return;

    if (command.includes("parar") || command.includes("silencio") || command.includes("pare de falar")) {
      TextToSpeech.stop().catch(() => {});
      window.speechSynthesis?.cancel();
      setVoiceStatus("Voz interrompida.");
      return;
    }

    if (command.includes("ler tela") || command.includes("leia a tela") || command.includes("onde estou")) {
      describeCurrentScreen();
      return;
    }

    if (command.includes("inicio") || command.includes("voltar para inicio")) {
      setActive("inicio");
      setMenuOpen(false);
      const text = "Início. Precisa de ajuda? Diga o nome do serviço ou uma situação, como polícia, SAMU ou incêndio.";
      setVoiceStatus(text);
      speakText(text);
      return;
    }

    if (command.includes("guia")) {
      setActive("guia");
      setMenuOpen(false);
      speakText("Guia de serviços aberto. Diga o nome do serviço para ouvir mais informações.");
      return;
    }

    if (command.includes("salvos") || command.includes("favoritos")) {
      setActive("salvos");
      setMenuOpen(false);
      speakText(favorites.length ? `Serviços salvos. Você tem ${favorites.length} favoritos.` : "Você ainda não tem serviços favoritos.");
      return;
    }

    if (command.includes("sugest") || command.includes("avali") || command.includes("feedback")) {
      setActive("feedback");
      setMenuOpen(false);
      speakText("Sugestões e avaliações. Dê uma nota e escreva sua mensagem.");
      return;
    }

    if (command.includes("sobre")) {
      setActive("sobre");
      setMenuOpen(false);
      speakText("Sobre o CHAMOU, FALOU. Um aplicativo para facilitar o acesso a serviços públicos e de emergência.");
      return;
    }

    if (command.includes("proximo") || command.includes("servicos proximos") || command.includes("localizacao")) {
      setActive("mapa");
      setMenuOpen(false);
      speakText("Serviços próximos. Você pode atualizar sua localização nesta tela.");
      return;
    }

    if (command.includes("compartilhar localizacao") || command.includes("enviar localizacao")) {
      shareCurrentLocation();
      speakText("Vou preparar o compartilhamento da sua localização.");
      return;
    }

    const situationMatch = situationGuides.find(item => {
      const hay = normalizeText(`${item.title} ${item.description}`);
      return hay.includes(command) || command.includes(normalizeText(item.title));
    });
    if (situationMatch) {
      openSituation(situationMatch);
      speakText(`${situationMatch.title}. ${situationMatch.description}`);
      return;
    }

    if (command.includes("sos") || command.includes("emergencia")) {
      setSosOpen(true);
      speakText("Menu SOS aberto. Escolha Polícia, SAMU, Bombeiros ou compartilhe sua localização.");
      return;
    }

    const matchedService = services.find(service => {
      const hay = normalizeText(`${service.title} ${(service.keywords || []).join(" ")}`);
      return hay.includes(command) || command.includes(normalizeText(service.title));
    });

    if (matchedService) {
      setActive("inicio");
      setSearch("");
      setMenuOpen(false);
      openService(matchedService);
      const announcement = `${matchedService.title}. ${matchedService.subtitle}. Número ${matchedService.number}.`;
      setVoiceStatus(announcement);
      speakText(announcement);
      return;
    }

    const searchCommand = command.replace(/^(buscar|procure|quero|preciso de)\s+/, "").trim();
    if (searchCommand) {
      setActive("inicio");
      setMenuOpen(false);
      setSearch(searchCommand);
      const results = searchServices(services, searchCommand).items;
      if (results.length) {
        const first = results[0];
        const answer = `${results.length} serviço${results.length > 1 ? "s" : ""} encontrado${results.length > 1 ? "s" : ""}. O primeiro é ${first.title}, número ${first.number}.`;
        setVoiceStatus(answer);
        speakText(answer);
      } else {
        const answer = `Não encontrei um serviço para ${searchCommand}. Tente dizer polícia, SAMU, bombeiros, Procon ou outro serviço.`;
        setVoiceStatus(answer);
        speakText(answer);
      }
    }
  };

  const toggleAccessibilityMode = () => {
    setAccessibilityMode(current => {
      const next = !current;
      const text = next
        ? "Modo acessibilidade ativado. O aplicativo vai narrar as telas e aumentar o conforto de leitura e toque."
        : "Modo acessibilidade desativado.";
      setVoiceStatus(text);
      speakText(text);
      return next;
    });
  };

  const startVoiceAssistant = async () => {
    if (listening) {
      try {
        await SpeechRecognition.stop();
      } catch {}
      recognitionRef.current?.stop();
      setListening(false);
      setVoiceStatus("Escuta encerrada.");
      return;
    }

    const isNative = !!window.Capacitor?.isNativePlatform?.();
    if (isNative) {
      try {
        const available = await SpeechRecognition.available();
        if (!available.available) throw new Error("Indisponível");
        const permissions = await SpeechRecognition.checkPermissions();
        if (permissions.speechRecognition !== "granted") {
          const requested = await SpeechRecognition.requestPermissions();
          if (requested.speechRecognition !== "granted") throw new Error("Permissão negada");
        }
        nativeVoiceRef.current = true;
        if (voiceListenerRef.current) await voiceListenerRef.current.remove().catch(() => {});
        voiceListenerRef.current = await SpeechRecognition.addListener("listeningState", data => {
          setListening(data.status === "started");
        });
        setListening(true);
        setVoiceStatus("Estou ouvindo. Diga, por exemplo: Polícia, SAMU, abrir guia ou ler tela.");
        await speakText("Estou ouvindo. Diga, por exemplo, polícia, SAMU, abrir guia ou ler tela.");
        const result = await SpeechRecognition.start({
          language: "pt-BR",
          maxResults: 3,
          partialResults: false,
          popup: false
        });
        const transcript = result?.matches?.[0] || "";
        setListening(false);
        if (transcript) executeVoiceCommand(transcript);
        return;
      } catch {
        nativeVoiceRef.current = false;
        setListening(false);
      }
    }

    const SpeechRecognitionWeb = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionWeb) {
      const text = "O assistente de voz precisa de reconhecimento de fala. No Android, reinstale o aplicativo depois de sincronizar as permissões do microfone.";
      setVoiceStatus(text);
      speakText(text);
      return;
    }

    const recognition = new SpeechRecognitionWeb();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      const transcript = e.results?.[0]?.[0]?.transcript || "";
      setListening(false);
      executeVoiceCommand(transcript);
    };
    recognition.onerror = () => {
      setListening(false);
      const text = "Não entendi. Tente falar novamente.";
      setVoiceStatus(text);
      speakText(text);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    setVoiceStatus("Estou ouvindo. Fale agora.");
    await speakText("Estou ouvindo. Fale agora.");
    recognition.start();
  };

  const toggleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setToast("Busca por voz não é suportada neste navegador");
      return;
    }
    if (listening) {
      recognitionRef.current && recognitionRef.current.stop();
      if (voiceListenerRef.current) voiceListenerRef.current.remove().catch(() => {});
      TextToSpeech.stop().catch(() => {});
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

  if (loading) return <main className={`app-shell${accessibilityMode ? " accessibility-active" : ""}`}><Skeleton /></main>;

  return (
    <main className={`app-shell${accessibilityMode ? " accessibility-active" : ""}`}>
      <div
        className="mobile-frame"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <header className="topbar brand-header">
          <button className="icon-btn header-icon-btn" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}><Menu size={23}/></button>
          <div className="brand brand-lockup" aria-label="CHAMOU, FALOU">
            <img className="brand-logo" src={logoUrl} alt="CHAMOU, FALOU" width="98" height="50" draggable="false" />
          </div>
          <div className="topbar-actions">
            <button
              className="icon-btn header-icon-btn"
              aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
              onClick={toggleTheme}
            >
              <SunMoon size={21}/>
            </button>
            <button className={`icon-btn header-icon-btn ${accessibilityMode ? "accessibility-active-btn" : ""}`} aria-label={accessibilityMode ? "Desativar modo acessibilidade" : "Ativar modo acessibilidade"} aria-pressed={accessibilityMode} onClick={toggleAccessibilityMode}>
              <Eye size={21}/>
            </button>
          </div>
        </header>

        {!online && (
          <div className="offline-banner" role="status"><Wifi size={15}/> Você está offline. Os serviços essenciais continuam disponíveis.</div>
        )}

        <AnimatePresence>
          {menuOpen && (
            <motion.div className="drawer-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setMenuOpen(false)}>
              <motion.aside
                className="side-drawer"
                initial={{x:-320}}
                animate={{x:0}}
                exit={{x:-320}}
                drag="x"
                dragConstraints={{ left: -320, right: 0 }}
                dragElastic={0.08}
                onDragEnd={(_, info) => { if (info.offset.x < -80 || info.velocity.x < -450) setMenuOpen(false); }}
                onClick={e => e.stopPropagation()}
              >
                <div className="drawer-head">
                  <div className="brand drawer-brand"><span>CHAMOU,</span><b>FALOU</b></div>
                  <button className="icon-btn" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}><X size={22}/></button>
                </div>
                <p className="drawer-label">NAVEGAÇÃO</p>
                {[["inicio",Home,"Início"],["mapa",MapPin,"Próximos"],["guia",ClipboardList,"Guia"],["salvos",Star,"Salvos"],["feedback",MessageSquare,"Sugestões e avaliações"],["sobre",Info,"Sobre"]].map(([id,Icon,label]) => (
                  <button key={id} className={`drawer-item ${active===id ? "active" : ""}`} onClick={() => {setActive(id); setMenuOpen(false);}}>
                    <Icon size={20}/> {label}
                  </button>
                ))}

                <p className="drawer-label drawer-label-spaced">CONTA (OPCIONAL)</p>
                {user ? (
                  <div className="account-card">
                    <div className="account-row">
                      <span className="account-avatar placeholder" aria-hidden="true">{(user.name || "?").charAt(0).toUpperCase()}</span>
                      <div><strong>{user.name}</strong>{user.email && <small>{user.email}</small>}</div>
                    </div>
                    <button className="secondary-btn" onClick={() => { setMenuOpen(false); setContactsOpen(true); }}><Users size={17}/> Minha rede de contatos</button>
                    <button className="secondary-btn" onClick={startLogout}><LogOut size={17}/> Sair</button>
                  </div>
                ) : (
                  <div className="account-card">
                    <small className="account-help">Você não precisa de conta para usar o app. Crie uma só se quiser cadastrar sua rede de contatos de confiança.</small>
                    <button className="secondary-btn" onClick={openAuth}><LogIn size={17}/> Entrar ou criar conta</button>
                  </div>
                )}
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

              {search.trim() ? (
                <>
                  <div className="section-heading">
                    <h2>Resultados</h2>
                    <span>{filtered.length} encontrados</span>
                  </div>
                  {searchResult.corrected && (
                    <p className="search-hint" role="status">
                      <Search size={14}/>
                      <span>Entendi “{search.trim()}” como <strong>{searchResult.suggestions.slice(0, 2).join(" / ")}</strong>.</span>
                    </p>
                  )}
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
                </>
              ) : (
                <>
                  <ChatBot
                    services={services}
                    situationGuides={situationGuides}
                    onOpenService={openService}
                    speak={accessibilityMode ? speakText : undefined}
                  />

                  <section className="situation-section" aria-labelledby="situation-title">
                    <div className="section-heading emergency-heading">
                      <div>
                        <p className="section-kicker">ORIENTAÇÃO RÁPIDA</p>
                        <h2 id="situation-title">O que aconteceu?</h2>
                      </div>
                      <span>Escolha uma situação</span>
                    </div>
                    <div className="situation-grid">
                      {situationGuides.map(item => {
                        const Icon = item.icon;
                        return <button key={item.id} className="situation-card" onClick={() => openSituation(item)}>
                          <span className={`situation-icon ${item.color}`}><Icon size={21}/></span>
                          <span><strong>{item.title}</strong><small>{item.description}</small></span>
                        </button>;
                      })}
                    </div>
                  </section>

                  <section className="emergency-section" aria-labelledby="emergency-title">
                    <div className="section-heading emergency-heading">
                      <div>
                        <p className="section-kicker">ATENDIMENTO IMEDIATO</p>
                        <h2 id="emergency-title">Emergência</h2>
                      </div>
                      <span>3 canais</span>
                    </div>
                    <div className="emergency-grid">
                      {sosOptions.map(id => {
                        const service = services.find(s => s.id === id);
                        return (
                          <button key={id} className={`emergency-card ${service.tone}`} onClick={() => openService(service)}>
                            <span className="emergency-icon"><service.icon size={22}/></span>
                            <span className="emergency-copy"><strong>{service.title}</strong><small>{service.subtitle}</small></span>
                            <b>{service.number}</b>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  {favoriteServices.length > 0 && (
                    <section className="home-section" aria-labelledby="favorites-home-title">
                      <div className="section-heading">
                        <h2 id="favorites-home-title">⭐ Meus serviços</h2>
                        <button className="section-link" onClick={() => setActive("salvos")}>Ver todos</button>
                      </div>
                      <div className="saved-quick-list">
                        {favoriteServices.slice(0, 3).map(service => (
                          <div className="saved-quick-card" key={service.id}>
                            <button className="saved-quick-main" onClick={() => openService(service)} aria-label={`Abrir ${service.title}`}>
                              <span className={`saved-quick-icon ${service.tone}`}><service.icon size={19}/></span>
                              <span><strong>{service.title}</strong><small>{service.number}</small></span>
                            </button>
                            <button className="saved-call-btn" onClick={() => requestCall(service)} aria-label={`Ligar para ${service.title}`}>
                              <Phone size={17}/><span>Ligar</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <section className="home-section" aria-labelledby="popular-title">
                    <div className="section-heading">
                      <div>
                        <p className="section-kicker">ACESSO RÁPIDO</p>
                        <h2 id="popular-title">Mais usados</h2>
                      </div>
                      <span>{services.length} serviços</span>
                    </div>
                    <div className="service-grid">
                      {popularServices.map(s => (
                        <ServiceCard
                          key={s.id}
                          service={s}
                          onOpen={openService}
                          isFavorite={favorites.includes(s.id)}
                          onToggleFavorite={toggleFavorite}
                        />
                      ))}
                    </div>
                    <button className="all-services-btn" onClick={() => setShowAllServices(v => !v)}>
                      {showAllServices ? "Mostrar menos" : "Ver todos os serviços"}
                      <ChevronRight size={17} className={showAllServices ? "rotate-90" : ""}/>
                    </button>
                    {showAllServices && (
                      <div className="service-grid all-services-grid">
                        {services.filter(s => !popularServiceIds.includes(s.id)).map(s => (
                          <ServiceCard
                            key={s.id}
                            service={s}
                            onOpen={openService}
                            isFavorite={favorites.includes(s.id)}
                            onToggleFavorite={toggleFavorite}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                </>
              )}

              {!search.trim() && <>
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
              </>}
            </motion.section>
          )}

          {active === "mapa" && (
            <motion.section key="map" initial={{opacity:0,x:15}} animate={{opacity:1,x:0}} className="content simple-page">
              <p className="eyebrow">LOCALIZAÇÃO</p>
              <h1>Serviços próximos</h1>
              <p className="muted-text">Encontre rapidamente locais de atendimento próximos. O botão abre o mapa do aparelho para mostrar rotas e horários atualizados.</p>
              <div className="location-status-card"><LocateFixed size={22}/><div><strong>{locationLabel}</strong><span>{online ? "Localização pode ser atualizada quando você permitir." : "Sem internet: a localização pode ficar indisponível."}</span></div></div>
              <button className="primary-btn" onClick={locateUser} disabled={locating}>
                {locating ? <Loader2 size={19} className="spin"/> : <MapPin size={19}/>}
                {locating ? "Localizando..." : "Atualizar localização"}
              </button>
              <div className="nearby-grid">
                {nearbyCategories.map(item => <button key={item.label} className="nearby-card" onClick={() => openMapsSearch(item.query)}><MapPin size={18}/><span><strong>{item.label}</strong><small>Pesquisar no mapa</small></span><ExternalLink size={16}/></button>)}
              </div>
              <button className="secondary-btn location-share-btn" onClick={shareCurrentLocation}><Share2 size={18}/> Compartilhar minha localização</button>
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
                <div className="empty saved-empty">
                  <Star size={22}/>
                  <strong>Seus serviços favoritos aparecerão aqui.</strong>
                  <span>Toque na estrela de um serviço para salvá-lo e ter acesso rápido quando precisar.</span>
                </div>
              ) : (
                <div className="saved-list">
                  {favoriteServices.map(s => (
                    <div className="saved-list-card" key={s.id}>
                      <button className="saved-list-main" onClick={() => openService(s)} aria-label={`Abrir ${s.title}`}>
                        <span className={`saved-quick-icon ${s.tone}`}><s.icon size={20}/></span>
                        <span><strong>{s.title}</strong><small>{s.subtitle} · {s.number}</small></span>
                      </button>
                      <button className="saved-call-btn" onClick={() => requestCall(s)} aria-label={`Ligar para ${s.title}`}>
                        <Phone size={17}/><span>Ligar</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.section>
          )}

          {active === "feedback" && (
            <motion.section key="feedback" initial={{opacity:0,x:15}} animate={{opacity:1,x:0}} className="content simple-page feedback-page">
              <FeedbackPage user={user} setToast={setToast} speak={accessibilityMode ? speakText : undefined} />
            </motion.section>
          )}

          {active === "sobre" && (
            <motion.section key="about" initial={{opacity:0,x:15}} animate={{opacity:1,x:0}} className="content simple-page about-page">
              <p className="eyebrow">SOBRE O APP</p>
              <h1>CHAMOU, FALOU</h1>
              <p className="muted-text about-lead">
                Um aplicativo criado para facilitar o acesso da população a serviços públicos e de emergência em um único lugar.
              </p>

              <div className="about-card">
                <HeartHandshake size={20}/>
                <div>
                  <strong>Nossa missão</strong>
                  <span>Facilitar o acesso à ajuda quando ela mais é necessária, com uma experiência simples, rápida e fácil de entender.</span>
                </div>
              </div>

              <div className="about-card">
                <Search size={20}/>
                <div>
                  <strong>Como funciona</strong>
                  <span>O usuário pode pesquisar serviços, acessar os principais atendimentos, salvar favoritos e consultar rapidamente os canais disponíveis para cada necessidade.</span>
                </div>
              </div>

              <div className="about-card">
                <Shield size={20}/>
                <div>
                  <strong>Feito para ser simples</strong>
                  <span>O projeto foi pensado para reduzir a quantidade de informações que o usuário precisa procurar, especialmente em momentos de pressa ou preocupação.</span>
                </div>
              </div>

              <div className="about-card">
                <ShieldAlert size={20}/>
                <div>
                  <strong>Informação e segurança</strong>
                  <span>O CHAMOU, FALOU é uma ferramenta de apoio e não substitui os canais oficiais dos órgãos públicos. Antes de uma versão de produção, os contatos e informações devem ser validados e mantidos atualizados.</span>
                </div>
              </div>

              <button className="secondary-btn about-feedback-btn" onClick={() => setActive("feedback")}><MessageSquare size={18}/> Enviar sugestão ou avaliação</button>

              <div className="about-card about-signature">
                <div>
                  <strong>CHAMOU, FALOU</strong>
                  <span>Encontrou. Acionou.</span>
                </div>
              </div>

              <div className="about-meta">
                <span>Versão 1.3.0 · Protótipo funcional</span>
                <span>Desenvolvido com foco em simplicidade, acessibilidade e rapidez.</span>
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
                <button className="sos-menu-item" onClick={shareCurrentLocation}><Share2 size={18}/><span>Compartilhar localização</span><ChevronRight size={15}/></button>
                <button className="sos-menu-item" onClick={() => { setSosOpen(false); setContactsOpen(true); }}><Users size={18}/><span>Minha rede de emergência</span><ChevronRight size={15}/></button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <motion.button
          className="sos-fab"
          aria-label="Emergência — ligação rápida"
          whileTap={{ scale: 0.94 }}
          onClick={() => { setVoiceAssistantOpen(false); setSosOpen(o => !o); }}
        >
          {sosOpen ? <X size={24}/> : <Siren size={24}/>}
        </motion.button>

        <AnimatePresence>
          {voiceAssistantOpen && (
            <motion.div
              className="voice-assistant-panel"
              initial={{ opacity: 0, y: 16, scale: .96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: .96 }}
              role="dialog"
              aria-label="Assistente de voz"
            >
              <div className="voice-assistant-head">
                <div>
                  <strong>Assistente de voz</strong>
                  <span>Acessibilidade</span>
                </div>
                <button className="icon-btn" aria-label="Fechar assistente de voz" onClick={() => setVoiceAssistantOpen(false)}><X size={20}/></button>
              </div>
              <p className="voice-status" aria-live="polite">{voiceStatus}</p>
              <button className={`accessibility-mode-toggle${accessibilityMode ? " active" : ""}`} onClick={toggleAccessibilityMode} aria-pressed={accessibilityMode}>
                <Accessibility size={20}/>
                <span><strong>{accessibilityMode ? "Modo acessibilidade ativo" : "Ativar modo acessibilidade"}</strong><small>{accessibilityMode ? "Narra as telas e amplia o conforto de leitura." : "Ativa narração automática e alvos de toque maiores."}</small></span>
              </button>

              <div className="voice-assistant-actions">
                <button className={`voice-main-btn${listening ? " listening" : ""}`} onClick={startVoiceAssistant} aria-label={listening ? "Parar de ouvir" : "Falar com o assistente"}>
                  {listening ? <MicOff size={28}/> : <Mic size={28}/>}
                  <span>{listening ? "Parar de ouvir" : "Falar"}</span>
                </button>
                <button className="voice-read-btn" onClick={describeCurrentScreen} aria-label="Ler esta tela em voz alta">
                  <Accessibility size={21}/>
                  <span>Ler tela</span>
                </button>
              </div>
              <small className="voice-examples">Diga: “polícia”, “SAMU”, “abrir guia”, “serviços salvos” ou “ler tela”.</small>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          className={`voice-fab${listening ? " listening" : ""}`}
          aria-label="Abrir assistente de voz"
          whileTap={{ scale: 0.94 }}
          onClick={() => { setSosOpen(false); setVoiceAssistantOpen(v => !v); }}
        >
          {voiceAssistantOpen ? <X size={24}/> : <Mic size={24}/>}
        </motion.button>

        <nav className="bottom-nav" aria-label="Navegação principal">
          <button className={active==="inicio" ? "active" : ""} aria-current={active === "inicio" ? "page" : undefined} onClick={() => setActive("inicio")}><Home size={21}/><span>Início</span></button>
          <button className={active==="mapa" ? "active" : ""} aria-current={active === "mapa" ? "page" : undefined} onClick={() => setActive("mapa")}><MapPin size={21}/><span>Próximos</span></button>
          <button className={active==="guia" ? "active" : ""} aria-current={active === "guia" ? "page" : undefined} onClick={() => setActive("guia")}><ClipboardList size={21}/><span>Guia</span></button>
          <button className={active==="sobre" ? "active" : ""} aria-current={active === "sobre" ? "page" : undefined} onClick={() => setActive("sobre")}><Info size={21}/><span>Sobre</span></button>
        </nav>

        <AnimatePresence>
          {situationOpen && selectedSituation && (
            <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setSituationOpen(false)}>
              <motion.div className="service-modal situation-modal" initial={{y:60,opacity:0}} animate={{y:0,opacity:1}} exit={{y:60,opacity:0}} onClick={e=>e.stopPropagation()}>
                <button className="modal-close" aria-label="Fechar orientação" onClick={() => setSituationOpen(false)}><X/></button>
                <div className={`modal-icon ${selectedSituation.color}`}><selectedSituation.icon size={30}/></div>
                <p className="eyebrow">ORIENTAÇÃO</p>
                <h2>{selectedSituation.title}</h2>
                <p>{selectedSituation.description}</p>
                <div className="guidance-box"><strong>O que fazer agora?</strong><span>Vá para um local seguro, evite se colocar em risco e acione o serviço indicado abaixo.</span></div>
                {selectedSituation.service ? (() => { const service = services.find(s => s.id === selectedSituation.service); return service ? <div className="number-box"><span>Serviço indicado</span><strong>{service.title} · {service.number}</strong></div> : null; })() : null}
                <div className="modal-actions"><button className="secondary-btn" onClick={() => { setSituationOpen(false); setActive("guia"); }}><ClipboardList size={17}/> Abrir guia</button></div>
                {selectedSituation.service && <button className="primary-btn" onClick={() => useSituation(selectedSituation)}><Phone size={19}/> Continuar para o serviço</button>}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {contactsOpen && (
            <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setContactsOpen(false)}>
              <motion.div className="service-modal" initial={{y:60,opacity:0}} animate={{y:0,opacity:1}} exit={{y:60,opacity:0}} onClick={e=>e.stopPropagation()}>
                <button className="modal-close" aria-label="Fechar contatos" onClick={() => setContactsOpen(false)}><X/></button>
                <div className="modal-icon purple"><Users size={30}/></div>
                <p className="eyebrow">REDE DE EMERGÊNCIA</p>
                <h2>Meus contatos</h2>
                <p>Cadastre até cinco pessoas de confiança para acesso rápido durante uma emergência.</p>
                {user ? (
                  <>
                    {contactsError && <p className="auth-error" role="alert">Não foi possível sincronizar agora. Mostrando o que está salvo neste aparelho.</p>}
                    <div className="contact-list">
                      {emergencyContacts.length === 0 ? <div className="empty"><span>Nenhum contato cadastrado.</span></div> : emergencyContacts.map(contact => <div className="contact-card" key={contact.id}><div><strong>{contact.name}</strong><small>{contact.phone}</small>{contact.email && <small className="contact-email">{contact.email}</small>}</div><div><a className="saved-call-btn" href={`tel:${contact.phone.replace(/\D/g, "")}`} aria-label={`Ligar para ${contact.name}`}><Phone size={16}/></a>{myPos && <><a className="saved-call-btn" href={whatsappLocationUrl(contact.phone)} target="_blank" rel="noopener noreferrer" aria-label={`Enviar localização para ${contact.name} no WhatsApp`}><MessageCircle size={16}/></a><a className="saved-call-btn" href={smsLocationUrl(contact.phone)} aria-label={`Enviar localização para ${contact.name} por SMS`}><MessageSquare size={16}/></a></>}<button className="icon-btn" aria-label={`E-mail de ${contact.name}`} onClick={() => editContactEmail(contact.id)}><Mail size={16}/></button><button className="icon-btn" aria-label={`Remover ${contact.name}`} onClick={() => removeEmergencyContact(contact.id)}><X size={16}/></button></div></div>)}
                    </div>
                    {emergencyContacts.length > 0 && (
                      <div className="share-location-box">
                        <button className="primary-btn" onClick={myPos ? shareLocationWithAll : fetchMyPosition} disabled={posStatus === "loading"}>
                          {posStatus === "loading" ? <Loader2 size={19} className="spin"/> : <LocateFixed size={19}/>}
                          {posStatus === "loading" ? "Obtendo localização…" : myPos ? "Compartilhar minha localização" : "Ativar minha localização"}
                        </button>
                        <small className="account-help center">
                          {posStatus === "denied" ? "Permita o acesso à localização no navegador para compartilhar." : myPos ? "Toque em WhatsApp ou SMS ao lado de um contato para enviar só para ele." : "Precisamos da sua localização para montar a mensagem."}
                        </small>
                      </div>
                    )}
                    {!emailOk ? (
                      <div className="verify-box" role="status">
                        <strong>Confirme seu e-mail para enviar e receber localizações</strong>
                        <small>Enviamos um link para {user.email}. Depois de clicar nele, toque em “Já confirmei”.</small>
                        <div className="verify-actions">
                          <button className="secondary-btn" onClick={checkVerified} disabled={verifyBusy}>Já confirmei</button>
                          <button className="secondary-btn" onClick={resendVerificationEmail} disabled={verifyBusy}>Reenviar e-mail</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {myPos && emergencyContacts.length > 0 && (
                          myShare ? (
                            <div className="my-share-box">
                              <small>Você está compartilhando sua localização com seus contatos no app ({timeAgo(myShare.at)}).</small>
                              <div className="verify-actions">
                                <button className="secondary-btn" onClick={publishMyLocation}><LocateFixed size={16}/> Atualizar</button>
                                <button className="secondary-btn" onClick={stopMyShare}><MapPinOff size={16}/> Parar</button>
                              </div>
                            </div>
                          ) : (
                            <button className="secondary-btn" onClick={publishMyLocation}><Users size={18}/> Compartilhar no app com meus contatos</button>
                          )
                        )}
                        <div className="received-box">
                          <p className="eyebrow">LOCALIZAÇÕES RECEBIDAS</p>
                          {sharedWithMe.length === 0 ? (
                            <div className="empty"><span>Ninguém compartilhou a localização com você ainda.</span></div>
                          ) : sharedWithMe.map(loc => (
                            <div className="contact-card" key={loc.uid}>
                              <div><strong>{loc.name}</strong><small>Atualizada {timeAgo(loc.at)}</small></div>
                              <div>
                                <a className="saved-call-btn" href={`https://www.google.com/maps?q=${loc.lat},${loc.lon}`} target="_blank" rel="noopener noreferrer"><MapPin size={16}/> Ver no mapa</a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    <button className="secondary-btn" onClick={addEmergencyContact} disabled={emergencyContacts.length >= 5}><UserPlus size={18}/> {emergencyContacts.length >= 5 ? "Limite de 5 contatos" : "Adicionar contato"}</button>
                    <small className="account-help center">Conectado como {user.email || user.name}.</small>
                  </>
                ) : (
                  <div className="auth-gate">
                    <div className="auth-gate-icon"><UserRound size={24}/></div>
                    <strong>Entre para criar sua rede de contatos</strong>
                    <p>É opcional e gratuito. Sua conta guarda as pessoas de confiança para você ligar rápido em uma emergência. O resto do app continua funcionando sem login.</p>
                    <button className="primary-btn" onClick={openAuth}><LogIn size={19}/> Entrar ou criar conta</button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} setToast={setToast} />}
        </AnimatePresence>

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
