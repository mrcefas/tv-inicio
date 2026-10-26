/* Início: ecrã inicial para Hisense VIDAA.
   Escrito em ES5 (sem let/const, arrow functions ou template strings) e sem APIs recentes,
   porque o browser do VIDAA de 2019/2020 é antigo. As preferências ficam no localStorage da TV. */
(function () {
  var C = window.INICIO_CONFIG;
  var STORE = "inicio.prefs.v1";
  var stage = document.getElementById("stage");
  var P = load();
  var screenStack = ["home"];
  var lastFocus = {};
  var idleAt = new Date().getTime();
  var toastTimer = null;

  // ---------------------------------------------------------------- utilitários

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function hasClass(el, c) { return (" " + el.className + " ").indexOf(" " + c + " ") >= 0; }
  function addClass(el, c) { if (!hasClass(el, c)) el.className = (el.className + " " + c).replace(/^\s+/, ""); }
  function removeClass(el, c) { el.className = (" " + el.className + " ").replace(" " + c + " ", " ").replace(/^\s+|\s+$/g, ""); }
  function find(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function indexOfId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return i;
    return -1;
  }
  function copyDefaults() {
    var d = C.defaults, o = {};
    for (var k in d) o[k] = d[k];
    o.apps = d.apps.slice();
    return o;
  }

  // ---------------------------------------------------------------- preferências

  function load() {
    var p = copyDefaults();
    try {
      var raw = window.localStorage.getItem(STORE);
      if (raw) {
        var saved = JSON.parse(raw);
        for (var k in saved) p[k] = saved[k];
      }
    } catch (e) { /* sem localStorage: fica com os valores por defeito */ }
    // apps que já não existem na configuração são ignoradas
    var ok = [];
    for (var i = 0; i < p.apps.length; i++) if (find(C.apps, p.apps[i])) ok.push(p.apps[i]);
    p.apps = ok;
    if (!find(C.designs, p.design)) p.design = C.defaults.design;
    if (!find(C.backgrounds, p.bg)) p.bg = C.defaults.bg;
    return p;
  }
  function save() {
    try { window.localStorage.setItem(STORE, JSON.stringify(P)); } catch (e) { /* ignora */ }
  }

  // ---------------------------------------------------------------- palco 1920x1080 escalado ao ecrã

  function fit() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    var t = "scale(" + s + ")";
    stage.style.webkitTransform = t;
    stage.style.transform = t;
  }
  window.addEventListener("resize", fit);

  // ---------------------------------------------------------------- relógio

  var DIAS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
  var MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

  function two(n) { return n < 10 ? "0" + n : "" + n; }
  function timeText(d) {
    var h = d.getHours(), m = two(d.getMinutes());
    if (!P.hour12) return two(h) + ":" + m;
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ":" + m;
  }
  function greeting(h) {
    if (h >= 6 && h < 13) return "Bom dia";
    if (h >= 13 && h < 20) return "Boa tarde";
    return "Boa noite";
  }
  function tick() {
    var d = new Date();
    $("time").innerHTML = timeText(d);
    $("date").innerHTML = DIAS[d.getDay()] + ", " + d.getDate() + " de " + MESES[d.getMonth()];
    $("greet").innerHTML = greeting(d.getHours());
    if (!hasClass($("saver"), "hidden")) $("saverClock").innerHTML = timeText(d);
    checkIdle();
  }

  // ---------------------------------------------------------------- aparência

  function applyPrefs() {
    var cls = "d-" + P.design;
    if (P.clock === "hide") cls += " clock-hide";
    stage.className = cls;
    var b = find(C.backgrounds, P.bg), el = $("bg");
    if (b.img) {
      el.style.backgroundImage = "url(" + b.img + ")";
    } else {
      var g = b.grad;
      el.style.backgroundImage = "linear-gradient(135deg, " + g[0] + " 0%, " + g[1] + " 55%, " + g[2] + " 100%)";
    }
  }

  function tileHtml(app, key, extra) {
    return '<div class="tile f" data-key="' + key + '" style="background-color:' + app.color + ';">' + (extra || "") +
      '<div class="mark">' + esc(app.mark) + '</div><div class="name">' + esc(app.name) + "</div></div>";
  }
  // Mosaico usa tiles translúcidos; Minimal e a lista de apps usam a cor da marca suavizada.
  function homeTileHtml(app) {
    var key = "app-" + app.id;
    if (P.design === "shore") {
      return '<div class="tile f" data-key="' + key + '"><div class="mark">' + esc(app.mark) + '</div><div class="name">' +
        esc(app.name) + '</div><div class="bar" style="background-color:' + app.color + ';"></div></div>';
    }
    return '<div class="tile f" data-key="' + key + '"><div class="mark">' + esc(app.mark) +
      '</div><div class="name">' + esc(app.name) + "</div></div>";
  }

  function renderHome() {
    var h = "";
    for (var i = 0; i < P.apps.length; i++) h += homeTileHtml(find(C.apps, P.apps[i]));
    $("tiles").innerHTML = h;
  }

  function cycle(list, cur, dir) {
    var i = indexOfId(list, cur);
    i = (i + dir + list.length) % list.length;
    return list[i].id;
  }

  var LOOK_ROWS = [
    { key: "design", label: "Design", value: function () { return find(C.designs, P.design).name; },
      change: function (dir) { P.design = cycle(C.designs, P.design, dir); } },
    { key: "bg", label: "Fundo", value: function () { return find(C.backgrounds, P.bg).name; },
      change: function (dir) { P.bg = cycle(C.backgrounds, P.bg, dir); } },
    { key: "clock", label: "Relógio", value: function () { return P.clock === "hide" ? "Esconder" : "Mostrar"; },
      change: function () { P.clock = P.clock === "hide" ? "show" : "hide"; } },
    { key: "hour12", label: "Formato da hora", value: function () { return P.hour12 ? "12 horas" : "24 horas"; },
      change: function () { P.hour12 = !P.hour12; } },
    { key: "apps", label: "Escolher apps", value: function () { return P.apps.length + " ›"; },
      ok: function () { openScreen("apps"); } },
    { key: "diag", label: "Diagnóstico", value: function () { return "›"; },
      ok: function () { openScreen("diag"); } },
    { key: "reset", label: "Repor por defeito", value: function () { return ""; },
      ok: function () { P = copyDefaults(); afterChange(); showToast("Aparência reposta."); } }
  ];

  function renderLook() {
    var h = "";
    for (var i = 0; i < LOOK_ROWS.length; i++) {
      var r = LOOK_ROWS[i];
      var arrows = r.change ? "‹ " + esc(r.value()) + " ›" : esc(r.value());
      h += '<div class="row f" data-key="look-' + r.key + '">' + esc(r.label) + '<span class="val">' + arrows + "</span></div>";
    }
    $("lookRows").innerHTML = h;
  }

  function renderApps() {
    var h = "";
    for (var i = 0; i < C.apps.length; i++) {
      var a = C.apps[i], pos = -1;
      for (var j = 0; j < P.apps.length; j++) if (P.apps[j] === a.id) pos = j;
      var badge = pos >= 0 ? '<div class="num">' + (pos + 1) + "</div>" : "";
      h += tileHtml(a, "pick-" + a.id, badge).replace('class="tile f"', 'class="tile f' + (pos >= 0 ? "" : " off") + '"');
    }
    $("appGrid").innerHTML = h;
  }

  function afterChange() {
    var key = currentFocusKey();
    save();
    applyPrefs();
    renderHome();
    renderLook();
    renderApps();
    if (key) focusKey(key);
  }

  // ---------------------------------------------------------------- diagnóstico (só leitura)

  function renderDiag() {
    var lines = [];
    lines.push("Ecrã: " + window.innerWidth + " x " + window.innerHeight);
    lines.push("User agent: " + navigator.userAgent);
    var ls = "não";
    try { window.localStorage.setItem("inicio.test", "1"); window.localStorage.removeItem("inicio.test"); ls = "sim"; } catch (e) { /* */ }
    lines.push("localStorage: " + ls);
    var names = {}, found = [];
    try { for (var k in window) names[k] = 1; } catch (e) { /* */ }
    try { var own = Object.getOwnPropertyNames(window); for (var i = 0; i < own.length; i++) names[own[i]] = 1; } catch (e) { /* */ }
    for (var n in names) if (/hisense|hiutils|vidaa|opera|tv_/i.test(n)) found.push(n);
    found.sort();
    lines.push("");
    lines.push("Funções da TV encontradas (" + found.length + "):");
    lines.push(found.length ? found.join(", ") : "(nenhuma)");
    $("diagOut").innerHTML = esc(lines.join("\n"));
  }

  // ---------------------------------------------------------------- ecrãs e foco

  function current() { return screenStack[screenStack.length - 1]; }

  function focusables() {
    var root = $(current());
    var out = root.querySelectorAll(".f");
    var list = [];
    for (var i = 0; i < out.length; i++) list.push(out[i]);
    return list;
  }
  function currentFocusKey() {
    var el = stage.querySelector(".focus");
    return el ? el.getAttribute("data-key") : null;
  }
  function setFocus(el) {
    var old = stage.querySelectorAll(".focus");
    for (var i = 0; i < old.length; i++) removeClass(old[i], "focus");
    if (!el) return;
    addClass(el, "focus");
    lastFocus[current()] = el.getAttribute("data-key");
  }
  function focusKey(key) {
    var list = focusables();
    for (var i = 0; i < list.length; i++) if (list[i].getAttribute("data-key") === key) return setFocus(list[i]);
    setFocus(list[0] || null);
  }

  function openScreen(id) {
    if (id === "diag") renderDiag();
    if (id === "apps") renderApps();
    if (id === "look") renderLook();
    var prev = current();
    // o painel de aparência fica por cima do ecrã inicial; os outros ecrãs substituem-no
    if (prev !== "home" || id !== "look") removeClass($(prev), "on");
    screenStack.push(id);
    addClass($(id), "on");
    focusKey(lastFocus[id]);
  }
  function back() {
    if (screenStack.length <= 1) return false;
    var leaving = screenStack.pop();
    removeClass($(leaving), "on");
    addClass($(current()), "on");
    if (current() === "look") renderLook();
    focusKey(lastFocus[current()]);
    return true;
  }

  // Navegação espacial: escolhe o elemento mais próximo na direção da seta.
  function centerOf(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  function move(dir) {
    var list = focusables();
    var cur = stage.querySelector(".focus");
    if (!cur || list.indexOf(cur) < 0) return setFocus(list[0] || null);
    var c = centerOf(cur), best = null, bestScore = Infinity;
    for (var i = 0; i < list.length; i++) {
      if (list[i] === cur) continue;
      var p = centerOf(list[i]), dx = p.x - c.x, dy = p.y - c.y, main, side;
      if (dir === "left") { main = -dx; side = Math.abs(dy); }
      else if (dir === "right") { main = dx; side = Math.abs(dy); }
      else if (dir === "up") { main = -dy; side = Math.abs(dx); }
      else { main = dy; side = Math.abs(dx); }
      if (main <= 1) continue;
      var score = main + side * 2;
      if (score < bestScore) { bestScore = score; best = list[i]; }
    }
    if (best) setFocus(best);
  }

  // ---------------------------------------------------------------- ações

  function showToast(text) {
    var t = $("toast");
    t.innerHTML = esc(text);
    removeClass(t, "hidden");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { addClass(t, "hidden"); }, 4500);
  }

  function launch(app) {
    if (app.url) { window.location.href = app.url; return; }
    showToast(app.hint || "Abre esta app pela lista de apps do comando.");
  }

  function togglePick(id) {
    var i = -1;
    for (var j = 0; j < P.apps.length; j++) if (P.apps[j] === id) i = j;
    if (i >= 0) {
      if (P.apps.length === 1) return showToast("Fica pelo menos uma app no ecrã inicial.");
      P.apps.splice(i, 1);
    } else {
      P.apps.push(id);
    }
    afterChange();
  }

  function lookRow(key) {
    for (var i = 0; i < LOOK_ROWS.length; i++) if ("look-" + LOOK_ROWS[i].key === key) return LOOK_ROWS[i];
    return null;
  }

  function ok() {
    var key = currentFocusKey();
    if (!key) return;
    if (key === "q-look") return openScreen("look");
    if (key.indexOf("app-") === 0) return launch(find(C.apps, key.slice(4)));
    if (key.indexOf("pick-") === 0) return togglePick(key.slice(5));
    var r = lookRow(key);
    if (r && r.ok) return r.ok();
    if (r && r.change) { r.change(1); afterChange(); }
  }

  function sideways(dir) {
    var r = current() === "look" ? lookRow(currentFocusKey()) : null;
    if (r && r.change) { r.change(dir === "left" ? -1 : 1); afterChange(); return; }
    move(dir);
  }

  // ---------------------------------------------------------------- proteção de ecrã

  function checkIdle() {
    var mins = C.screensaverMinutes;
    if (!mins || current() !== "home" || !hasClass($("saver"), "hidden")) return;
    if (new Date().getTime() - idleAt > mins * 60000) showSaver();
  }
  function showSaver() {
    removeClass($("saver"), "hidden");
    moveSaver();
  }
  // muda o relógio de sítio para não marcar o ecrã
  function moveSaver() {
    if (hasClass($("saver"), "hidden")) return;
    var el = $("saverClock");
    el.innerHTML = timeText(new Date());
    el.style.left = Math.round(100 + Math.random() * 1300) + "px";
    el.style.top = Math.round(100 + Math.random() * 750) + "px";
    setTimeout(moveSaver, 30000);
  }
  function hideSaver() {
    idleAt = new Date().getTime();
    if (hasClass($("saver"), "hidden")) return false;
    addClass($("saver"), "hidden");
    return true;
  }

  // ---------------------------------------------------------------- teclas do comando

  // Browsers antigos não têm e.key: usa-se keyCode. VIDAA: Back = 8; LG = 461; Samsung = 10009.
  var KEYS = { 37: "left", 38: "up", 39: "right", 40: "down", 13: "ok", 8: "back", 27: "back", 461: "back", 10009: "back" };

  document.addEventListener("keydown", function (e) {
    var cmd = KEYS[e.keyCode];
    if (hideSaver()) { if (cmd) e.preventDefault(); return; }
    if (!cmd) return;
    // no ecrã inicial, Back segue o comportamento normal da TV (sair da app)
    if (cmd === "back") { if (back()) e.preventDefault(); return; }
    e.preventDefault();
    if (cmd === "ok") ok();
    else if (cmd === "left" || cmd === "right") sideways(cmd);
    else move(cmd);
  });

  stage.addEventListener("click", function (e) {
    if (hideSaver()) return;
    var el = e.target;
    while (el && el !== stage && !hasClass(el, "f")) el = el.parentNode;
    if (!el || el === stage || focusables().indexOf(el) < 0) return;
    setFocus(el);
    ok();
  });

  // ---------------------------------------------------------------- arranque

  fit();
  applyPrefs();
  renderHome();
  tick();
  setInterval(tick, 10000);
  focusKey(P.apps.length ? "app-" + P.apps[0] : "q-look");
})();
