/* Configuração do Início. Edita aqui as apps, os fundos e os valores por defeito.
   Cada app tem:
     id, name, color (cor da marca), mark (texto do logótipo)
     url  -> abre essa página no browser da TV
     hint -> app nativa: mostra a dica de que botão carregar no comando
   As apps nativas (Netflix, YouTube...) não se abrem a partir de uma página web no VIDAA. */
window.INICIO_CONFIG = {
  defaults: {
    design: "shore",
    bg: "noite",
    clock: "show",
    hour12: false,
    apps: ["bait", "netflix", "youtube", "primevideo", "disneyplus", "rtpplay", "hdmi"]
  },

  screensaverMinutes: 10,

  apps: [
    { id: "bait",       name: "Bait",        color: "#7C9CFF", mark: "B",        url: "https://bait.deunavista.pt/" },
    { id: "netflix",   name: "Netflix",     color: "#E50914", mark: "N",        hint: "Carrega no botão NETFLIX do comando." },
    { id: "youtube",    name: "YouTube",     color: "#FF0000", mark: "▶",   hint: "Carrega no botão YouTube do comando, ou abre-o na lista de apps." },
    { id: "primevideo", name: "Prime Video", color: "#00A8E1", mark: "prime",    hint: "Carrega no botão Prime Video do comando, ou abre-o na lista de apps." },
    { id: "disneyplus", name: "Disney+",     color: "#113CCF", mark: "D+",       hint: "Abre o Disney+ na lista de apps (botão Apps do comando)." },
    { id: "hbomax",     name: "Max",         color: "#002BE7", mark: "max",      hint: "Abre o Max na lista de apps (botão Apps do comando)." },
    { id: "spotify",    name: "Spotify",     color: "#1DB954", mark: "♫",   hint: "Abre o Spotify na lista de apps (botão Apps do comando)." },
    { id: "rtpplay",    name: "RTP Play",    color: "#0B5CAB", mark: "RTP",      url: "https://www.rtp.pt/play/" },
    { id: "pesquisa",   name: "Pesquisar",   color: "#4285F4", mark: "⌕",   url: "https://www.google.pt/" },
    { id: "tv",         name: "TV",          color: "#3A3F47", mark: "TV",       hint: "Carrega no botão de fonte (Input) do comando e escolhe TV." },
    { id: "hdmi",       name: "HDMI",        color: "#3A3F47", mark: "HDMI",     hint: "Carrega no botão de fonte (Input) do comando e escolhe a entrada HDMI." }
  ],

  /* Fundos. "grad" é um gradiente CSS (não pesa nada). Para usar uma foto, põe o ficheiro em bg/
     (JPG até ~200 KB, 1280x720) e acrescenta { id: "praia", name: "Praia", img: "bg/praia.jpg" }. */
  backgrounds: [
    { id: "noite",    name: "Noite",    grad: ["#0f2027", "#203a43", "#2c5364"] },
    { id: "oceano",   name: "Oceano",   grad: ["#0b3d4a", "#0e6b6b", "#1f8a70"] },
    { id: "floresta", name: "Floresta", grad: ["#13241a", "#1e3d2a", "#3a5f3a"] },
    { id: "aurora",   name: "Aurora",   grad: ["#1a1033", "#3b1f5c", "#0f5e63"] },
    { id: "ocaso",    name: "Ocaso",    grad: ["#2b1a2f", "#6b2f3a", "#c0623b"] },
    { id: "escuro",   name: "Escuro",   grad: ["#0a0a0a", "#141414", "#1c1c1c"] }
  ],

  designs: [
    { id: "shore",   name: "Mosaico" },
    { id: "minimal", name: "Minimal" }
  ]
};
