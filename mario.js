// Gaudioso — Canvas Platformer — 10 Livelli
window.marioStart = (function () {
  'use strict';

  const W = 800, H = 600, T = 48, ROWS = 13, COLS = 210;
  const E = 0, G = 1, B = 2, Q = 3, M = 4, U = 5, S = 6, PL = 7, PR = 8, FF = 9, IF_ = 10;
  const GOOMBA = 1, KOOPA = 2;
  const FIREBALL = 1, ICEBALL = 2;
  const GRAV = 0.55, MAX_FALL = 15, JUMP_VY = -15.5, JUMP_RELEASE = -7;
  const WALK = 3.5, RUN = 6.5, ACCEL = 0.45, DECEL = 0.3, AIR_DECEL = 0.1;
  const FUCHSIA = '#cc00cc', SKIN = '#fbd0a8', BROWN = '#6b3a1f';
  const BLUE = '#0858a8', SHOE = '#7b4213';
  const GRN = '#00a800', DGRN = '#006800', YEL = '#f8d800';
  const FIRE_C = '#e87010', ICE_C = '#00aaff';

  // ── AUDIO ─────────────────────────────────────────────────────────────────────
  let ac;
  function getAC() { if (!ac) try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} return ac; }
  function tone(freq, dur, vol = 0.18, type = 'square', delay = 0) {
    const a = getAC(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, a.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + delay + dur);
    o.connect(g); g.connect(a.destination);
    o.start(a.currentTime + delay); o.stop(a.currentTime + delay + dur);
  }
  const SFX = {
    jump: () => { tone(360, 0.06, 0.12); tone(500, 0.1, 0.1, 'square', 0.04); },
    coin: () => { tone(988, 0.07, 0.18, 'sine'); tone(1319, 0.14, 0.16, 'sine', 0.06); },
    stomp: () => tone(110, 0.12, 0.25),
    powerup: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.11, 0.18, 'sine', i * 0.1)),
    die: () => { tone(440, 0.08, 0.18); [420, 390, 360, 330, 300, 270].forEach((f, i) => tone(f, 0.07, 0.14, 'square', 0.1 + i * 0.08)); },
    bump: () => tone(150, 0.08, 0.28),
    brick: () => { tone(190, 0.06, 0.28); tone(140, 0.09, 0.22, 'square', 0.05); },
    flag: () => [400, 500, 600, 700, 800, 700, 800, 1000].forEach((f, i) => tone(f, 0.1, 0.18, 'sine', i * 0.11)),
    kick: () => tone(170, 0.09, 0.25),
    clear: () => [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, 0.13, 0.18, 'sine', i * 0.13)),
    shoot: () => { tone(600, 0.06, 0.12, 'square'); tone(400, 0.04, 0.08, 'square', 0.04); },
    freeze: () => [400, 600, 800, 600, 400].forEach((f, i) => tone(f, 0.08, 0.12, 'sine', i * 0.06)),
  };

  // ── DECORAZIONI ───────────────────────────────────────────────────────────────
  const CLOUDS = [200, 700, 1300, 1900, 2600, 3300, 4100, 4900, 5700, 6500, 7300, 8100, 8900]
    .map((cx, i) => ({ cx, cy: 70 + (i % 3) * 20, r: 28 + (i % 3) * 10 }));
  const HILLS = [100, 600, 1200, 1900, 2700, 3500, 4400, 5300, 6200, 7100, 8000]
    .map((hx, i) => ({ hx, r: 70 + (i % 3) * 20 }));

  // ── 10 LIVELLI ────────────────────────────────────────────────────────────────
  // gr=ground[[start,w]], ti=tiles[[r,c,t]], pp=pipes[[topRow,col,h]]
  // en=enemies[[type,tx]], st=[stairAsc,stairDesc], ca=castleCol, fp=flagpoleCol
  const G_ = GOOMBA, K_ = KOOPA;
  const LVLS = [
    { // 1 – Intro classico
      cols: 210, sky: '#5c8afc', timer: 400, espd: 1,
      gr: [[0,69],[71,15],[90,4],[97,4],[105,4],[111,72]],
      ti: [[8,17,B],[8,18,Q],[8,19,B],[8,20,Q],[8,21,B],[4,20,M],[8,23,Q],
           [4,79,B],[4,80,Q],[4,81,B],[4,82,B],[4,85,B],[4,86,B],[4,87,B],[4,88,B],
           [6,92,S],[6,93,S],[6,94,S],[6,95,S],[6,96,S],
           [8,101,B],[9,101,B],[10,101,B],[8,107,B],[9,107,B],[10,107,B],
           [8,112,Q],[8,113,B],[8,114,Q],[8,115,B],[8,116,Q],[8,117,B]],
      pp: [[9,29,2],[8,39,3],[7,47,4],[7,58,4]],
      en: [[G_,22],[G_,36],[G_,38],[G_,52],[G_,55],[G_,81],[G_,84],[K_,92],
           [G_,100],[G_,101],[G_,112],[G_,115],[G_,125],[G_,128]],
      st: [131,142], ca: 152, fp: 148,
    },
    { // 2 – Deserto, fiore fuoco
      cols: 210, sky: '#d08030', timer: 380, espd: 1.3,
      gr: [[0,55],[58,12],[73,10],[87,5],[96,97]],
      ti: [[8,13,B],[8,14,FF],[8,15,B],
           [4,68,B],[4,69,Q],[4,70,B],[4,71,B],
           [6,77,S],[6,78,S],[6,79,S],[6,80,S],
           [8,91,B],[9,91,B],[10,91,B],
           [8,97,Q],[8,98,B],[8,99,Q],[8,100,B],[8,101,Q],[8,102,B],
           [6,120,S],[6,121,S],[6,122,S],[6,123,S],[6,124,S],
           [8,130,B],[8,131,Q],[8,132,B]],
      pp: [[9,24,2],[8,36,3],[7,50,4],[7,64,4]],
      en: [[G_,20],[G_,32],[G_,34],[K_,44],[G_,54],[G_,57],[G_,70],[G_,73],
           [K_,83],[G_,93],[G_,95],[G_,103],[G_,107],[G_,118],[G_,122],[G_,128],[G_,133]],
      st: [138,149], ca: 159, fp: 155,
    },
    { // 3 – Sotterraneo, fiore ghiaccio
      cols: 210, sky: '#0a0a18', timer: 360, espd: 1.5,
      gr: [[0,210]],
      ti: [[5,10,S],[5,11,S],[5,12,S],[5,13,S],[5,14,S],
           [5,22,S],[5,23,S],[5,24,S],[5,25,S],
           [7,32,S],[7,33,S],[7,34,S],[7,35,S],[7,36,S],
           [5,44,S],[5,45,S],[5,46,S],[5,47,S],
           [5,56,B],[5,57,IF_],[5,58,B],
           [7,65,S],[7,66,S],[7,67,S],[7,68,S],[7,69,S],
           [5,78,S],[5,79,S],[5,80,S],[5,81,S],
           [3,88,Q],[3,89,B],[3,90,Q],
           [7,98,S],[7,99,S],[7,100,S],[7,101,S],[7,102,S],
           [5,110,B],[5,111,B],[5,112,Q],[5,113,B],[5,114,B],
           [7,122,S],[7,123,S],[7,124,S],[7,125,S],
           [5,132,S],[5,133,S],[5,134,S],[5,135,S],[5,136,S],
           [7,144,S],[7,145,S],[7,146,S],[7,147,S],[7,148,S],[7,149,S],
           [5,153,B],[5,154,FF],[5,155,B]],
      pp: [],
      en: [[K_,15],[G_,23],[G_,25],[K_,33],[G_,45],[K_,57],[G_,67],[K_,79],
           [G_,89],[G_,91],[K_,100],[G_,113],[K_,123],[G_,133],[G_,135],
           [K_,145],[G_,153],[G_,156]],
      st: [160,168], ca: 178, fp: 174,
    },
    { // 4 – Cielo (piattaforme volanti)
      cols: 210, sky: '#a0c8ff', timer: 340, espd: 1.6,
      gr: [[0,22],[25,12],[40,8],[52,8],[64,8],[76,8],[88,10],[102,8],[114,10],[128,82]],
      ti: [[5,25,S],[5,26,S],[5,27,S],[5,28,S],[5,29,S],
           [7,40,S],[7,41,S],[7,42,S],[7,43,S],[7,44,S],
           [5,52,S],[5,53,S],[5,54,S],[5,55,S],
           [7,64,S],[7,65,S],[7,66,S],[7,67,S],
           [5,76,S],[5,77,S],[5,78,S],[5,79,S],
           [7,88,S],[7,89,S],[7,90,S],[7,91,S],[7,92,S],
           [5,102,S],[5,103,S],[5,104,S],[5,105,S],
           [7,114,S],[7,115,S],[7,116,S],[7,117,S],[7,118,S],
           [4,52,Q],[4,53,FF],[4,54,Q],
           [4,88,Q],[4,89,IF_],[4,90,Q],
           [4,102,B],[4,103,Q],[4,104,B]],
      pp: [],
      en: [[G_,26],[G_,28],[K_,41],[G_,43],[G_,53],[G_,55],[K_,65],[G_,67],
           [G_,77],[G_,79],[K_,89],[G_,91],[G_,103],[G_,105],[K_,115],[G_,117],
           [G_,130],[G_,133],[G_,138]],
      st: [146,157], ca: 167, fp: 163,
    },
    { // 5 – Foresta densa, entrambi i fiori
      cols: 210, sky: '#0a1f0a', timer: 320, espd: 1.8,
      gr: [[0,58],[62,12],[78,8],[90,8],[102,108]],
      ti: [[8,12,B],[8,13,FF],[8,14,B],
           [8,18,Q],[8,19,B],[8,20,Q],
           [4,70,B],[4,71,Q],[4,72,B],
           [6,80,S],[6,81,S],[6,82,S],[6,83,S],[6,84,S],
           [4,92,B],[4,93,IF_],[4,94,B],
           [8,103,Q],[8,104,B],[8,105,Q],[8,106,B],[8,107,Q],[8,108,B],
           [6,118,S],[6,119,S],[6,120,S],[6,121,S],
           [8,128,B],[9,128,B],[10,128,B],
           [8,134,Q],[8,135,B],[8,136,Q],[8,137,B]],
      pp: [[9,26,2],[8,38,3],[7,52,4],[7,66,4]],
      en: [[G_,18],[G_,20],[G_,32],[G_,34],[K_,44],[G_,54],[G_,56],[G_,60],
           [G_,73],[G_,75],[K_,85],[G_,92],[G_,94],[G_,97],[G_,104],[G_,106],
           [K_,113],[G_,120],[G_,122],[G_,130],[G_,136],[G_,140]],
      st: [146,157], ca: 167, fp: 163,
    },
    { // 6 – Castello interno, koopa ovunque
      cols: 210, sky: '#1a1a2e', timer: 300, espd: 2.0,
      gr: [[0,210]],
      ti: [[3,15,B],[4,15,B],[5,15,B],[6,15,B],[7,15,B],[8,15,B],[9,15,B],[10,15,B],
           [3,16,B],[4,16,B],[5,16,B],
           [5,25,S],[5,26,S],[5,27,S],[5,28,S],[5,29,S],[5,30,S],
           [3,38,B],[4,38,B],[5,38,B],[6,38,B],[7,38,B],[8,38,B],
           [3,42,B],[4,42,B],[5,42,B],
           [7,50,S],[7,51,S],[7,52,S],[7,53,S],[7,54,S],[7,55,S],
           [3,62,B],[4,62,B],[5,62,B],[6,62,B],[7,62,B],[8,62,B],[9,62,B],[10,62,B],
           [5,66,S],[5,67,S],[5,68,S],[5,69,S],[5,70,S],
           [5,75,B],[4,75,B],[3,75,B],[5,76,FF],
           [7,83,S],[7,84,S],[7,85,S],[7,86,S],[7,87,S],[7,88,S],
           [3,95,B],[4,95,B],[5,95,B],[6,95,B],[7,95,B],[8,95,B],[9,95,B],[10,95,B],
           [5,99,S],[5,100,S],[5,101,S],[5,102,S],[5,103,S],
           [5,107,B],[4,107,B],[3,107,B],[5,108,IF_],
           [7,115,S],[7,116,S],[7,117,S],[7,118,S],[7,119,S],[7,120,S],
           [3,128,B],[4,128,B],[5,128,B],[6,128,B],[7,128,B],[8,128,B],
           [5,132,S],[5,133,S],[5,134,S],[5,135,S]],
      pp: [],
      en: [[K_,20],[G_,22],[K_,26],[G_,28],[K_,40],[K_,45],
           [K_,52],[G_,54],[K_,63],[K_,68],[G_,70],
           [K_,83],[G_,85],[K_,87],[K_,96],[G_,100],[K_,102],
           [K_,115],[G_,118],[K_,120],[K_,130],[G_,134]],
      st: [149,160], ca: 170, fp: 166,
    },
    { // 7 – Notte, nemici veloci, tanti buchi
      cols: 210, sky: '#050520', timer: 280, espd: 2.3,
      gr: [[0,48],[52,10],[66,10],[80,8],[92,8],[104,8],[116,10],[130,80]],
      ti: [[8,14,B],[8,15,FF],[8,16,B],[4,15,M],
           [5,52,S],[5,53,S],[5,54,S],[5,55,S],[5,56,S],
           [7,66,S],[7,67,S],[7,68,S],[7,69,S],
           [5,80,S],[5,81,S],[5,82,S],[5,83,S],
           [7,92,S],[7,93,S],[7,94,S],[7,95,S],
           [5,104,S],[5,105,S],[5,106,S],[5,107,S],
           [7,116,S],[7,117,S],[7,118,S],[7,119,S],[7,120,S],
           [4,80,IF_],[4,81,B],[4,82,Q],
           [8,136,Q],[8,137,B],[8,138,Q],[8,139,B],[8,140,Q],[8,141,B],
           [4,136,B],[4,137,Q],[4,138,B]],
      pp: [[9,24,2],[8,36,3],[7,44,4]],
      en: [[G_,18],[G_,20],[K_,33],[G_,43],[G_,45],[G_,54],[K_,56],
           [G_,68],[G_,70],[K_,83],[G_,93],[G_,95],[K_,105],[G_,107],
           [G_,118],[K_,120],[G_,133],[G_,136],[K_,140],[G_,142],[G_,145],[G_,148]],
      st: [149,160], ca: 170, fp: 166,
    },
    { // 8 – Vulcano, buchi estremi
      cols: 210, sky: '#3a0808', timer: 260, espd: 2.7,
      gr: [[0,40],[44,8],[56,6],[66,8],[78,6],[88,8],[100,6],[110,8],[122,88]],
      ti: [[8,12,B],[8,13,FF],[8,14,B],
           [5,44,S],[5,45,S],[5,46,S],[5,47,S],
           [7,56,S],[7,57,S],[7,58,S],[7,59,S],
           [5,66,S],[5,67,S],[5,68,S],[5,69,S],
           [7,78,S],[7,79,S],[7,80,S],[7,81,S],
           [5,88,S],[5,89,S],[5,90,S],[5,91,S],
           [7,100,S],[7,101,S],[7,102,S],[7,103,S],
           [5,110,S],[5,111,S],[5,112,S],[5,113,S],
           [4,78,IF_],[4,79,B],[4,80,Q],
           [8,128,Q],[8,129,B],[8,130,Q],[8,131,B],[8,132,Q],[8,133,B],
           [6,140,S],[6,141,S],[6,142,S],[6,143,S],[6,144,S]],
      pp: [[9,22,2],[8,32,3]],
      en: [[G_,16],[G_,18],[K_,34],[G_,46],[G_,48],[K_,58],[G_,68],[G_,70],
           [K_,80],[G_,90],[G_,92],[K_,102],[G_,112],[G_,114],[K_,124],[G_,130],
           [G_,132],[K_,136],[G_,140],[G_,142],[G_,145],[G_,148]],
      st: [151,162], ca: 172, fp: 168,
    },
    { // 9 – Tundra, piattaforme minuscole
      cols: 210, sky: '#c8e0ff', timer: 240, espd: 3.2,
      gr: [[0,35],[38,5],[46,5],[54,5],[63,5],[71,5],[80,5],[88,5],[96,5],[104,5],[112,98]],
      ti: [[8,12,FF],[8,13,B],[8,14,IF_],
           [5,38,S],[5,39,S],[5,40,S],
           [7,46,S],[7,47,S],[7,48,S],
           [5,54,S],[5,55,S],[5,56,S],
           [7,63,S],[7,64,S],[7,65,S],
           [5,71,S],[5,72,S],[5,73,S],
           [7,80,S],[7,81,S],[7,82,S],
           [5,88,S],[5,89,S],[5,90,S],
           [7,96,S],[7,97,S],[7,98,S],
           [5,104,S],[5,105,S],[5,106,S],
           [8,118,Q],[8,119,B],[8,120,Q],[8,121,B],[8,122,Q],[8,123,B],
           [6,132,S],[6,133,S],[6,134,S],[6,135,S],[6,136,S]],
      pp: [[9,20,2]],
      en: [[G_,14],[K_,26],[G_,39],[G_,41],[K_,47],[G_,55],[G_,57],[K_,64],
           [G_,72],[G_,74],[K_,81],[G_,89],[G_,91],[K_,97],[G_,105],[G_,107],
           [K_,114],[G_,120],[G_,122],[K_,128],[G_,135],[G_,138],[K_,142],[G_,146],[G_,149]],
      st: [151,162], ca: 172, fp: 168,
    },
    { // 10 – Castello finale, difficoltà massima
      cols: 210, sky: '#000000', timer: 200, espd: 4.0,
      gr: [[0,210]],
      ti: [[3,12,B],[4,12,B],[5,12,B],[6,12,B],[7,12,B],[8,12,B],[9,12,B],[10,12,B],
           [3,13,B],[4,13,B],[5,13,B],
           [5,20,FF],
           [3,28,B],[4,28,B],[5,28,B],[6,28,B],[7,28,B],[8,28,B],[9,28,B],[10,28,B],
           [3,29,B],[4,29,B],[5,29,B],
           [7,36,S],[7,37,S],[7,38,S],[7,39,S],[7,40,S],[7,41,S],
           [3,48,B],[4,48,B],[5,48,B],[6,48,B],[7,48,B],[8,48,B],[9,48,B],[10,48,B],
           [5,52,S],[5,53,S],[5,54,S],[5,55,S],[5,56,S],
           [5,60,IF_],
           [3,68,B],[4,68,B],[5,68,B],[6,68,B],[7,68,B],[8,68,B],[9,68,B],[10,68,B],
           [7,72,S],[7,73,S],[7,74,S],[7,75,S],
           [3,82,B],[4,82,B],[5,82,B],[6,82,B],[7,82,B],[8,82,B],[9,82,B],[10,82,B],
           [5,86,S],[5,87,S],[5,88,S],[5,89,S],[5,90,S],
           [3,98,B],[4,98,B],[5,98,B],[6,98,B],[7,98,B],[8,98,B],[9,98,B],[10,98,B],
           [5,102,S],[5,103,S],[5,104,S],[5,105,S],
           [7,112,S],[7,113,S],[7,114,S],[7,115,S],[7,116,S],[7,117,S],
           [3,122,B],[4,122,B],[5,122,B],[6,122,B],[7,122,B],[8,122,B],[9,122,B],[10,122,B],
           [5,126,S],[5,127,S],[5,128,S],[5,129,S],[5,130,S],
           [8,140,Q],[8,141,B],[8,142,Q],[8,143,B],[8,144,Q],[8,145,B],
           [6,150,S],[6,151,S],[6,152,S],[6,153,S],[6,154,S],[6,155,S]],
      pp: [],
      en: [[K_,14],[G_,16],[K_,22],[G_,24],[K_,30],[G_,32],[K_,38],[G_,40],
           [K_,50],[G_,52],[K_,54],[G_,56],[K_,62],[G_,64],[K_,70],[G_,72],
           [K_,84],[G_,86],[K_,88],[G_,90],[K_,100],[G_,102],[K_,104],
           [K_,114],[G_,116],[K_,120],[G_,127],[K_,130],[G_,141],[K_,145],[G_,152],[K_,155]],
      st: [158,169], ca: 179, fp: 175,
    },
  ];

  // ── COSTRUTTORE LIVELLO ───────────────────────────────────────────────────────
  function buildLevel(n) {
    const def = LVLS[n];
    const lev = Array.from({ length: ROWS }, () => new Array(COLS).fill(E));

    // Pavimento rigido
    for (let c = 0; c < COLS; c++) lev[12][c] = G;

    // Terreno riga 11
    def.gr.forEach(([start, width]) => {
      for (let c = start; c < start + width && c < COLS; c++) lev[11][c] = G;
    });

    // Tile extra
    def.ti.forEach(([r, c, t]) => {
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) lev[r][c] = t;
    });

    // Pipe
    def.pp.forEach(([topRow, col, h]) => {
      for (let r = topRow; r < topRow + h && r < ROWS; r++) {
        if (col < COLS) lev[r][col] = PL;
        if (col + 1 < COLS) lev[r][col + 1] = PR;
      }
    });

    // Scalinata ascendente
    const stA = def.st[0], stD = def.st[1];
    for (let i = 0; i < 8; i++)
      for (let r = 11 - i; r <= 11; r++)
        if (stA + i < COLS && r >= 0) lev[r][stA + i] = G;

    // Scalinata discendente
    for (let i = 0; i < 8; i++)
      for (let r = 4 + i; r <= 11; r++)
        if (stD + i < COLS && r >= 0) lev[r][stD + i] = G;

    // Castello
    for (let r = 7; r <= 11; r++)
      for (let c = def.ca; c < def.ca + 6 && c < COLS; c++)
        lev[r][c] = G;

    return lev;
  }

  // ── ENTRY POINT ───────────────────────────────────────────────────────────────
  return function marioStart(canvas, ctx, onBack) {

    let currentLevel = 0;
    let lev = buildLevel(0);

    let state;
    let mario, enemies, particles, powerups, floatCoins, fireballs;
    let camX, camY, score, lives, gameTimer, timerTick;
    let qAnims, flagGrabbed, flagY, winWalkTimer;
    let rafId, running, lastTime = 0, marioActive = true;
    let shootCooldown = 0;

    // ── INPUT ──────────────────────────────────────────────────────────────────
    const K = {};
    function onKeyDown(e) {
      if (!marioActive) return;
      if (!K[e.key]) {
        K[e.key] = true;
        if (state === 'playing' && mario && !mario.dying) {
          if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'z' || e.key === 'Z') {
            if (mario.onGround) {
              mario.vy = JUMP_VY; mario.onGround = false; mario.jumpHeld = true; SFX.jump();
            }
          }
          if (e.key === 'x' || e.key === 'X') shootProjectile();
        }
        if ((state === 'over' || state === 'win') && (e.key === 'Enter' || e.key === ' ')) {
          if (state === 'over') { currentLevel = 0; lives = 3; score = 0; }
          else { currentLevel++; if (currentLevel >= LVLS.length) { currentLevel = 0; lives = 3; score = 0; } }
          startLevel();
        }
        if (e.key === 'Escape') { stopGame(); onBack && onBack(); }
      } else {
        K[e.key] = true;
      }
    }
    function onKeyUp(e) {
      if (!marioActive) return;
      K[e.key] = false;
      if ((e.key === 'ArrowUp' || e.key === ' ' || e.key === 'z' || e.key === 'Z') && mario) {
        if (mario.jumpHeld && mario.vy < JUMP_RELEASE) mario.vy = JUMP_RELEASE;
        mario.jumpHeld = false;
      }
    }
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    function stopGame() {
      marioActive = false; running = false; cancelAnimationFrame(rafId);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      Object.keys(K).forEach(k => K[k] = false);
    }

    // ── INIT ───────────────────────────────────────────────────────────────────
    function initAll() { lives = 3; score = 0; currentLevel = 0; startLevel(); }

    function startLevel() {
      const def = LVLS[currentLevel];
      lev = buildLevel(currentLevel);
      mario = {
        x: 2 * T + 6, y: 9 * T, vx: 0, vy: 0, w: 34, h: 48,
        powerState: 'small',
        onGround: false, dir: 1,
        animFrame: 0, animTick: 0,
        invTimer: 0, jumpHeld: false, dying: false,
      };
      enemies = def.en.map(([type, tx]) => ({
        type, x: tx * T + 4, y: 10 * T,
        vx: -1.5 * def.espd, vy: 0,
        w: type === KOOPA ? 34 : 38, h: type === KOOPA ? 48 : 36,
        alive: true, shell: false, shellMoving: false,
        animTick: 0, animFrame: 0, active: false,
        frozen: false, frozenTimer: 0,
      }));
      particles = []; powerups = []; floatCoins = []; fireballs = [];
      qAnims = {}; camX = 0; camY = 0;
      gameTimer = def.timer; timerTick = 0;
      flagGrabbed = false; flagY = T; winWalkTimer = 0;
      shootCooldown = 0;
      state = 'playing';
    }

    // ── TILE HELPERS ───────────────────────────────────────────────────────────
    function tileAt(r, c) {
      if (r < 0) return E;
      if (r >= ROWS) return G;
      if (c < 0) return G;
      if (c >= COLS) return E;
      return lev[r][c];
    }
    function solid(t) {
      return t === G || t === B || t === Q || t === M || t === U || t === S ||
             t === PL || t === PR || t === FF || t === IF_;
    }

    // ── MOVIMENTO CON COLLISIONE ────────────────────────────────────────────────
    function moveX(ent, dx) {
      ent.x += dx;
      const r1 = Math.floor(ent.y / T), r2 = Math.floor((ent.y + ent.h - 1) / T);
      if (dx < 0) {
        const c = Math.floor(ent.x / T);
        for (let r = r1; r <= r2; r++) {
          if (solid(tileAt(r, c))) { ent.x = (c + 1) * T; ent.vx = 0; break; }
        }
      } else if (dx > 0) {
        const c = Math.floor((ent.x + ent.w - 1) / T);
        for (let r = r1; r <= r2; r++) {
          if (solid(tileAt(r, c))) { ent.x = c * T - ent.w; ent.vx = 0; break; }
        }
      }
    }

    function moveY(ent, dy, isMario) {
      ent.y += dy;
      const c1 = Math.floor(ent.x / T), c2 = Math.floor((ent.x + ent.w - 1) / T);
      if (dy < 0) {
        const r = Math.floor(ent.y / T);
        for (let c = c1; c <= c2; c++) {
          const t = tileAt(r, c);
          if (solid(t)) { ent.y = (r + 1) * T; ent.vy = 0; if (isMario) hitBlock(r, c, t); break; }
        }
      } else if (dy > 0) {
        const r = Math.floor((ent.y + ent.h - 1) / T);
        for (let c = c1; c <= c2; c++) {
          if (solid(tileAt(r, c))) { ent.y = r * T - ent.h; ent.vy = 0; ent.onGround = true; break; }
        }
      }
    }

    function hitBlock(row, col, t) {
      if (t === Q || t === M || t === FF || t === IF_) {
        lev[row][col] = U;
        qAnims[row + ',' + col] = { dy: 0, up: true };
        if (t === M) {
          powerups.push({ type: 'mushroom', x: col * T + 4, y: (row - 1) * T, vx: 1.5, vy: 0, w: T - 8, h: T - 4, alive: true });
          SFX.powerup();
        } else if (t === FF) {
          powerups.push({ type: 'fire', x: col * T + 4, y: (row - 1) * T, vx: 1, vy: 0, w: T - 8, h: T - 4, alive: true });
          SFX.powerup();
        } else if (t === IF_) {
          powerups.push({ type: 'ice', x: col * T + 4, y: (row - 1) * T, vx: 1, vy: 0, w: T - 8, h: T - 4, alive: true });
          SFX.powerup();
        } else {
          spawnFloatCoin(col * T + T / 2, row * T);
          score += 200; SFX.coin();
        }
      } else if (t === B) {
        if (mario.powerState !== 'small') {
          lev[row][col] = E; addBrickParts(col * T, row * T); score += 50; SFX.brick();
        } else {
          qAnims[row + ',' + col] = { dy: 0, up: true }; SFX.bump();
        }
      } else { SFX.bump(); }
    }

    function shootProjectile() {
      if (mario.powerState !== 'fire' && mario.powerState !== 'ice') return;
      if (fireballs.length >= 2 || shootCooldown > 0) return;
      const isFire = mario.powerState === 'fire';
      fireballs.push({
        type: isFire ? FIREBALL : ICEBALL,
        x: mario.dir > 0 ? mario.x + mario.w : mario.x - 12,
        y: mario.y + (mario.h > 48 ? 28 : 12),
        vx: mario.dir * 10, vy: isFire ? -4 : 0,
        bounces: 0, alive: true, w: 12, h: 12,
      });
      shootCooldown = 15; SFX.shoot();
    }

    function spawnFloatCoin(x, y) { floatCoins.push({ x, y, vy: -8, life: 55 }); }
    function addBrickParts(x, y) {
      for (let i = 0; i < 8; i++)
        particles.push({ x: x + Math.random() * T, y: y + Math.random() * T, vx: (Math.random() - .5) * 9, vy: -Math.random() * 11 - 2, life: 45 + Math.random() * 20, color: i % 2 ? '#c84c0c' : '#e07050', sz: 7 + Math.random() * 5 });
    }

    function overlaps(a, b) {
      const m = 4;
      return a.x + m < b.x + b.w - m && a.x + a.w - m > b.x + m &&
             a.y + m < b.y + b.h - m && a.y + a.h - m > b.y + m;
    }

    // ── UPDATE ─────────────────────────────────────────────────────────────────
    function update(ts) {
      const dt = Math.min((ts - lastTime) / 16.67, 2.5);
      lastTime = ts;
      if (state === 'playing') updatePlaying(dt);
      else if (state === 'dying') updateDying(dt);
      else if (state === 'winWalk') updateWinWalk(dt);
    }

    function updatePlaying(dt) {
      timerTick += dt;
      if (timerTick >= 60) { timerTick = 0; gameTimer = Math.max(0, gameTimer - 1); if (gameTimer === 0) killMario(); }
      if (shootCooldown > 0) shootCooldown -= dt;

      updateMario(dt);
      updateEnemies(dt);
      updateFireballs(dt);
      updatePowerups(dt);
      updateParticles(dt);
      updateFloatCoins(dt);
      updateQAnims(dt);

      // Camera orizzontale: scorre solo quando Mario supera il bordo (62% dello schermo)
      const def = LVLS[currentLevel];
      if (mario.x - camX > W * 0.62) camX = mario.x - W * 0.62;
      if (mario.x - camX < W * 0.18 && camX > 0) camX = Math.max(0, mario.x - W * 0.18);
      camX = Math.max(0, Math.min(camX, def.cols * T - W));

      // Camera verticale: scorre solo quando Mario si avvicina al bordo superiore
      if (mario.y - camY < 80) camY = mario.y - 80;
      if (camY < 0 && mario.y - camY > 300) camY = Math.min(0, camY + 2 * dt);
      camY = Math.max(-H * 0.35, Math.min(camY, ROWS * T - H));

      // Asta della bandiera
      const fpx = def.fp * T + T / 2;
      if (!flagGrabbed && mario.x + mario.w > fpx - 4 && mario.x < fpx + 4) {
        flagGrabbed = true; mario.vx = 0; mario.vy = 0; mario.x = fpx - mario.w;
        SFX.flag(); state = 'winWalk';
      }
      if (mario.y > H + 200) killMario();
    }

    function updateMario(dt) {
      if (mario.dying) return;
      const isRunning = K['Shift'];
      const maxSpd = isRunning ? RUN : WALK;
      let inputX = 0;
      if (K['ArrowLeft'] || K['a'] || K['A']) inputX = -1;
      if (K['ArrowRight'] || K['d'] || K['D']) inputX = 1;

      if (inputX !== 0) {
        mario.dir = inputX;
        mario.vx = Math.max(-maxSpd, Math.min(maxSpd, mario.vx + inputX * ACCEL * dt));
      } else {
        const dec = mario.onGround ? DECEL : AIR_DECEL;
        if (Math.abs(mario.vx) < dec * dt) mario.vx = 0;
        else mario.vx -= Math.sign(mario.vx) * dec * dt;
      }

      if (!K['ArrowUp'] && !K[' '] && !K['z'] && !K['Z'] && mario.jumpHeld) {
        if (mario.vy < JUMP_RELEASE) mario.vy = JUMP_RELEASE;
        mario.jumpHeld = false;
      }

      mario.vy = Math.min(mario.vy + GRAV * dt, MAX_FALL);
      mario.onGround = false;
      moveX(mario, mario.vx * dt);
      moveY(mario, mario.vy * dt, true);

      // Probe 1px sotto per rilevare suolo anche con vy~0
      if (!mario.onGround) {
        const pr = Math.floor((mario.y + mario.h + 1) / T);
        const pc1 = Math.floor(mario.x / T), pc2 = Math.floor((mario.x + mario.w - 1) / T);
        for (let c = pc1; c <= pc2; c++) {
          if (solid(tileAt(pr, c))) { mario.onGround = true; break; }
        }
      }

      if (mario.x < camX) { mario.x = camX; mario.vx = 0; }
      if (mario.invTimer > 0) mario.invTimer -= dt;

      if (mario.onGround && Math.abs(mario.vx) > 0.2) {
        mario.animTick += Math.abs(mario.vx) * dt * 0.13;
        if (mario.animTick >= 1) { mario.animTick = 0; mario.animFrame = (mario.animFrame + 1) % 3; }
      } else if (!mario.onGround) { mario.animFrame = 3; }
      else { mario.animFrame = 0; }

      if (mario.invTimer <= 0) {
        for (const e of enemies) {
          if (!e.alive || !overlaps(mario, e)) continue;
          if (mario.vy > 0 && mario.y + mario.h / 2 < e.y + e.h / 2) {
            stompEnemy(e);
          } else {
            if (e.shell && !e.shellMoving) {
              e.shellMoving = true; e.vx = mario.x < e.x ? 9 : -9; SFX.kick(); mario.vy = -8;
            } else { takeDamage(); }
          }
        }
      }
    }

    function updateFireballs(dt) {
      for (const fb of fireballs) {
        if (!fb.alive) continue;
        if (fb.type === FIREBALL) fb.vy = Math.min(fb.vy + GRAV * dt, MAX_FALL);
        fb.x += fb.vx * dt;
        fb.y += fb.vy * dt;

        if (fb.type === FIREBALL) {
          const br = Math.floor((fb.y + fb.h) / T), bc = Math.floor((fb.x + 6) / T);
          if (solid(tileAt(br, bc))) {
            fb.y = br * T - fb.h; fb.vy = -8; fb.bounces++;
            if (fb.bounces > 5) fb.alive = false;
          }
        }
        const wc = Math.floor(fb.vx > 0 ? (fb.x + fb.w) / T : fb.x / T);
        const wr = Math.floor((fb.y + 6) / T);
        if (solid(tileAt(wr, wc))) fb.alive = false;
        if (fb.x < camX - 100 || fb.x > camX + W + 100 || fb.y > H + 200) fb.alive = false;

        for (const e of enemies) {
          if (!e.alive || e.frozen) continue;
          if (fb.x + fb.w > e.x && fb.x < e.x + e.w && fb.y + fb.h > e.y && fb.y < e.y + e.h) {
            if (fb.type === ICEBALL) {
              e.frozen = true; e.frozenTimer = 150; e.vx = 0; SFX.freeze();
            } else {
              e.alive = false; score += 200; addBrickParts(e.x, e.y); SFX.stomp();
            }
            fb.alive = false; break;
          }
        }
      }
      fireballs = fireballs.filter(fb => fb.alive);
    }

    function stompEnemy(e) {
      mario.vy = -10;
      if (e.type === GOOMBA) {
        e.alive = false;
        particles.push({ x: e.x, y: e.y + e.h / 2, vx: 0, vy: 0, life: 28, color: '#8b4513', sz: e.w, flat: true });
        score += 100; SFX.stomp();
      } else if (e.type === KOOPA) {
        if (!e.shell) {
          e.shell = true; e.vx = 0; score += 100; SFX.stomp();
        } else if (e.shellMoving) {
          e.vx = 0; e.shellMoving = false; SFX.kick();
        } else {
          e.shellMoving = true; e.vx = mario.x < e.x ? 9 : -9; score += 200; SFX.kick();
        }
      }
    }

    function takeDamage() {
      if (mario.invTimer > 0) return;
      if (mario.powerState === 'fire' || mario.powerState === 'ice') {
        mario.powerState = 'big'; mario.invTimer = 120; SFX.bump();
      } else if (mario.powerState === 'big') {
        mario.powerState = 'small'; mario.h = 48; mario.y += 48; mario.invTimer = 120; SFX.bump();
      } else { killMario(); }
    }

    function killMario() {
      if (mario.dying) return;
      mario.dying = true; mario.vx = 0; mario.vy = -13; state = 'dying'; lives--; SFX.die();
    }

    function updateDying(dt) {
      mario.vy = Math.min(mario.vy + GRAV * dt, MAX_FALL);
      mario.y += mario.vy * dt;
      if (mario.y > H + 200) {
        if (lives <= 0) { state = 'over'; }
        else { setTimeout(startLevel, 600); state = 'transition'; }
      }
    }

    function updateWinWalk(dt) {
      flagY = Math.min(flagY + 5 * dt, 10 * T);
      mario.y += 5 * dt;
      if (mario.y >= 11 * T - mario.h) {
        mario.y = 11 * T - mario.h; mario.x += 3 * dt; mario.dir = 1;
        mario.animTick += 0.4 * dt;
        if (mario.animTick >= 1) { mario.animTick = 0; mario.animFrame = (mario.animFrame + 1) % 3; }
        winWalkTimer += dt;
        if (winWalkTimer > 120) { score += gameTimer * 50; state = 'win'; SFX.clear(); }
      }
    }

    function updateEnemies(dt) {
      for (const e of enemies) {
        if (!e.alive) continue;
        if (!e.active && Math.abs(e.x - mario.x) < W * 1.5) e.active = true;
        if (!e.active) continue;

        if (e.frozen) {
          e.frozenTimer -= dt;
          if (e.frozenTimer <= 0) { e.alive = false; score += 100; addBrickParts(e.x, e.y); }
          continue;
        }

        e.vy = Math.min(e.vy + GRAV * dt, MAX_FALL);
        e.onGround = false;
        const prevVx = e.vx;
        moveX(e, e.vx * dt);
        if (e.vx === 0 && Math.abs(prevVx) > 0) e.vx = -prevVx;
        if (!e.shell) {
          const frontCol = Math.floor((e.x + (e.vx < 0 ? 0 : e.w)) / T);
          const belowRow = Math.floor((e.y + e.h + 1) / T);
          if (!solid(tileAt(belowRow, frontCol))) e.vx *= -1;
        }
        moveY(e, e.vy * dt, false);
        e.animTick += Math.abs(e.vx) * dt * 0.1;
        if (e.animTick >= 1) { e.animTick = 0; e.animFrame = (e.animFrame + 1) % 2; }
        if (e.y > H + 200) e.alive = false;

        if (e.shell && e.shellMoving) {
          for (const e2 of enemies) {
            if (e2 === e || !e2.alive) continue;
            if (overlaps(e, e2)) { e2.alive = false; score += 100; addBrickParts(e2.x, e2.y); }
          }
        }
      }
    }

    function updatePowerups(dt) {
      for (const p of powerups) {
        if (!p.alive) continue;
        p.vy = Math.min(p.vy + GRAV * dt, MAX_FALL);
        p.onGround = false;
        const prevVx = p.vx;
        moveX(p, p.vx * dt);
        if (p.vx === 0) p.vx = -prevVx;
        moveY(p, p.vy * dt, false);
        if (overlaps(mario, p)) {
          p.alive = false;
          if (p.type === 'mushroom') {
            if (mario.powerState === 'small') { mario.powerState = 'big'; mario.h = 96; mario.y -= 48; }
          } else if (p.type === 'fire' || p.type === 'ice') {
            if (mario.powerState === 'small') { mario.h = 96; mario.y -= 48; }
            mario.powerState = p.type;
          }
          score += 1000; SFX.powerup();
        }
      }
    }

    function updateParticles(dt) {
      for (const p of particles) { p.x += p.vx * dt; p.y += p.vy * dt; if (!p.flat) p.vy += GRAV * dt; p.life -= dt; }
      particles = particles.filter(p => p.life > 0);
    }

    function updateFloatCoins(dt) {
      for (const c of floatCoins) { c.y += c.vy * dt; c.vy += 0.45 * dt; c.life -= dt; }
      floatCoins = floatCoins.filter(c => c.life > 0);
    }

    function updateQAnims(dt) {
      for (const k in qAnims) {
        const a = qAnims[k];
        if (a.up) { a.dy -= 3.5 * dt; if (a.dy <= -14) a.up = false; }
        else { a.dy += 3.5 * dt; if (a.dy >= 0) { a.dy = 0; delete qAnims[k]; } }
      }
    }

    // ── RENDER ─────────────────────────────────────────────────────────────────
    function render() {
      const def = LVLS[currentLevel];
      ctx.fillStyle = def.sky;
      ctx.fillRect(0, 0, W, H);

      drawClouds();

      ctx.save();
      ctx.translate(0, -camY);

      drawHills();
      drawTiles();
      drawFlagpole();
      drawCastle();
      for (const p of powerups) if (p.alive) drawPowerup(p);
      for (const e of enemies) drawEnemy(e);
      for (const fb of fireballs) drawFireball(fb);
      for (const p of particles) {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - camX, p.y, p.sz, p.flat ? p.sz / 2.5 : p.sz);
      }
      for (const c of floatCoins) {
        ctx.fillStyle = YEL; ctx.fillRect(c.x - camX - 8, c.y, 14, 20);
        ctx.fillStyle = '#c8a000'; ctx.fillRect(c.x - camX - 5, c.y + 3, 8, 14);
      }
      drawMario();
      ctx.restore();

      drawHUD();

      if (state === 'over') drawOverlay('GAME OVER', 'Premi INVIO per ricominciare');
      if (state === 'win') {
        if (currentLevel + 1 < LVLS.length)
          drawOverlay(`ZONA ${currentLevel + 1} COMPLETATA!`, `Premi INVIO → Zona ${currentLevel + 2}`);
        else
          drawOverlay('HAI COMPLETATO IL GIOCO!', 'Premi INVIO per ricominciare');
      }
    }

    function drawClouds() {
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      for (const cl of CLOUDS) {
        const sx = cl.cx - camX * 0.35;
        if (sx < -200 || sx > W + 200) continue;
        ctx.beginPath();
        const cy = cl.cy - camY * 0.15;
        ctx.arc(sx, cy, cl.r, 0, Math.PI * 2);
        ctx.arc(sx + cl.r * 0.85, cy - cl.r * 0.3, cl.r * 0.75, 0, Math.PI * 2);
        ctx.arc(sx + cl.r * 1.65, cy, cl.r * 0.65, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawHills() {
      for (const h of HILLS) {
        const sx = h.hx - camX * 0.55;
        if (sx < -200 || sx > W + 200) continue;
        const groundPx = 11 * T;
        ctx.fillStyle = GRN;
        ctx.beginPath(); ctx.arc(sx, groundPx, h.r, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#00c000';
        ctx.beginPath(); ctx.arc(sx - h.r * 0.3, groundPx - h.r * 0.45, h.r * 0.32, Math.PI, 0); ctx.fill();
        ctx.beginPath(); ctx.arc(sx + h.r * 0.35, groundPx - h.r * 0.4, h.r * 0.27, Math.PI, 0); ctx.fill();
      }
    }

    function drawTiles() {
      const c0 = Math.max(0, Math.floor(camX / T) - 1);
      const c1 = Math.min(COLS, c0 + Math.ceil(W / T) + 2);
      for (let row = 0; row < ROWS; row++) {
        for (let col = c0; col < c1; col++) {
          const t = lev[row][col]; if (t === E) continue;
          const sx = col * T - camX;
          let sy = row * T;
          const qa = qAnims[row + ',' + col];
          if (qa) sy += qa.dy;
          drawTile(t, sx, sy, row, col);
        }
      }
    }

    const nowQ = () => performance.now() / 180;

    function drawTile(t, sx, sy, row, col) {
      switch (t) {
        case G:
          ctx.fillStyle = '#c84c0c'; ctx.fillRect(sx, sy, T, T);
          ctx.fillStyle = '#e8701c'; ctx.fillRect(sx + 2, sy + 2, T - 4, T - 4);
          ctx.fillStyle = '#c84c0c';
          ctx.fillRect(sx, sy + T / 2, T, 2); ctx.fillRect(sx + T / 2, sy, 2, T);
          break;
        case B:
          ctx.fillStyle = '#c84c0c'; ctx.fillRect(sx, sy, T, T);
          ctx.fillStyle = '#d85c1c';
          const bh = T / 3;
          for (let bi = 0; bi < 3; bi++) {
            const off = bi % 2 === 0 ? 0 : T / 3;
            ctx.fillRect(sx + off + 1, sy + bi * bh + 2, T / 2 - 3, bh - 4);
            ctx.fillRect(sx + off + T / 2 + 1, sy + bi * bh + 2, T / 2 - 3, bh - 4);
          }
          break;
        case Q: case M: {
          const shine = Math.sin(nowQ()) > 0;
          ctx.fillStyle = shine ? '#f8c800' : '#d8a800'; ctx.fillRect(sx, sy, T, T);
          ctx.fillStyle = '#b86800';
          ctx.fillRect(sx + 2, sy, T - 4, 3); ctx.fillRect(sx + 2, sy + T - 3, T - 4, 3);
          ctx.fillRect(sx, sy + 2, 3, T - 4); ctx.fillRect(sx + T - 3, sy + 2, 3, T - 4);
          ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.round(T * 0.58)}px Arial`;
          ctx.textAlign = 'center'; ctx.fillText('?', sx + T / 2, sy + T * 0.72); ctx.textAlign = 'left';
          break;
        }
        case FF: {
          const shinef = Math.sin(nowQ() * 1.3) > 0;
          ctx.fillStyle = shinef ? '#e86000' : '#c84000'; ctx.fillRect(sx, sy, T, T);
          ctx.fillStyle = '#881800';
          ctx.fillRect(sx + 2, sy, T - 4, 3); ctx.fillRect(sx + 2, sy + T - 3, T - 4, 3);
          ctx.fillRect(sx, sy + 2, 3, T - 4); ctx.fillRect(sx + T - 3, sy + 2, 3, T - 4);
          ctx.fillStyle = '#ffdd00'; ctx.font = `bold ${Math.round(T * 0.48)}px Arial`;
          ctx.textAlign = 'center'; ctx.fillText('F', sx + T / 2, sy + T * 0.7); ctx.textAlign = 'left';
          break;
        }
        case IF_: {
          const shinei = Math.sin(nowQ() * 0.8) > 0;
          ctx.fillStyle = shinei ? '#00aadd' : '#0077bb'; ctx.fillRect(sx, sy, T, T);
          ctx.fillStyle = '#004488';
          ctx.fillRect(sx + 2, sy, T - 4, 3); ctx.fillRect(sx + 2, sy + T - 3, T - 4, 3);
          ctx.fillRect(sx, sy + 2, 3, T - 4); ctx.fillRect(sx + T - 3, sy + 2, 3, T - 4);
          ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.round(T * 0.48)}px Arial`;
          ctx.textAlign = 'center'; ctx.fillText('I', sx + T / 2, sy + T * 0.7); ctx.textAlign = 'left';
          break;
        }
        case U:
          ctx.fillStyle = '#888'; ctx.fillRect(sx, sy, T, T);
          ctx.fillStyle = '#666'; ctx.fillRect(sx + 2, sy + 2, T - 4, T - 4);
          break;
        case S:
          ctx.fillStyle = '#b0b0b0'; ctx.fillRect(sx, sy, T, T);
          ctx.fillStyle = '#ccc'; ctx.fillRect(sx + 2, sy + 2, T - 4, T - 4);
          ctx.fillStyle = '#b0b0b0'; ctx.fillRect(sx, sy + T / 2, T, 2); ctx.fillRect(sx + T / 2, sy, 2, T);
          break;
        case PL: {
          ctx.fillStyle = DGRN; ctx.fillRect(sx, sy, T, T);
          ctx.fillStyle = GRN; ctx.fillRect(sx + 3, sy + 2, T - 6, T);
          const isTopL = row > 0 && tileAt(row - 1, col) !== PL;
          if (isTopL) { ctx.fillStyle = DGRN; ctx.fillRect(sx - 4, sy, T + 4, 13); ctx.fillStyle = GRN; ctx.fillRect(sx - 1, sy + 3, T - 2, 7); }
          break;
        }
        case PR: {
          ctx.fillStyle = DGRN; ctx.fillRect(sx, sy, T, T);
          ctx.fillStyle = GRN; ctx.fillRect(sx + 3, sy + 2, T - 6, T);
          const isTopR = row > 0 && tileAt(row - 1, col) !== PR;
          if (isTopR) { ctx.fillStyle = DGRN; ctx.fillRect(sx, sy, T + 4, 13); ctx.fillStyle = GRN; ctx.fillRect(sx + 3, sy + 3, T - 2, 7); }
          break;
        }
      }
    }

    function drawFlagpole() {
      const fpx = LVLS[currentLevel].fp * T + T / 2 - camX;
      if (fpx < -30 || fpx > W + 30) return;
      ctx.fillStyle = '#606060'; ctx.fillRect(fpx - 2, T, 4, 10 * T);
      ctx.fillStyle = YEL; ctx.beginPath(); ctx.arc(fpx, T, 9, 0, Math.PI * 2); ctx.fill();
      const fy = Math.min(flagY, 10 * T);
      ctx.fillStyle = '#00a800';
      ctx.beginPath(); ctx.moveTo(fpx, fy); ctx.lineTo(fpx + 44, fy + 16); ctx.lineTo(fpx, fy + 32); ctx.fill();
    }

    function drawCastle() {
      const cx = LVLS[currentLevel].ca * T - camX;
      if (cx > W + 100 || cx + 6 * T < 0) return;
      for (let ci = 0; ci < 6; ci++) {
        if (ci % 2 === 0) { ctx.fillStyle = '#808080'; ctx.fillRect(cx + ci * T, 7 * T - 12, T, 12); }
      }
      ctx.fillStyle = '#808080'; ctx.fillRect(cx, 7 * T, 6 * T, 5 * T);
      ctx.fillStyle = '#111'; ctx.fillRect(cx + 2 * T, 9 * T, 2 * T, 3 * T);
      ctx.fillStyle = '#111'; ctx.fillRect(cx + T / 2, 8 * T, T / 2, T / 2); ctx.fillRect(cx + 4 * T, 8 * T, T / 2, T / 2);
    }

    function drawPowerup(p) {
      const sx = p.x - camX, sy = p.y;
      if (p.type === 'mushroom') {
        ctx.fillStyle = '#e00000';
        ctx.beginPath(); ctx.arc(sx + p.w / 2, sy + p.h * 0.48, p.w / 2 + 2, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.fillRect(sx + 2, sy + p.h * 0.46, p.w - 4, p.h * 0.54 + 2);
        [[0.22, 0.18], [0.65, 0.13], [0.43, 0.32]].forEach(([dx, dy]) => {
          ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sx + p.w * dx, sy + p.h * dy, 6, 0, Math.PI * 2); ctx.fill();
        });
        ctx.fillStyle = '#000'; ctx.fillRect(sx + 8, sy + p.h * 0.54, 5, 7); ctx.fillRect(sx + p.w - 13, sy + p.h * 0.54, 5, 7);
      } else if (p.type === 'fire') {
        // Fiore di fuoco: arancione
        ctx.fillStyle = '#ff6600';
        ctx.beginPath(); ctx.arc(sx + p.w / 2, sy + p.h * 0.4, p.w / 2 + 2, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath(); ctx.arc(sx + p.w / 2, sy + p.h * 0.4, p.w / 2 - 5, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#228'; ctx.fillRect(sx + p.w / 2 - 3, sy + p.h * 0.4, 6, p.h * 0.65);
        ctx.fillStyle = '#ff4400'; ctx.beginPath(); ctx.arc(sx + p.w / 2, sy + p.h * 0.4, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffee00'; ctx.beginPath(); ctx.arc(sx + p.w / 2, sy + p.h * 0.4, 4, 0, Math.PI * 2); ctx.fill();
      } else if (p.type === 'ice') {
        // Fiore di ghiaccio: blu
        ctx.fillStyle = '#00aaff';
        ctx.beginPath(); ctx.arc(sx + p.w / 2, sy + p.h * 0.4, p.w / 2 + 2, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#aaddff';
        ctx.beginPath(); ctx.arc(sx + p.w / 2, sy + p.h * 0.4, p.w / 2 - 5, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#228'; ctx.fillRect(sx + p.w / 2 - 3, sy + p.h * 0.4, 6, p.h * 0.65);
        ctx.fillStyle = '#0088cc'; ctx.beginPath(); ctx.arc(sx + p.w / 2, sy + p.h * 0.4, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sx + p.w / 2, sy + p.h * 0.4, 4, 0, Math.PI * 2); ctx.fill();
      }
    }

    function drawFireball(fb) {
      const sx = fb.x - camX;
      if (fb.type === FIREBALL) {
        ctx.shadowBlur = 10; ctx.shadowColor = '#ff6600';
        ctx.fillStyle = '#ff4400'; ctx.beginPath(); ctx.arc(sx + 6, fb.y + 6, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffcc00'; ctx.beginPath(); ctx.arc(sx + 6, fb.y + 6, 3, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.shadowBlur = 10; ctx.shadowColor = '#00aaff';
        ctx.fillStyle = '#00aaff'; ctx.beginPath(); ctx.arc(sx + 6, fb.y + 6, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sx + 6, fb.y + 6, 3, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function drawEnemy(e) {
      const sx = e.x - camX, sy = e.y;
      if (e.frozen) {
        ctx.fillStyle = 'rgba(100,220,255,0.55)'; ctx.fillRect(sx - 2, sy - 2, e.w + 4, e.h + 4);
      }
      if (e.type === GOOMBA) {
        ctx.fillStyle = '#7b3510';
        ctx.beginPath(); ctx.ellipse(sx + e.w / 2, sy + e.h * 0.42, e.w / 2 + 2, e.h * 0.42, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#a04020'; ctx.fillRect(sx + 2, sy + e.h * 0.38, e.w - 4, e.h * 0.62);
        const fa = e.animFrame ? 4 : -4;
        ctx.fillStyle = '#1a0800';
        ctx.fillRect(sx + 2, sy + e.h - 10 + fa, 13, 10); ctx.fillRect(sx + e.w - 15, sy + e.h - 10 - fa, 13, 10);
        ctx.fillStyle = '#fff';
        ctx.fillRect(sx + 5, sy + e.h * 0.28, 11, 9); ctx.fillRect(sx + e.w - 16, sy + e.h * 0.28, 11, 9);
        ctx.fillStyle = '#000';
        ctx.fillRect(sx + 11, sy + e.h * 0.31, 5, 6); ctx.fillRect(sx + e.w - 13, sy + e.h * 0.31, 5, 6);
        ctx.save(); ctx.translate(sx + 12, sy + e.h * 0.25); ctx.rotate(-0.35); ctx.fillRect(-5, 0, 13, 3); ctx.restore();
        ctx.save(); ctx.translate(sx + e.w - 12, sy + e.h * 0.25); ctx.rotate(0.35); ctx.fillRect(-5, 0, 13, 3); ctx.restore();
      } else if (e.type === KOOPA) {
        if (e.shell) {
          ctx.fillStyle = DGRN; ctx.beginPath(); ctx.ellipse(sx + e.w / 2, sy + e.h * 0.6, e.w / 2, e.h * 0.38, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = YEL; ctx.beginPath(); ctx.ellipse(sx + e.w / 2, sy + e.h * 0.6, e.w / 2 - 7, e.h * 0.3, 0, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = DGRN; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(sx + e.w / 2, sy + e.h * 0.22); ctx.lineTo(sx + e.w / 2, sy + e.h * 0.98); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(sx + 2, sy + e.h * 0.6); ctx.lineTo(sx + e.w - 2, sy + e.h * 0.6); ctx.stroke();
        } else {
          ctx.fillStyle = DGRN; ctx.beginPath(); ctx.ellipse(sx + e.w / 2, sy + e.h * 0.5, e.w / 2 + 2, e.h * 0.38, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = YEL; ctx.beginPath(); ctx.ellipse(sx + e.w / 2, sy + e.h * 0.5, e.w / 2 - 6, e.h * 0.3, 0, 0, Math.PI * 2); ctx.fill();
          const hdx = e.vx < 0 ? e.w * 0.22 : e.w * 0.78;
          ctx.fillStyle = YEL; ctx.beginPath(); ctx.arc(sx + hdx, sy + e.h * 0.2, 15, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(sx + hdx + (e.vx < 0 ? -5 : 5), sy + e.h * 0.17, 3, 0, Math.PI * 2); ctx.fill();
          const fa2 = e.animFrame ? 4 : -4;
          ctx.fillStyle = YEL; ctx.fillRect(sx + 3, sy + e.h - 13 + fa2, 12, 13); ctx.fillRect(sx + e.w - 15, sy + e.h - 13 - fa2, 12, 13);
        }
      }
    }

    function drawMario() {
      const sx = mario.x - camX, sy = mario.y;
      if (mario.invTimer > 0 && Math.floor(mario.invTimer / 4) % 2 === 0) return;
      ctx.save();
      if (mario.dir < 0) { ctx.translate(sx + mario.w, 0); ctx.scale(-1, 1); ctx.translate(-sx, 0); }
      const ps = mario.powerState;
      const hatC = FUCHSIA;
      const shirtC = ps === 'fire' ? FIRE_C : ps === 'ice' ? ICE_C : FUCHSIA;
      if (ps === 'small') drawSmallMario(sx, sy, mario.animFrame, hatC, shirtC);
      else drawBigMario(sx, sy, mario.animFrame, hatC, shirtC);
      ctx.restore();
    }

    function drawSmallMario(sx, sy, fr, hatC, shirtC) {
      ctx.fillStyle = hatC; ctx.fillRect(sx + 7, sy, 22, 11); ctx.fillRect(sx + 4, sy + 8, 28, 9);
      ctx.fillStyle = BROWN; ctx.fillRect(sx + 4, sy + 12, 8, 7); ctx.fillRect(sx + 9, sy + 16, 8, 5);
      ctx.fillStyle = SKIN; ctx.fillRect(sx + 7, sy + 11, 22, 13);
      ctx.fillStyle = '#000'; ctx.fillRect(sx + 21, sy + 14, 5, 6);
      ctx.fillStyle = BROWN; ctx.fillRect(sx + 9, sy + 20, 7, 3); ctx.fillRect(sx + 20, sy + 20, 8, 3);
      ctx.fillStyle = shirtC; ctx.fillRect(sx + 7, sy + 24, 22, 8);
      ctx.fillStyle = BLUE; ctx.fillRect(sx + 4, sy + 32, 28, 8);
      ctx.fillStyle = YEL; ctx.fillRect(sx + 10, sy + 29, 3, 3); ctx.fillRect(sx + 23, sy + 29, 3, 3);
      const leg = fr === 3 ? 0 : (fr === 1 ? -4 : (fr === 2 ? 4 : 0));
      ctx.fillStyle = BLUE;
      ctx.fillRect(sx + 4, sy + 40, 11, 8 + Math.max(0, leg)); ctx.fillRect(sx + 21, sy + 40, 11, 8 + Math.max(0, -leg));
      ctx.fillStyle = SHOE;
      ctx.fillRect(sx + 1, sy + 40 + 8 + Math.max(0, leg), 16, 8); ctx.fillRect(sx + 19, sy + 40 + 8 + Math.max(0, -leg), 16, 8);
      if (fr === 3) {
        ctx.fillStyle = BLUE; ctx.fillRect(sx + 4, sy + 36, 11, 6); ctx.fillRect(sx + 21, sy + 36, 11, 6);
        ctx.fillStyle = SHOE; ctx.fillRect(sx + 0, sy + 42, 14, 6); ctx.fillRect(sx + 22, sy + 42, 14, 6);
      }
    }

    function drawBigMario(sx, sy, fr, hatC, shirtC) {
      ctx.fillStyle = hatC; ctx.fillRect(sx + 7, sy, 22, 12); ctx.fillRect(sx + 3, sy + 9, 30, 10);
      ctx.fillStyle = BROWN; ctx.fillRect(sx + 3, sy + 13, 10, 9); ctx.fillRect(sx + 9, sy + 18, 9, 6);
      ctx.fillStyle = SKIN; ctx.fillRect(sx + 5, sy + 12, 26, 18);
      ctx.fillStyle = '#000'; ctx.fillRect(sx + 22, sy + 15, 6, 9);
      ctx.fillStyle = BROWN; ctx.fillRect(sx + 9, sy + 25, 7, 4); ctx.fillRect(sx + 21, sy + 25, 10, 4);
      ctx.fillStyle = SKIN; ctx.fillRect(sx + 16, sy + 21, 9, 7);
      ctx.fillStyle = shirtC; ctx.fillRect(sx + 3, sy + 30, 30, 18);
      ctx.fillStyle = BLUE; ctx.fillRect(sx + 10, sy + 30, 16, 12);
      ctx.fillStyle = shirtC; ctx.fillRect(sx - 3, sy + 33, 9, 13); ctx.fillRect(sx + 30, sy + 33, 9, 13);
      ctx.fillStyle = SKIN; ctx.fillRect(sx - 3, sy + 46, 9, 6); ctx.fillRect(sx + 30, sy + 46, 9, 6);
      ctx.fillStyle = BLUE; ctx.fillRect(sx + 3, sy + 48, 30, 22);
      ctx.fillStyle = YEL; ctx.fillRect(sx + 10, sy + 44, 3, 4); ctx.fillRect(sx + 23, sy + 44, 3, 4);
      const leg = fr === 3 ? 0 : (fr === 1 ? -5 : (fr === 2 ? 5 : 0));
      ctx.fillStyle = BLUE;
      ctx.fillRect(sx + 4, sy + 70, 12, 10 + Math.max(0, leg)); ctx.fillRect(sx + 20, sy + 70, 12, 10 + Math.max(0, -leg));
      ctx.fillStyle = SHOE;
      ctx.fillRect(sx + 0, sy + 80 + Math.max(0, leg), 18, 11); ctx.fillRect(sx + 18, sy + 80 + Math.max(0, -leg), 18, 11);
      if (fr === 3) {
        ctx.fillStyle = BLUE; ctx.fillRect(sx + 4, sy + 66, 12, 8); ctx.fillRect(sx + 20, sy + 66, 12, 8);
        ctx.fillStyle = SHOE; ctx.fillRect(sx - 2, sy + 74, 20, 10); ctx.fillRect(sx + 18, sy + 74, 20, 10);
      }
    }

    function drawHUD() {
      ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, W, 64);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px "Courier New",monospace';
      ctx.textAlign = 'left'; ctx.fillText('GAUDIOSO', 18, 22);
      ctx.font = 'bold 22px "Courier New",monospace';
      ctx.fillText(String(score).padStart(6, '0'), 18, 48);
      ctx.textAlign = 'center';
      ctx.font = 'bold 16px "Courier New",monospace'; ctx.fillText('ZONA', W / 2, 22);
      ctx.font = 'bold 22px "Courier New",monospace'; ctx.fillText(`${currentLevel + 1}-1`, W / 2, 48);
      ctx.textAlign = 'right';
      ctx.font = 'bold 16px "Courier New",monospace'; ctx.fillText('CLOCK', W - 18, 22);
      ctx.font = 'bold 22px "Courier New",monospace'; ctx.fillText(String(Math.max(0, gameTimer)), W - 18, 48);
      // Vite
      ctx.fillStyle = FUCHSIA; ctx.fillRect(18, 52, 14, 8); ctx.fillStyle = SKIN; ctx.fillRect(18, 58, 14, 6);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 16px "Courier New"'; ctx.textAlign = 'left'; ctx.fillText('x' + lives, 38, 70);
      // Stato potere
      if (mario) {
        const ps = mario.powerState;
        if (ps === 'fire') { ctx.fillStyle = FIRE_C; ctx.font = 'bold 13px Arial'; ctx.fillText('FUOCO X=spara', 65, 70); }
        else if (ps === 'ice') { ctx.fillStyle = ICE_C; ctx.font = 'bold 13px Arial'; ctx.fillText('GHIACCIO X=spara', 65, 70); }
      }
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '12px Arial'; ctx.textAlign = 'right';
      ctx.fillText('ESC=Menu', W - 10, 70);
      ctx.textAlign = 'left';
    }

    function drawOverlay(msg1, msg2) {
      ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 40px "Courier New"'; ctx.textAlign = 'center'; ctx.fillText(msg1, W / 2, H / 2 - 28);
      ctx.fillStyle = YEL; ctx.font = '22px "Courier New"'; ctx.fillText(msg2, W / 2, H / 2 + 24);
      ctx.textAlign = 'left';
    }

    // ── GAME LOOP ──────────────────────────────────────────────────────────────
    function loop(ts) {
      if (!running) return;
      update(ts);
      render();
      rafId = requestAnimationFrame(loop);
    }

    running = true; marioActive = true;
    initAll();
    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);

    return stopGame;
  };
})();
