import { useEffect, useMemo, useRef, useState } from "react";
import {
  Accessibility,
  AlertTriangle,
  Bell,
  Car,
  Check,
  ChevronRight,
  ClipboardList,
  Clock3,
  Copy,
  Fingerprint,
  Flame,
  Gavel,
  Hand,
  HeartHandshake,
  Home,
  Info,
  Landmark,
  LifeBuoy,
  Loader2,
  MapPin,
  Menu,
  Mic,
  MicOff,
  Moon,
  Phone,
  Scale,
  Search,
  Share2,
  Shield,
  ShieldAlert,
  ShoppingBag,
  Siren,
  Star,
  Stethoscope,
  Sun,
  Users,
  Wifi,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./styles.css";

const services = [
  {
    id: "policia",
    name: "Polícia",
    number: "190",
    description: "Emergências policiais, crimes em andamento e situações de risco.",
    icon: ShieldAlert,
    category: "Segurança",
    keywords: [
      "policia",
      "polícia",
      "assalto",
      "roubo",
      "furto",
      "crime",
      "bandido",
      "arma",
      "violencia",
      "violência",
      "briga",
      "agressao",
      "agressão",
      "perigo",
    ],
  },
  {
    id: "bombeiros",
    name: "Bombeiros",
    number: "193",
    description: "Incêndios, acidentes, resgates e situações de emergência.",
    icon: Flame,
    category: "Emergência",
    keywords: [
      "incendio",
      "incêndio",
      "fogo",
      "acidente",
      "resgate",
      "explosao",
      "explosão",
      "desabamento",
      "pessoa presa",
      "enchente",
    ],
  },
  {
    id: "samu",
    name: "SAMU",
    number: "192",
    description: "Atendimento médico de urgência e emergência.",
    icon: Stethoscope,
    category: "Saúde",
    keywords: [
      "samu",
      "medico",
      "médico",
      "hospital",
      "ambulancia",
      "ambulância",
      "passou mal",
      "desmaio",
      "desmaiou",
      "infarto",
      "dor",
      "ferido",
      "ferida",
      "acidente",
      "socorro",
      "emergencia",
      "emergência",
    ],
  },
  {
    id: "conselho",
    name: "Conselho Tutelar",
    number: "100",
    description: "Denúncias e proteção de crianças e adolescentes.",
    icon: Users,
    category: "Proteção",
    keywords: [
      "crianca",
      "criança",
      "adolescente",
      "menor",
      "maus tratos",
      "maus-tratos",
      "abandono infantil",
      "abuso infantil",
    ],
  },
  {
    id: "defesa-civil",
    name: "Defesa Civil",
    number: "199",
    description: "Alagamentos, enchentes, deslizamentos e riscos estruturais.",
    icon: AlertTriangle,
    category: "Emergência",
    keywords: [
      "alagamento",
      "alagada",
      "alagado",
      "enchente",
      "enchendo",
      "deslizamento",
      "desmoronamento",
      "desabamento",
      "chuva",
      "inundacao",
      "inundação",
      "bueiro",
      "barranco",
      "risco estrutural",
    ],
  },
  {
    id: "guarda",
    name: "Guarda Municipal",
    number: "153",
    description: "Atendimento da Guarda Municipal e proteção de espaços públicos.",
    icon: Shield,
    category: "Segurança",
    keywords: [
      "guarda",
      "guarda municipal",
      "gcm",
      "patrimonio",
      "patrimônio",
      "espaco publico",
      "espaço público",
    ],
  },
  {
    id: "prf",
    name: "Polícia Rodoviária Federal",
    number: "191",
    description: "Ocorrências e emergências em rodovias federais.",
    icon: Car,
    category: "Trânsito",
    keywords: [
      "rodovia",
      "estrada",
      "br",
      "rodoviaria federal",
      "rodoviária federal",
      "prf",
      "acidente na rodovia",
    ],
  },
  {
    id: "mulher",
    name: "Central de Atendimento à Mulher",
    number: "180",
    description: "Orientação e denúncias relacionadas à violência contra a mulher.",
    icon: HeartHandshake,
    category: "Proteção",
    keywords: [
      "mulher",
      "violencia contra mulher",
      "violência contra mulher",
      "violencia domestica",
      "violência doméstica",
      "agressao contra mulher",
      "agressão contra mulher",
    ],
  },
  {
    id: "policia-civil",
    name: "Polícia Civil",
    number: "197",
    description: "Informações e denúncias relacionadas à Polícia Civil.",
    icon: Gavel,
    category: "Segurança",
    keywords: ["policia civil", "polícia civil", "delegacia", "denuncia policial"],
  },
  {
    id: "procon",
    name: "Procon",
    number: "151",
    description: "Orientações e reclamações relacionadas às relações de consumo.",
    icon: ShoppingBag,
    category: "Direitos",
    keywords: [
      "procon",
      "consumidor",
      "produto",
      "loja",
      "compra",
      "venda",
      "reclamacao",
      "reclamação",
    ],
  },
  {
    id: "anatel",
    name: "Anatel",
    number: "1331",
    description: "Atendimento e reclamações sobre serviços de telecomunicações.",
    icon: Wifi,
    category: "Serviços",
    keywords: [
      "anatel",
      "internet",
      "telefone",
      "celular",
      "operadora",
      "sinal",
      "telecomunicacao",
      "telecomunicação",
    ],
  },
  {
    id: "disque-denuncia",
    name: "Disque Denúncia",
    number: "181",
    description: "Canal para denúncias, inclusive de forma anônima.",
    icon: Siren,
    category: "Denúncias",
    keywords: [
      "denuncia",
      "denúncia",
      "denunciar",
      "denuncia anonima",
      "denúncia anônima",
      "situacao suspeita",
      "situação suspeita",
    ],
  },
  {
    id: "cvv",
    name: "CVV",
    number: "188",
    description: "Apoio emocional e prevenção do suicídio.",
    icon: LifeBuoy,
    category: "Apoio",
    keywords: [
      "cvv",
      "apoio emocional",
      "conversa",
      "solidão",
      "solidao",
      "triste",
      "tristeza",
      "desespero",
    ],
  },
  {
    id: "detran",
    name: "Detran",
    number: "154",
    description: "Serviços e informações relacionados ao trânsito e veículos.",
    icon: Car,
    category: "Trânsito",
    keywords: [
      "detran",
      "habilitacao",
      "habilitação",
      "cnh",
      "veiculo",
      "veículo",
      "documento do carro",
      "multa",
    ],
  },
  {
    id: "inss",
    name: "INSS",
    number: "135",
    description: "Informações e serviços relacionados ao INSS.",
    icon: Landmark,
    category: "Serviços",
    keywords: [
      "inss",
      "aposentadoria",
      "beneficio",
      "benefício",
      "previdencia",
      "previdência",
      "pensão",
      "pensao",
    ],
  },
  {
    id: "vigilancia",
    name: "Vigilância Sanitária",
    number: "150",
    description: "Denúncias e informações relacionadas à vigilância sanitária.",
    icon: Accessibility,
    category: "Saúde",
    keywords: [
      "vigilancia sanitaria",
      "vigilância sanitária",
      "sanitario",
      "sanitário",
      "comida estragada",
      "alimento",
      "higiene",
    ],
  },
  {
    id: "ministerio-publico",
    name: "Ministério Público",
    number: "127",
    description: "Informações e canais de atendimento do Ministério Público.",
    icon: Scale,
    category: "Direitos",
    keywords: [
      "ministerio publico",
      "ministério público",
      "direitos",
      "denuncia publica",
      "denúncia pública",
    ],
  },
  {
    id: "defensoria",
    name: "Defensoria Pública",
    number: "129",
    description: "Orientação e assistência jurídica.",
    icon: Scale,
    category: "Direitos",
    keywords: [
      "defensoria",
      "advogado",
      "advocacia",
      "assistencia juridica",
      "assistência jurídica",
      "processo",
      "direito",
    ],
  },
  {
    id: "idoso",
    name: "Disque Idoso",
    number: "100",
    description: "Canal de orientação e denúncias relacionadas à pessoa idosa.",
    icon: Hand,
    category: "Proteção",
    keywords: [
      "idoso",
      "idosa",
      "pessoa idosa",
      "maus tratos idoso",
      "abandono de idoso",
    ],
  },
  {
    id: "libras",
    name: "Central de Libras",
    number: "Varia",
    description: "Serviços de atendimento em Libras, conforme disponibilidade local.",
    icon: Accessibility,
    category: "Acessibilidade",
    keywords: ["libras", "surdo", "surda", "deficiencia auditiva", "deficiência auditiva"],
  },
];

const guideItems = [
  {
    title: "Polícia",
    number: "190",
    description:
      "Use em situações de emergência policial, crimes acontecendo naquele momento, ameaças, agressões ou situações de perigo.",
    serviceId: "policia",
  },
  {
    title: "Bombeiros",
    number: "193",
    description:
      "Use para incêndios, acidentes, resgates, pessoas presas, desabamentos e outras situações que envolvam salvamento.",
    serviceId: "bombeiros",
  },
  {
    title: "SAMU",
    number: "192",
    description:
      "Use quando houver uma emergência médica, como desmaios, problemas graves de saúde, ferimentos ou necessidade de atendimento de urgência.",
    serviceId: "samu",
  },
  {
    title: "Conselho Tutelar",
    number: "100",
    description:
      "Canal para situações envolvendo crianças e adolescentes que necessitem de proteção ou denúncia.",
    serviceId: "conselho",
  },
  {
    title: "Defesa Civil",
    number: "199",
    description:
      "Use para alagamentos, enchentes, deslizamentos, desabamentos e riscos estruturais.",
    serviceId: "defesa-civil",
  },
  {
    title: "Guarda Municipal",
    number: "153",
    description:
      "Canal de atendimento da Guarda Municipal para ocorrências relacionadas à segurança e espaços públicos.",
    serviceId: "guarda",
  },
  {
    title: "Polícia Rodoviária Federal",
    number: "191",
    description:
      "Atendimento de ocorrências e emergências em rodovias federais.",
    serviceId: "prf",
  },
  {
    title: "Central da Mulher",
    number: "180",
    description:
      "Canal de orientação, apoio e denúncias relacionadas à violência contra a mulher.",
    serviceId: "mulher",
  },
  {
    title: "Polícia Civil",
    number: "197",
    description:
      "Canal de atendimento e informações relacionadas à Polícia Civil.",
    serviceId: "policia-civil",
  },
  {
    title: "Procon",
    number: "151",
    description:
      "Use para orientações e reclamações relacionadas a produtos, serviços e relações de consumo.",
    serviceId: "procon",
  },
  {
    title: "Anatel",
    number: "1331",
    description:
      "Canal para reclamações e informações sobre serviços de telecomunicações.",
    serviceId: "anatel",
  },
  {
    title: "Disque Denúncia",
    number: "181",
    description:
      "Canal para realizar denúncias, inclusive situações suspeitas.",
    serviceId: "disque-denuncia",
  },
  {
    title: "CVV",
    number: "188",
    description:
      "Serviço de apoio emocional e prevenção do suicídio.",
    serviceId: "cvv",
  },
  {
    title: "Detran",
    number: "154",
    description:
      "Informações e serviços relacionados a veículos, habilitação e trânsito.",
    serviceId: "detran",
  },
  {
    title: "INSS",
    number: "135",
    description:
      "Canal de informações e serviços relacionados ao INSS.",
    serviceId: "inss",
  },
  {
    title: "Vigilância Sanitária",
    number: "150",
    description:
      "Canal relacionado a denúncias e informações sobre condições sanitárias.",
    serviceId: "vigilancia",
  },
  {
    title: "Ministério Público",
    number: "127",
    description:
      "Canal de atendimento relacionado à atuação do Ministério Público.",
    serviceId: "ministerio-publico",
  },
  {
    title: "Defensoria Pública",
    number: "129",
    description:
      "Canal para orientação e assistência jurídica.",
    serviceId: "defensoria",
  },
  {
    title: "Disque Idoso",
    number: "100",
    description:
      "Canal para orientação e denúncias relacionadas à proteção da pessoa idosa.",
    serviceId: "idoso",
  },
  {
    title: "Central de Libras",
    number: "Varia",
    description:
      "Serviços de atendimento em Libras, conforme a disponibilidade do município ou órgão.",
    serviceId: "libras",
  },
];

function getInitialFavorites() {
  try {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function getInitialTheme() {
  try {
    return localStorage.getItem("theme") || "light";
  } catch {
    return "light";
  }
}

function normalizeText(text = "") {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function App() {
  const [active, setActive] = useState("inicio");
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [recent, setRecent] = useState([]);
  const [toast, setToast] = useState("");
  const [theme, setTheme] = useState(getInitialTheme);
  const [favorites, setFavorites] = useState(getInitialFavorites);
  const [sosOpen, setSosOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [locationLabel, setLocationLabel] = useState("Localização não definida");
  const [locating, setLocating] = useState(false);
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 2800);

    return () => clearTimeout(timer);
  }, [toast]);

  const filteredServices = useMemo(() => {
    const term = normalizeText(search.trim());

    if (!term) return services;

    return services.filter((service) => {
      const searchable = normalizeText(
        `${service.name} ${service.number} ${service.description} ${service.category} ${service.keywords.join(
          " "
        )}`
      );

      return searchable.includes(term);
    });
  }, [search]);

  const suggestedService = useMemo(() => {
    const term = normalizeText(search.trim());

    if (!term) return null;

    let best = null;
    let bestScore = 0;

    services.forEach((service) => {
      let score = 0;

      service.keywords.forEach((keyword) => {
        const normalizedKeyword = normalizeText(keyword);

        if (term.includes(normalizedKeyword)) {
          score += normalizedKeyword.length;
        }
      });

      if (normalizeText(service.name).includes(term)) {
        score += 10;
      }

      if (score > bestScore) {
        bestScore = score;
        best = service;
      }
    });

    return best;
  }, [search]);

  function showToast(message) {
    setToast(message);
  }

  function openService(service) {
    setSelected(service);
    setRecent((previous) => {
      const updated = [service.id, ...previous.filter((id) => id !== service.id)];
      return updated.slice(0, 5);
    });
    setMenuOpen(false);
  }

  function toggleFavorite(id) {
    setFavorites((previous) => {
      if (previous.includes(id)) {
        showToast("Removido dos salvos");
        return previous.filter((item) => item !== id);
      }

      showToast("Serviço salvo neste aparelho");
      return [...previous, id];
    });
  }

  function call(number, name = "serviço") {
    showToast(`Ligação para ${name}: ${number}`);

    if (typeof window !== "undefined" && window.location) {
      try {
        window.location.href = `tel:${number}`;
      } catch {
        // Mantém a simulação caso o dispositivo não aceite tel:
      }
    }
  }

  function quickDial(id) {
    const service = services.find((item) => item.id === id);

    if (!service) return;

    setSosOpen(false);
    call(service.number, service.name);
  }

  function copyNumber(number) {
    if (!number || number === "Varia") return;

    navigator.clipboard
      ?.writeText(number)
      .then(() => {
        setCopied(true);
        showToast("Número copiado");

        setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => {
        showToast("Não foi possível copiar");
      });
  }

  async function shareService(service) {
    const shareData = {
      title: `CHAMOU, FALOU — ${service.name}`,
      text: `${service.name}: ${service.number}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${service.name}: ${service.number}`
        );
        showToast("Informação copiada para compartilhar");
      }
    } catch {
      // Usuário cancelou o compartilhamento.
    }
  }

  function locateUser() {
    if (!navigator.geolocation) {
      showToast("Seu dispositivo não oferece localização");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        setLocationLabel(
          `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        );

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );

          if (response.ok) {
            const data = await response.json();

            const address = data.address || {};

            const city =
              address.city ||
              address.town ||
              address.municipality ||
              address.village;

            const state = address.state;

            if (city) {
              setLocationLabel(
                state ? `${city} — ${state}` : city
              );
            }
          }
        } catch {
          // Mantém as coordenadas quando não houver internet.
        }

        setLocating(false);
        showToast("Localização atualizada");
      },
      () => {
        setLocating(false);
        showToast("Não foi possível obter sua localização");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }

  function toggleVoiceSearch() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast("Busca por voz não disponível neste navegador");
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
      showToast("Estou ouvindo...");
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";

      setSearch(transcript);
      setActive("inicio");
    };

    recognition.onerror = () => {
      setListening(false);
      showToast("Não consegui entender o áudio");
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function navigate(page) {
    setActive(page);
    setMenuOpen(false);
    setSelected(null);
  }

  const savedServices = services.filter((service) =>
    favorites.includes(service.id)
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="icon-btn"
          aria-label="Abrir menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={23} />
        </button>

        <div className="brand">
          <span>CHAMOU,</span>
          <b>FALOU</b>
        </div>

        <div className="top-actions">
          <button
            className="icon-btn"
            aria-label="Alternar tema"
            onClick={() =>
              setTheme((current) =>
                current === "dark" ? "light" : "dark"
              )
            }
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            className="icon-btn"
            aria-label="Notificações"
            onClick={() => showToast("Nenhuma nova notificação")}
          >
            <Bell size={20} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />

            <motion.aside
              className="side-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25 }}
            >
              <div className="drawer-header">
                <div className="brand drawer-brand">
                  <span>CHAMOU,</span>
                  <b>FALOU</b>
                </div>

                <button
                  className="icon-btn"
                  aria-label="Fechar menu"
                  onClick={() => setMenuOpen(false)}
                >
                  <X size={22} />
                </button>
              </div>

              <nav className="drawer-nav">
                <button
                  className="drawer-item"
                  onClick={() => navigate("inicio")}
                >
                  <Home size={20} />
                  <span>Início</span>
                </button>

                <button
                  className="drawer-item"
                  onClick={() => navigate("mapa")}
                >
                  <MapPin size={20} />
                  <span>Próximos</span>
                </button>

                <button
                  className="drawer-item"
                  onClick={() => navigate("guia")}
                >
                  <ClipboardList size={20} />
                  <span>Guia</span>
                </button>

                <button
                  className="drawer-item"
                  onClick={() => navigate("salvos")}
                >
                  <Star size={20} />
                  <span>Salvos</span>
                </button>

                <button
                  className="drawer-item"
                  onClick={() => navigate("sobre")}
                >
                  <Info size={20} />
                  <span>Sobre</span>
                </button>
              </nav>

              <div className="drawer-footer">
                <div className="offline-badge">
                  <Wifi size={15} />
                  <span>PRONTO PARA AJUDAR</span>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="main-content">
        {active === "inicio" && (
          <>
            <section className="hero-section">
              <div className="hero-eyebrow">
                <Siren size={17} />
                <span>ASSISTÊNCIA PÚBLICA</span>
              </div>

              <h1>O que aconteceu?</h1>

              <p className="hero-text">
                Conte o que está acontecendo e descubra rapidamente
                para quem pedir ajuda.
              </p>

              <div className="search-box">
                <Search size={21} />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Ex.: minha rua está alagada..."
                  aria-label="Descreva o que aconteceu"
                />

                <button
                  className={`voice-btn ${
                    listening ? "is-listening" : ""
                  }`}
                  onClick={toggleVoiceSearch}
                  aria-label="Buscar por voz"
                >
                  {listening ? (
                    <MicOff size={20} />
                  ) : (
                    <Mic size={20} />
                  )}
                </button>
              </div>

              {search.trim() && (
                <div className="smart-result">
                  {suggestedService ? (
                    <>
                      <div className="smart-result-label">
                        <Check size={17} />
                        <span>ACHAMOS UMA OPÇÃO</span>
                      </div>

                      <div className="smart-result-main">
                        <div>
                          <strong>{suggestedService.name}</strong>
                          <p>{suggestedService.description}</p>
                        </div>

                        <span className="smart-number">
                          {suggestedService.number}
                        </span>
                      </div>

                      <button
                        className="primary-action"
                        onClick={() => openService(suggestedService)}
                      >
                        CHAMAR AGORA
                        <Phone size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="smart-result-label">
                        <Info size={17} />
                        <span>NÃO ENCONTRAMOS UMA OPÇÃO EXATA</span>
                      </div>

                      <p className="smart-help">
                        Tente descrever melhor o que aconteceu ou
                        veja todos os serviços disponíveis.
                      </p>

                      <button
                        className="secondary-action"
                        onClick={() => navigate("guia")}
                      >
                        NÃO SEI PARA QUEM LIGAR
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}
                </div>
              )}
            </section>

            <section className="location-card">
              <div className="location-icon">
                <MapPin size={20} />
              </div>

              <div className="location-info">
                <span>SUA LOCALIZAÇÃO</span>
                <strong>{locationLabel}</strong>
              </div>

              <button
                className="location-btn"
                onClick={locateUser}
                disabled={locating}
              >
                {locating ? (
                  <Loader2 size={19} className="spin" />
                ) : (
                  <MapPin size={19} />
                )}
              </button>
            </section>

            <section className="services-section">
              <div className="section-heading">
                <div>
                  <span className="section-eyebrow">SERVIÇOS</span>
                  <h2>Precisa de ajuda?</h2>
                </div>

                <button
                  className="text-btn"
                  onClick={() => navigate("guia")}
                >
                  Ver todos
                  <ChevronRight size={17} />
                </button>
              </div>

              <div className="services-grid">
                {filteredServices.slice(0, 8).map((service) => {
                  const Icon = service.icon;
                  const isFavorite = favorites.includes(service.id);

                  return (
                    <motion.article
                      key={service.id}
                      className="service-card"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openService(service)}
                    >
                      <div className="service-card-top">
                        <div className="service-icon">
                          <Icon size={22} />
                        </div>

                        <button
                          className={`favorite-btn ${
                            isFavorite ? "active" : ""
                          }`}
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleFavorite(service.id);
                          }}
                          aria-label={
                            isFavorite
                              ? "Remover dos salvos"
                              : "Salvar serviço"
                          }
                        >
                          <Star
                            size={18}
                            fill={isFavorite ? "currentColor" : "none"}
                          />
                        </button>
                      </div>

                      <h3>{service.name}</h3>

                      <p>{service.description}</p>

                      <div className="service-card-footer">
                        <strong>{service.number}</strong>
                        <ChevronRight size={18} />
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {active === "mapa" && (
          <section className="page-section">
            <div className="page-heading">
              <span className="section-eyebrow">POR PERTO</span>
              <h1>Serviços próximos</h1>
              <p>
                Consulte sua localização para encontrar informações
                relacionadas à sua região.
              </p>
            </div>

            <div className="location-large-card">
              <MapPin size={28} />

              <div>
                <span>LOCALIZAÇÃO ATUAL</span>
                <strong>{locationLabel}</strong>
              </div>

              <button
                className="primary-action compact"
                onClick={locateUser}
              >
                {locating ? "LOCALIZANDO..." : "ATUALIZAR"}
              </button>
            </div>

            <div className="info-card">
              <Info size={22} />
              <div>
                <strong>Como funciona?</strong>
                <p>
                  O CHAMOU, FALOU usa sua localização apenas quando
                  você solicita. A localização não precisa ser
                  armazenada para usar os serviços principais.
                </p>
              </div>
            </div>

            <div className="service-list">
              {services.slice(0, 6).map((service) => {
                const Icon = service.icon;

                return (
                  <button
                    className="service-list-item"
                    key={service.id}
                    onClick={() => openService(service)}
                  >
                    <div className="service-icon small">
                      <Icon size={20} />
                    </div>

                    <div>
                      <strong>{service.name}</strong>
                      <span>{service.number}</span>
                    </div>

                    <ChevronRight size={18} />
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {active === "guia" && (
          <section className="page-section guide-page">
            <div className="page-heading">
              <span className="section-eyebrow">
                CONHEÇA OS SERVIÇOS
              </span>

              <h1>Guia de serviços</h1>

              <p>
                Entenda para que serve cada serviço disponível na
                página principal e saiba qual canal procurar em cada
                situação.
              </p>
            </div>

            <div className="guide-list">
              {guideItems.map((item) => (
                <details className="guide-card" key={item.serviceId}>
                  <summary>
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.number}</span>
                    </div>

                    <ChevronRight size={19} />
                  </summary>

                  <div className="guide-content">
                    <p>{item.description}</p>

                    <div className="guide-number">
                      <span>CANAL</span>
                      <strong>{item.number}</strong>
                    </div>

                    <button
                      className="guide-open-btn"
                      onClick={() => {
                        const service = services.find(
                          (serviceItem) =>
                            serviceItem.id === item.serviceId
                        );

                        if (service) openService(service);
                      }}
                    >
                      Ver serviço
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {active === "salvos" && (
          <section className="page-section">
            <div className="page-heading">
              <span className="section-eyebrow">NESTE APARELHO</span>
              <h1>Serviços salvos</h1>
              <p>
                Seus serviços favoritos ficam armazenados localmente
                neste aparelho, sem necessidade de criar uma conta.
              </p>
            </div>

            {savedServices.length === 0 ? (
              <div className="empty-state">
                <Star size={35} />
                <h3>Nenhum serviço salvo</h3>
                <p>
                  Toque na estrela de um serviço para encontrá-lo
                  rapidamente aqui.
                </p>

                <button
                  className="primary-action compact"
                  onClick={() => navigate("inicio")}
                >
                  VER SERVIÇOS
                </button>
              </div>
            ) : (
              <div className="service-list">
                {savedServices.map((service) => {
                  const Icon = service.icon;

                  return (
                    <button
                      className="service-list-item"
                      key={service.id}
                      onClick={() => openService(service)}
                    >
                      <div className="service-icon small">
                        <Icon size={20} />
                      </div>

                      <div>
                        <strong>{service.name}</strong>
                        <span>{service.number}</span>
                      </div>

                      <Star
                        size={18}
                        fill="currentColor"
                        className="saved-star"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {active === "sobre" && (
          <section className="page-section about-page">
            <div className="about-hero">
              <div className="about-logo">
                <Siren size={35} />
              </div>

              <span className="section-eyebrow">SOBRE O APP</span>

              <h1>CHAMOU, FALOU</h1>

              <p>
                Uma forma simples de descobrir para quem pedir ajuda
                quando você mais precisa.
              </p>
            </div>

            <div className="about-card">
              <Info size={22} />

              <div>
                <h3>Sem cadastro</h3>
                <p>
                  O aplicativo não precisa de login ou conta para
                  funcionar.
                </p>
              </div>
            </div>

            <div className="about-card">
              <Fingerprint size={22} />

              <div>
                <h3>Privacidade</h3>
                <p>
                  A proposta é trabalhar com o mínimo possível de
                  dados. Seus serviços salvos permanecem no aparelho.
                </p>
              </div>
            </div>

            <div className="about-card">
              <Wifi size={22} />

              <div>
                <h3>Pronto para situações sem internet</h3>
                <p>
                  As informações essenciais dos serviços ficam
                  disponíveis no próprio aplicativo.
                </p>
              </div>
            </div>

            <div className="privacy-note">
              <Shield size={20} />

              <p>
                Sua privacidade importa. O CHAMOU, FALOU foi pensado
                para evitar cadastro, histórico de emergências e
                armazenamento desnecessário de informações pessoais.
              </p>
            </div>
          </section>
        )}
      </main>

      <nav className="bottom-nav">
        <button
          className={active === "inicio" ? "active" : ""}
          onClick={() => navigate("inicio")}
        >
          <Home size={20} />
          <span>Início</span>
        </button>

        <button
          className={active === "mapa" ? "active" : ""}
          onClick={() => navigate("mapa")}
        >
          <MapPin size={20} />
          <span>Próximos</span>
        </button>

        <button
          className={active === "guia" ? "active" : ""}
          onClick={() => navigate("guia")}
        >
          <ClipboardList size={20} />
          <span>Guia</span>
        </button>

        <button
          className={active === "sobre" ? "active" : ""}
          onClick={() => navigate("sobre")}
        >
          <Info size={20} />
          <span>Sobre</span>
        </button>
      </nav>

      <button
        className="sos-floating"
        onClick={() => setSosOpen((current) => !current)}
        aria-label="Abrir emergência"
      >
        <Siren size={25} />
        <span>SOS</span>
      </button>

      <AnimatePresence>
        {sosOpen && (
          <motion.div
            className="sos-menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="sos-header">
              <div>
                <strong>Emergência</strong>
                <span>Escolha um serviço</span>
              </div>

              <button
                className="icon-btn"
                onClick={() => setSosOpen(false)}
              >
                <X size={19} />
              </button>
            </div>

            <button
              className="sos-option"
              onClick={() => quickDial("policia")}
            >
              <ShieldAlert size={21} />
              <div>
                <strong>Polícia</strong>
                <span>190</span>
              </div>
              <Phone size={18} />
            </button>

            <button
              className="sos-option"
              onClick={() => quickDial("samu")}
            >
              <Stethoscope size={21} />
              <div>
                <strong>SAMU</strong>
                <span>192</span>
              </div>
              <Phone size={18} />
            </button>

            <button
              className="sos-option"
              onClick={() => quickDial("bombeiros")}
            >
              <Flame size={21} />
              <div>
                <strong>Bombeiros</strong>
                <span>193</span>
              </div>
              <Phone size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="service-modal"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 25 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-header">
                <div className="service-icon">
                  {(() => {
                    const Icon = selected.icon;
                    return <Icon size={25} />;
                  })()}
                </div>

                <button
                  className="icon-btn"
                  onClick={() => setSelected(null)}
                  aria-label="Fechar"
                >
                  <X size={21} />
                </button>
              </div>

              <span className="modal-category">
                {selected.category}
              </span>

              <h2>{selected.name}</h2>

              <p>{selected.description}</p>

              <div className="modal-number">
                <span>NÚMERO</span>

                <strong>{selected.number}</strong>

                <button
                  className="copy-btn"
                  onClick={() => copyNumber(selected.number)}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>

              <div className="modal-actions">
                <button
                  className="primary-action"
                  onClick={() =>
                    call(selected.number, selected.name)
                  }
                >
                  <Phone size={19} />
                  CHAMAR AGORA
                </button>

                <button
                  className="secondary-action"
                  onClick={() => shareService(selected)}
                >
                  <Share2 size={18} />
                  COMPARTILHAR
                </button>
              </div>

              <button
                className={`modal-favorite ${
                  favorites.includes(selected.id) ? "active" : ""
                }`}
                onClick={() => toggleFavorite(selected.id)}
              >
                <Star
                  size={18}
                  fill={
                    favorites.includes(selected.id)
                      ? "currentColor"
                      : "none"
                  }
                />

                {favorites.includes(selected.id)
                  ? "Salvo neste aparelho"
                  : "Salvar neste aparelho"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
          >
            <Check size={17} />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
