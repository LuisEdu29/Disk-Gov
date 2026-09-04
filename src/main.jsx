import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Car, ChevronRight, Clock3, Fingerprint, Flame, HeartHandshake, Home,
  MapPin, Menu, Moon, Phone, Search, Shield, ShoppingBag, Siren, Star, Sun,
  Users, Venus, X
} from "lucide-react";
import "./styles.css";

const services = [
  { id: "policia", title: "Polícia", subtitle: "Emergência e segurança", icon: Shield, tone: "blue", number: "190" },
  { id: "bombeiros", title: "Bombeiros", subtitle: "Incêndios e resgates", icon: Flame, tone: "red", number: "193" },
  { id: "samu", title: "SAMU", subtitle: "Emergências médicas", icon: HeartHandshake, tone: "green", number: "192" },
  { id: "conselho", title: "Conselho Tutelar", subtitle: "Proteção de crianças", icon: Users, tone: "purple", number: "100" },
  { id: "defesa", title: "Defesa Civil", subtitle: "Riscos e desastres", icon: Siren, tone: "orange", number: "199" },
  { id: "guarda", title: "Guarda Municipal", subtitle: "Segurança urbana", icon: Star, tone: "teal", number: "153" },
  { id: "prf", title: "Polícia Rodoviária Federal", subtitle: "Emergências em rodovias federais", icon: Car, tone: "indigo", number: "191" },
  { id: "mulher", title: "Central de Atendimento à Mulher", subtitle: "Denúncias de violência doméstica", icon: Venus, tone: "pink", number: "180" },
  { id: "policiacivil", title: "Polícia Civil", subtitle: "Investigação e ocorrências", icon: Fingerprint, tone: "yellow", number: "197" },
  { id: "procon", title: "Procon", subtitle: "Defesa do consumidor", icon: ShoppingBag, tone: "cyan", number: "151" }
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

function ServiceCard({ service, onOpen }) {
  const Icon = service.icon;
  return (
    <motion.button
      className={`service-card ${service.tone}`}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -2 }}
      onClick={() => onOpen(service)}
      aria-label={`Abrir ${service.title}`}
    >
      <span className="service-icon"><Icon size={25} strokeWidth={2.2}/></span>
      <span className="service-copy">
        <strong>{service.title}</strong>
        <small>{service.subtitle}</small>
      </span>
      <ChevronRight size={20} className="chevron" />
    </motion.button>
  );
}

