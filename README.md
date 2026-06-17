# El Mercado FC

> Fichajes verificados del fútbol europeo, clasificados por credibilidad.

Sitio independiente que cubre rumores, negociaciones y fichajes confirmados de las Top 5 ligas de Europa (LaLiga, Premier League, Serie A, Bundesliga y Ligue 1). El diferenciador: cada movimiento se clasifica en uno de cuatro niveles de credibilidad, con las fuentes visibles.

## 🎯 Niveles de credibilidad

- **🔴 Rumor** — especulación o información disputada entre fuentes
- **🟡 Cerca** — negociación confirmada, sin acuerdo todavía
- **🔵 Casi cerrado** — acuerdo total, falta médica o firma
- **🟢 Cerrado** — anuncio oficial del club

## 🏗️ Arquitectura

```
el-mercado-fc/
├── index.html        ← Estructura HTML + SEO meta tags
├── styles.css        ← Diseño completo (dark theme)
├── script.js         ← Lógica de filtros y renderizado
├── data.json         ← ⭐ Fuente única de verdad (todos los fichajes)
├── robots.txt        ← Indexación para buscadores
├── sitemap.xml       ← Mapa del sitio para Google
└── README.md
```

**Decisión clave:** los datos viven en `data.json`, separados del código. Esto permite que en el futuro un flujo de n8n (u otra automatización) actualice solo ese archivo sin tocar nada más.

## 📝 Cómo agregar un fichaje nuevo

Edita `data.json` y agrega un objeto al array `transfers`:

```json
{
  "id": "nombre-jugador-club-año",
  "player": "Nombre Jugador",
  "age": 25,
  "position": "Posición",
  "isYoung": false,
  "from": "Club origen",
  "to": "Club destino",
  "league": "LaLiga | Premier League | Serie A | Bundesliga | Ligue 1",
  "fee": "€XXm | Libre | Por definir",
  "feeNumeric": 70,
  "tier": "rumor | cerca | casi | cerrado",
  "credibility": 75,
  "date": "2026-06-16",
  "sources": [
    {
      "name": "Nombre de la fuente",
      "summary": "Qué dice exactamente la fuente",
      "reliable": true,
      "url": ""
    }
  ]
}
```

Actualiza también `lastUpdated` con el timestamp actual.

## 🚀 Deploy

Conectado a Vercel desde GitHub. Cada push a `main` activa un nuevo deploy automático.

## 🔮 Roadmap

- [ ] Automatización con n8n: feeds RSS → IA clasifica → JSON → deploy
- [ ] Google Analytics 4
- [ ] Open Graph image (1200×630)
- [ ] Sección Liga MX
- [ ] Sección "Camino al Mundial 2026"
- [ ] Dominio propio

## 📜 Aviso legal

Proyecto independiente sin afiliación con FIFA, clubes, ligas ni medios. La información se basa en reportes públicos de medios deportivos y comunicados oficiales.
