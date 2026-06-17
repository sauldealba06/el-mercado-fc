/* ===========================================
   EL MERCADO FC — Lógica del sitio
   Lee data.json y renderiza fichajes con filtros
   =========================================== */

// Etiquetas y orden de los tiers
const TIER_LABELS = {
  rumor: "Rumor",
  cerca: "Cerca",
  casi: "Casi cerrado",
  cerrado: "Cerrado"
};

// Orden de mayor a menor confirmación (para el embudo)
const TIER_ORDER = { cerrado: 3, casi: 2, cerca: 1, rumor: 0 };

// Estado global
let transfersData = [];
let currentView = "embudo";
let currentLeague = "all";

// Elementos del DOM
const grid = document.getElementById("grid");
const empty = document.getElementById("empty");
const introTitle = document.getElementById("introTitle");
const introText = document.getElementById("introText");
const legend = document.getElementById("legend");
const tabs = document.getElementById("tabs");
const leagueFilters = document.getElementById("leagueFilters");
const lastUpdatedEl = document.getElementById("lastUpdated");

/* ============ CARGA DE DATOS ============ */
async function loadData() {
  try {
    const res = await fetch("data.json", { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo cargar data.json");
    const data = await res.json();
    transfersData = data.transfers || [];

    // Formatear fecha de última actualización
    if (data.lastUpdated) {
      const d = new Date(data.lastUpdated);
      const fmt = d.toLocaleDateString("es-MX", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
      });
      lastUpdatedEl.textContent = fmt;
    }

    render();
  } catch (err) {
    console.error("Error cargando datos:", err);
    grid.innerHTML = `<p style="color:var(--muted);padding:40px 0;">Error cargando los datos. Verifica que data.json esté en la raíz del sitio.</p>`;
  }
}

/* ============ RENDERIZADO DE UNA CARD ============ */
function renderCard(d) {
  // Etiqueta de jugador joven (sub-21)
  const youngTag = d.isYoung
    ? `<div class="tag-young" aria-label="Joven promesa">JOVEN</div>`
    : "";

  // Fuentes con check / cross
  const sources = (d.sources || [])
    .map(s => `
      <div class="src">
        <span class="ic ${s.reliable ? "yes" : "no"}" aria-hidden="true">${s.reliable ? "✓" : "✕"}</span>
        <div><b>${escape(s.name)}</b> <span>· ${escape(s.summary)}</span></div>
      </div>
    `)
    .join("");

  // Monto (si es libre, lo marcamos visualmente)
  const isFree = (d.fee || "").toLowerCase().includes("libre") ||
                 (d.fee || "").toLowerCase().includes("free");
  const feeClass = isFree ? "fee fee-free" : "fee";

  return `
    <article class="card tier-${d.tier}" aria-label="Fichaje de ${escape(d.player)}">
      ${youngTag}
      <div class="card-top">
        <span class="badge tier-${d.tier}">${TIER_LABELS[d.tier] || d.tier}</span>
        <span class="league-tag">${escape(d.league)}</span>
      </div>
      <h3 class="player">${escape(d.player)}</h3>
      <div class="meta">${d.age} años · ${escape(d.position)}</div>
      <div class="move">
        <span class="club-from">${escape(d.from)}</span>
        <span class="arrow" aria-hidden="true">→</span>
        <span class="club-to">${escape(d.to)}</span>
      </div>
      <div class="${feeClass}">${escape(d.fee)}</div>
      <div class="cred">
        <div class="cred-lbl">
          <span>Credibilidad</span>
          <b>${d.credibility}%</b>
        </div>
        <div class="bar"><i style="width:${d.credibility}%"></i></div>
      </div>
      <div class="sources">
        <div class="src-title">Fuentes (${(d.sources || []).length})</div>
        ${sources || '<p style="font-size:12.5px;color:var(--muted);">Sin fuentes registradas.</p>'}
      </div>
    </article>
  `;
}

/* ============ MOTOR DE FILTROS Y RENDER ============ */
function render() {
  let items = [...transfersData];

  switch (currentView) {
    case "embudo":
      items.sort((a, b) => TIER_ORDER[b.tier] - TIER_ORDER[a.tier]);
      introTitle.innerHTML = 'Del <em>rumor</em> al fichaje';
      introText.textContent = "Cada movimiento se clasifica por qué tan en serio va — y por la credibilidad de quién lo reporta. No es solo qué se dice, sino quién lo dice.";
      legend.hidden = false;
      leagueFilters.hidden = true;
      break;

    case "liga":
      if (currentLeague !== "all") {
        items = items.filter(d => d.league === currentLeague);
      }
      items.sort((a, b) => a.league.localeCompare(b.league) || TIER_ORDER[b.tier] - TIER_ORDER[a.tier]);
      introTitle.innerHTML = 'Por <em>liga</em>';
      introText.textContent = "Filtra los movimientos por competición. Las cinco grandes de Europa: LaLiga, Premier, Serie A, Bundesliga y Ligue 1.";
      legend.hidden = false;
      leagueFilters.hidden = false;
      renderLeagueFilters();
      break;

    case "caros":
      items.sort((a, b) => (b.feeNumeric || 0) - (a.feeNumeric || 0));
      introTitle.innerHTML = 'Los más <em>caros</em>';
      introText.textContent = "Operaciones ordenadas por monto de transacción. El mercado se calienta antes y después del Mundial — los precios suben con cada gol importante.";
      legend.hidden = false;
      leagueFilters.hidden = true;
      break;

    case "jovenes":
      items = items.filter(d => d.isYoung);
      items.sort((a, b) => (a.age || 99) - (b.age || 99));
      introTitle.innerHTML = 'Jóvenes <em>promesas</em>';
      introText.textContent = "Talentos sub-21 que mueven el mercado. Aquí la credibilidad importa más: muchos rumores de jóvenes circulan sin fuentes sólidas.";
      legend.hidden = true;
      leagueFilters.hidden = true;
      break;
  }

  if (items.length === 0) {
    grid.innerHTML = "";
    empty.hidden = false;
  } else {
    empty.hidden = true;
    grid.innerHTML = items.map(renderCard).join("");
  }
}

/* ============ FILTROS DE LIGA ============ */
function renderLeagueFilters() {
  const leagues = [...new Set(transfersData.map(d => d.league))].sort();
  const html = [
    `<button class="league-btn ${currentLeague === "all" ? "active" : ""}" data-league="all">Todas</button>`,
    ...leagues.map(l => `<button class="league-btn ${currentLeague === l ? "active" : ""}" data-league="${l}">${l}</button>`)
  ].join("");
  leagueFilters.innerHTML = html;
}

/* ============ EVENT LISTENERS ============ */
tabs.addEventListener("click", e => {
  const btn = e.target.closest(".tab");
  if (!btn) return;
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  btn.classList.add("active");
  currentView = btn.dataset.view;
  currentLeague = "all"; // reset filtro de liga al cambiar vista
  render();
  // Scroll suave a la sección de cards
  document.querySelector(".grid").scrollIntoView({ behavior: "smooth", block: "start" });
});

leagueFilters.addEventListener("click", e => {
  const btn = e.target.closest(".league-btn");
  if (!btn) return;
  currentLeague = btn.dataset.league;
  render();
});

/* ============ UTILIDADES ============ */
// Escape básico de HTML para evitar XSS si en el futuro hay input no confiable
function escape(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ============ ARRANQUE ============ */
loadData();