function RecentItem({ item, onDelete }) {
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
            setX(-500);
          } else {
            setX(0);
          }
        }}
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
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [recent, setRecent] = useState(recentSeed);
  const [toast, setToast] = useState("");
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = services.filter(s =>
    `${s.title} ${s.subtitle}`.toLowerCase().includes(search.toLowerCase())
  );

  const openService = (service) => {
    setSelected(service);
    setToast(`${service.title} selecionado`);
  };

  const call = () => {
    if (!selected) return;
    setToast(`Simulação: chamada para ${selected.number}`);
  };

  if (loading) return <main className="app-shell"><Skeleton /></main>;

  return (
    <main className="app-shell">
      <div className="mobile-frame">
        <header className="topbar">
          <button className="icon-btn" aria-label="Menu"><Menu size={23}/></button>
          <div className="brand"><span>Conecta</span><b>Gov</b></div>
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

        <AnimatePresence mode="wait">
          {active === "inicio" && (
            <motion.section key="home" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="content">
              <div className="hero">
                <div>
                  <p className="eyebrow">SERVIÇOS ESSENCIAIS</p>
                  <h1>Precisa de ajuda?</h1>
                  <p className="hero-copy">Encontre rapidamente o serviço público que você precisa.</p>
                </div>
                <div className="location-pill"><MapPin size={16}/> Sua região</div>
              </div>

              <label className="search-box">
                <Search size={20}/>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar serviço..."
                  aria-label="Buscar serviço"
                />
                {search && <button onClick={() => setSearch("")} aria-label="Limpar busca"><X size={17}/></button>}
              </label>

              <div className="section-heading">
                <h2>Serviços</h2>
                <span>{filtered.length} disponíveis</span>
              </div>

              <div className="service-grid">
                {filtered.map(s => <ServiceCard key={s.id} service={s} onOpen={openService}/>)}
              </div>

              <div className="gesture-hint">
                <div className="gesture-arrow">←</div>
                <div><strong>Dica rápida</strong><span>Arraste um atendimento recente para a esquerda para excluir.</span></div>
              </div>

              <div className="section-heading recent-heading">
                <h2>Recentes</h2>
                <span>Arraste para excluir</span>
              </div>

              <div className="recent-list">
                {recent.length === 0 ? (
                  <div className="empty">Nenhum atendimento recente.</div>
                ) : recent.map(item =>
                  <RecentItem key={item.id} item={item} onDelete={(id) => {
                    setRecent(r => r.filter(x => x.id !== id));
                    setToast("Atendimento removido");
                  }}/>
                )}
              </div>
            </motion.section>
          )}

          {active === "mapa" && (
            <motion.section key="map" initial={{opacity:0,x:15}} animate={{opacity:1,x:0}} className="content simple-page">
              <p className="eyebrow">LOCALIZAÇÃO</p>
              <h1>Serviços próximos</h1>
              <div className="fake-map"><MapPin size={42}/><strong>Mapa de serviços</strong><span>Protótipo — integração de mapas pode ser adicionada depois.</span></div>
              <button className="primary-btn" onClick={() => setToast("Localização atualizada")}>Atualizar localização</button>
            </motion.section>
          )}

          {active === "salvos" && (
            <motion.section key="saved" initial={{opacity:0,x:15}} animate={{opacity:1,x:0}} className="content simple-page">
              <p className="eyebrow">ACESSO RÁPIDO</p>
              <h1>Serviços salvos</h1>
              <p className="muted-text">Aqui podem ficar os serviços que o usuário marcou como favoritos.</p>
              <div className="saved-card"><Star size={25}/><div><strong>Exemplo de serviço salvo</strong><span>Toque para abrir rapidamente.</span></div></div>
            </motion.section>
          )}
        </AnimatePresence>

        <nav className="bottom-nav" aria-label="Navegação principal">
          <button className={active==="inicio" ? "active" : ""} onClick={() => setActive("inicio")}><Home size={21}/><span>Início</span></button>
          <button className={active==="mapa" ? "active" : ""} onClick={() => setActive("mapa")}><MapPin size={21}/><span>Próximos</span></button>
          <button className={active==="salvos" ? "active" : ""} onClick={() => setActive("salvos")}><Star size={21}/><span>Salvos</span></button>
        </nav>

        <AnimatePresence>
          {selected && (
            <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setSelected(null)}>
              <motion.div className="service-modal" initial={{y:60,opacity:0}} animate={{y:0,opacity:1}} exit={{y:60,opacity:0}} onClick={e=>e.stopPropagation()}>
                <button className="modal-close" onClick={() => setSelected(null)}><X/></button>
                <div className={`modal-icon ${selected.tone}`}><selected.icon size={30}/></div>
                <p className="eyebrow">SERVIÇO PÚBLICO</p>
                <h2>{selected.title}</h2>
                <p>{selected.subtitle}. Em uma versão real, esta tela poderia mostrar endereço, distância, horário e orientações.</p>
                <div className="number-box"><span>Número de emergência</span><strong>{selected.number}</strong></div>
                <button className="primary-btn" onClick={call}><Phone size={19}/> Simular chamada</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toast && (
            <motion.div className="toast" initial={{y:40,opacity:0}} animate={{y:0,opacity:1}} exit={{y:40,opacity:0}}>
              <span className="toast-check">✓</span>{toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);