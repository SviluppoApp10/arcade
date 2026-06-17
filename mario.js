// Super Mario Bros — Canvas Clone — World 1-1
// Invocato da gioco.html tramite window.marioStart(canvas, ctx, onBack)

window.marioStart = (function () {
  'use strict';

  // ── COSTANTI ─────────────────────────────────────────────────────────────────
  const W = 800, H = 600;
  const T = 48; // tile size px

  // Tile types
  const E = 0, G = 1, B = 2, Q = 3, M = 4, U = 5, S = 6, PL = 7, PR = 8;

  // Physics (valori fedeli al NES, 60fps)
  const GRAV = 0.55, MAX_FALL = 15;
  const JUMP_VY = -15.5, JUMP_RELEASE = -7;
  const WALK = 3.5, RUN = 6.5, ACCEL = 0.45, DECEL = 0.3, AIR_DECEL = 0.1;

  const ROWS = 13, COLS = 210;
  const FLAGPOLE_COL = 148;

  // ── COLORI ───────────────────────────────────────────────────────────────────
  const RED = '#e52211', SKIN = '#fbd0a8', BROWN = '#6b3a1f';
  const BLUE = '#0858a8', SHOE = '#7b4213';
  const GRN = '#00a800', DGRN = '#006800';
  const YEL = '#f8d800';

  // ── LEVEL DATA ────────────────────────────────────────────────────────────────
  function buildLevel() {
    const lev = Array.from({ length: ROWS }, () => new Array(COLS).fill(E));
    const f = (r, c, w, h, t) => {
      for (let rr = r; rr < r + h && rr < ROWS; rr++)
        for (let cc = c; cc < c + w && cc < COLS; cc++) lev[rr][cc] = t;
    };
    const s = (r, c, t) => { if (r >= 0 && r < ROWS && c >= 0 && c < COLS) lev[r][c] = t; };

    // Pavimento rigido
    f(12, 0, COLS, 1, G);

    // Sezioni di terreno riga 11 (World 1-1 fedele)
    f(11, 0, 69, 1, G);
    f(11, 71, 15, 1, G);
    f(11, 90, 4, 1, G);
    f(11, 97, 4, 1, G);
    f(11, 105, 4, 1, G);
    f(11, 111, 72, 1, G);

    // Primo set di blocchi (riga 8, colonne 17-21)
    s(8, 17, B); s(8, 18, Q); s(8, 19, B); s(8, 20, Q); s(8, 21, B);
    s(4, 20, M); // blocco fungo nascosto in alto
    s(8, 23, Q);

    // Pipe 1: x=29, h=2
    s(9, 29, PL); s(9, 30, PR); s(10, 29, PL); s(10, 30, PR);
    // Pipe 2: x=39, h=3
    s(8, 39, PL); s(8, 40, PR); s(9, 39, PL); s(9, 40, PR); s(10, 39, PL); s(10, 40, PR);
    // Pipe 3: x=47, h=4
    s(7, 47, PL); s(7, 48, PR); s(8, 47, PL); s(8, 48, PR);
    s(9, 47, PL); s(9, 48, PR); s(10, 47, PL); s(10, 48, PR);
    // Pipe 4: x=58, h=4
    s(7, 58, PL); s(7, 59, PR); s(8, 58, PL); s(8, 59, PR);
    s(9, 58, PL); s(9, 59, PR); s(10, 58, PL); s(10, 59, PR);

    // Mattoni aerei riga 4
    s(4, 79, B); s(4, 80, Q); s(4, 81, B); s(4, 82, B);
    s(4, 85, B); s(4, 86, B); s(4, 87, B); s(4, 88, B);

    // Piattaforma solida riga 6
    f(6, 92, 5, 1, S);

    // Blocchi sezione x=101-120
    f(8, 101, 1, 3, B); f(8, 107, 1, 3, B);
    s(8, 112, Q); s(8, 113, B); s(8, 114, Q); s(8, 115, B); s(8, 116, Q); s(8, 117, B);

    // Scalinata ascendente x=131
    for (let i = 0; i < 8; i++) f(11 - i, 131 + i, 1, i + 1, G);
    // Scalinata discendente x=142
    for (let i = 0; i < 8; i++) f(11 - 7 + i, 142 + i, 1, 8 - i, G);

    // Castello finale
    f(7, 152, 6, 5, G);

    return lev;
  }

  // ── NEMICI ───────────────────────────────────────────────────────────────────
  const GOOMBA = 1, KOOPA = 2;
  const ENEMY_DEFS = [
    { type: GOOMBA, tx: 22 }, { type: GOOMBA, tx: 36 }, { type: GOOMBA, tx: 38 },
    { type: GOOMBA, tx: 52 }, { type: GOOMBA, tx: 55 },
    { type: GOOMBA, tx: 81 }, { type: GOOMBA, tx: 84 },
    { type: KOOPA, tx: 92 },
    { type: GOOMBA, tx: 100 }, { type: GOOMBA, tx: 101 },
    { type: GOOMBA, tx: 112 }, { type: GOOMBA, tx: 115 },
    { type: GOOMBA, tx: 125 }, { type: GOOMBA, tx: 128 },
  ];

  // ── NUVOLE E COLLINE (decorative) ────────────────────────────────────────────
  const CLOUDS = [200, 700, 1300, 1900, 2600, 3300, 4100, 4900, 5700, 6500, 7300, 8100, 8900]
    .map((cx, i) => ({ cx, cy: 70 + (i % 3) * 20, r: 28 + (i % 3) * 10 }));
  const HILLS = [100, 600, 1200, 1900, 2700, 3500, 4400, 5300, 6200, 7100, 8000]
    .map((hx, i) => ({ hx, r: 70 + (i % 3) * 20 }));

  // ── AUDIO ─────────────────────────────────────────────────────────────────────
  let ac;
  function getAC() {
    if (!ac) try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    return ac;
  }
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
  };

  // ── MAIN ENTRY POINT ─────────────────────────────────────────────────────────
  return function marioStart(canvas, ctx, onBack) {

    let lev = buildLevel();

    // ── STATO ──────────────────────────────────────────────────────────────────
    let state; // 'playing' | 'dying' | 'win' | 'over' | 'winWalk' | 'paused'
    let mario, enemies, particles, powerups, floatCoins;
    let camX, camY, score, lives, gameTimer, timerTick;
    let qAnims; // { 'r,c': { dy, goingUp } }
    let flagGrabbed, flagY;
    let winWalkTimer;
    let rafId, running;
    let lastTime = 0;
    let marioActive = true;

    // ── INPUT ──────────────────────────────────────────────────────────────────
    const K = {};
    function onKeyDown(e) {
      if (!marioActive) return;
      if (!K[e.key]) {
        K[e.key] = true;
        if (state === 'playing' && mario && !mario.dying) {
          if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'z' || e.key === 'Z') {
            if (mario.onGround) {
              mario.vy = JUMP_VY;
              mario.onGround = false;
              mario.jumpHeld = true;
              SFX.jump();
            }
          }
        }
        if ((state === 'over' || state === 'win') && (e.key === 'Enter' || e.key === ' ')) {
          if (state === 'over') { lives = 3; score = 0; }
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
      marioActive = false;
      running = false;
      cancelAnimationFrame(rafId);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      Object.keys(K).forEach(k => K[k] = false);
    }

    // ── INIT ───────────────────────────────────────────────────────────────────
    function initAll() {
      lives = 3; score = 0;
      startLevel();
    }

    function startLevel() {
      lev = buildLevel(); // ripristina blocchi ? e mattoni distrutti
      mario = {
        x: 2 * T + 6, y: 9 * T,
        vx: 0, vy: 0,
        w: 34, h: 48,
        big: false,
        onGround: false,
        dir: 1,
        animFrame: 0, animTick: 0,
        invTimer: 0,
        jumpHeld: false,
        dying: false,
      };
      enemies = ENEMY_DEFS.map(d => ({
        type: d.type,
        x: d.tx * T + 4, y: 10 * T,
        vx: -1.5, vy: 0,
        w: d.type === KOOPA ? 34 : 38,
        h: d.type === KOOPA ? 48 : 36,
        alive: true,
        shell: false, shellMoving: false,
        animTick: 0, animFrame: 0,
        active: false,
        stompTimer: 0,
      }));
      particles = []; powerups = []; floatCoins = [];
      qAnims = {};
      camX = 0; camY = 0;
      gameTimer = 400; timerTick = 0;
      flagGrabbed = false; flagY = T;
      winWalkTimer = 0;
      state = 'playing';
    }

    // ── TILE HELPERS ───────────────────────────────────────────────────────────
    function tileAt(r, c) {
      if (r < 0) return E;      // sopra il livello = vuoto, non soffitto solido
      if (r >= ROWS) return G;  // sotto il livello = solido
      if (c < 0) return G;
      if (c >= COLS) return E;
      return lev[r][c];
    }
    function solid(t) { return t === G || t === B || t === Q || t === M || t === U || t === S || t === PL || t === PR; }

    // ── MOVIMENTO CON COLLISIONE TILE ──────────────────────────────────────────
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
          if (solid(t)) {
            ent.y = (r + 1) * T; ent.vy = 0;
            if (isMario) hitBlock(r, c, t);
            break;
          }
        }
      } else if (dy > 0) {
        const r = Math.floor((ent.y + ent.h - 1) / T);
        for (let c = c1; c <= c2; c++) {
          if (solid(tileAt(r, c))) { ent.y = r * T - ent.h; ent.vy = 0; ent.onGround = true; break; }
        }
      }
    }

    function hitBlock(row, col, t) {
      if (t === Q || t === M) {
        lev[row][col] = U;
        qAnims[row + ',' + col] = { dy: 0, up: true };
        if (t === M) {
          powerups.push({ x: col * T + 4, y: (row - 1) * T, vx: 1.5, vy: 0, w: T - 8, h: T - 4, alive: true, onGround: false });
          SFX.powerup();
        } else {
          spawnFloatCoin(col * T + T / 2, row * T);
          score += 200; SFX.coin();
        }
      } else if (t === B) {
        if (mario.big) {
          lev[row][col] = E;
          addBrickParts(col * T, row * T);
          score += 50; SFX.brick();
        } else {
          qAnims[row + ',' + col] = { dy: 0, up: true };
          SFX.bump();
        }
      } else { SFX.bump(); }
    }

    function spawnFloatCoin(x, y) { floatCoins.push({ x, y, vy: -8, life: 55 }); }
    function addBrickParts(x, y) {
      for (let i = 0; i < 8; i++) {
        particles.push({ x: x + Math.random() * T, y: y + Math.random() * T, vx: (Math.random() - .5) * 9, vy: -Math.random() * 11 - 2, life: 45 + Math.random() * 20, color: i % 2 ? '#c84c0c' : '#e07050', sz: 7 + Math.random() * 5 });
      }
    }

    function overlaps(a, b) {
      const m = 4; // margine pixel per evitare falsi positivi
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

      updateMario(dt);
      updateEnemies(dt);
      updatePowerups(dt);
      updateParticles(dt);
      updateFloatCoins(dt);
      updateQAnims(dt);

      // Camera orizzontale
      const target = mario.x - W / 3;
      camX = Math.max(0, Math.min(target, COLS * T - W));
      // Camera verticale: segue Mario quando salta in alto
      const targetCamY = mario.y - H * 0.55;
      camY += (targetCamY - camY) * 0.12 * dt;
      camY = Math.min(camY, ROWS * T - H); // non scendere sotto il fondo

      // Flagpole
      const fpx = FLAGPOLE_COL * T + T / 2;
      if (!flagGrabbed && mario.x + mario.w > fpx - 4 && mario.x < fpx + 4) {
        flagGrabbed = true;
        mario.vx = 0; mario.vy = 0;
        mario.x = fpx - mario.w;
        SFX.flag();
        state = 'winWalk';
      }

      if (mario.y > H + 200) killMario();
    }

    function updateMario(dt) {
      if (mario.dying) return;

      const running = K['Shift'] || K['x'] || K['X'];
      const maxSpd = running ? RUN : WALK;
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

      // Probe: controlla se il tile 1px sotto è solido (fix per vy~0 dopo l'atterraggio)
      if (!mario.onGround) {
        const pr = Math.floor((mario.y + mario.h + 1) / T);
        const pc1 = Math.floor(mario.x / T), pc2 = Math.floor((mario.x + mario.w - 1) / T);
        for (let c = pc1; c <= pc2; c++) {
          if (solid(tileAt(pr, c))) { mario.onGround = true; break; }
        }
      }

      // Limite sinistra = bordo camera
      if (mario.x < camX) { mario.x = camX; mario.vx = 0; }

      if (mario.invTimer > 0) mario.invTimer -= dt;

      // Animazione passo
      if (mario.onGround && Math.abs(mario.vx) > 0.2) {
        mario.animTick += Math.abs(mario.vx) * dt * 0.13;
        if (mario.animTick >= 1) { mario.animTick = 0; mario.animFrame = (mario.animFrame + 1) % 3; }
      } else if (!mario.onGround) {
        mario.animFrame = 3; // salto
      } else {
        mario.animFrame = 0;
      }

      // Collisioni nemici
      if (mario.invTimer <= 0) {
        for (const e of enemies) {
          if (!e.alive || !overlaps(mario, e)) continue;
          // Stomp: Mario sta cadendo E il suo centro è sopra il centro del nemico
          if (mario.vy > 0 && mario.y + mario.h / 2 < e.y + e.h / 2) {
            stompEnemy(e);
          } else {
            if (e.shell && !e.shellMoving) {
              // calcio guscio fermo
              e.shellMoving = true;
              e.vx = mario.x < e.x ? 9 : -9;
              SFX.kick();
              mario.vy = -8;
            } else {
              takeDamage();
            }
          }
        }
      }
    }

    function stompEnemy(e) {
      mario.vy = -10;
      if (e.type === GOOMBA) {
        e.alive = false; e.stompTimer = 28;
        particles.push({ x: e.x, y: e.y + e.h / 2, vx: 0, vy: 0, life: 28, color: '#8b4513', sz: e.w, flat: true });
        score += 100; SFX.stomp();
      } else if (e.type === KOOPA) {
        if (!e.shell) {
          e.shell = true; e.vx = 0;
          score += 100; SFX.stomp();
        } else if (e.shellMoving) {
          e.vx = 0; e.shellMoving = false; SFX.kick();
        } else {
          e.shellMoving = true;
          e.vx = mario.x < e.x ? 9 : -9;
          score += 200; SFX.kick();
        }
      }
    }

    function takeDamage() {
      if (mario.invTimer > 0) return;
      if (mario.big) {
        mario.big = false; mario.h = 48; mario.y += 48;
        mario.invTimer = 120; SFX.bump();
      } else { killMario(); }
    }

    function killMario() {
      if (mario.dying) return;
      mario.dying = true; mario.vx = 0; mario.vy = -13;
      state = 'dying'; lives--; SFX.die();
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
      // Mario scivola lungo il palo
      flagY = Math.min(flagY + 5 * dt, 10 * T);
      mario.y += 5 * dt;
      if (mario.y >= 11 * T - mario.h) {
        mario.y = 11 * T - mario.h;
        mario.x += 3 * dt;
        mario.dir = 1;
        mario.animTick += 0.4 * dt;
        if (mario.animTick >= 1) { mario.animTick = 0; mario.animFrame = (mario.animFrame + 1) % 3; }
        winWalkTimer += dt;
        if (winWalkTimer > 120) {
          score += gameTimer * 50;
          state = 'win';
          SFX.clear();
        }
      }
    }

    function updateEnemies(dt) {
      for (const e of enemies) {
        if (!e.alive) continue;
        if (!e.active && Math.abs(e.x - mario.x) < W * 1.5) e.active = true;
        if (!e.active) continue;

        e.vy = Math.min(e.vy + GRAV * dt, MAX_FALL);
        e.onGround = false;
        const prevVx = e.vx;
        moveX(e, e.vx * dt);
        if (e.vx === 0 && Math.abs(prevVx) > 0) {
          e.vx = -prevVx; // rimbalza su muro
        }
        // Controllo bordo precipizio
        if (!e.shell) {
          const frontCol = Math.floor((e.x + (e.vx < 0 ? 0 : e.w)) / T);
          const belowRow = Math.floor((e.y + e.h + 1) / T);
          if (!solid(tileAt(belowRow, frontCol))) e.vx *= -1;
        }
        moveY(e, e.vy * dt, false);

        e.animTick += Math.abs(e.vx) * dt * 0.1;
        if (e.animTick >= 1) { e.animTick = 0; e.animFrame = (e.animFrame + 1) % 2; }

        if (e.y > H + 200) e.alive = false;

        // Guscio vs altri nemici
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
          if (!mario.big) { mario.big = true; mario.h = 96; mario.y -= 48; }
          score += 1000; SFX.powerup();
        }
      }
    }

    function updateParticles(dt) {
      for (const p of particles) {
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (!p.flat) p.vy += GRAV * dt;
        p.life -= dt;
      }
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
      // Cielo blu NES
      ctx.fillStyle = '#6b8cff';
      ctx.fillRect(0, 0, W, H);

      drawClouds();

      // Tutto il mondo si sposta con camY
      ctx.save();
      ctx.translate(0, -camY);

      drawHills();
      drawTiles();
      drawFlagpole();
      drawCastle();
      for (const p of powerups) if (p.alive) drawMushroom(p);
      for (const e of enemies) drawEnemy(e);
      for (const p of particles) {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - camX, p.y, p.sz, p.flat ? p.sz / 2.5 : p.sz);
      }
      for (const c of floatCoins) {
        ctx.fillStyle = YEL;
        ctx.fillRect(c.x - camX - 8, c.y, 14, 20);
        ctx.fillStyle = '#c8a000';
        ctx.fillRect(c.x - camX - 5, c.y + 3, 8, 14);
      }
      drawMario();

      ctx.restore();

      drawHUD(); // HUD fisso, non scorre

      if (state === 'over') drawOverlay('GAME OVER', 'Premi INVIO per riprovare');
      if (state === 'win') drawOverlay('LIVELLO COMPLETATO!', 'Premi INVIO per continuare');
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

    const nowQ = () => (performance.now() / 180);

    function drawTile(t, sx, sy, row, col) {
      switch (t) {
        case G: // Terreno
          ctx.fillStyle = '#c84c0c'; ctx.fillRect(sx, sy, T, T);
          ctx.fillStyle = '#e8701c'; ctx.fillRect(sx + 2, sy + 2, T - 4, T - 4);
          ctx.fillStyle = '#c84c0c';
          ctx.fillRect(sx, sy + T / 2, T, 2); ctx.fillRect(sx + T / 2, sy, 2, T);
          break;
        case B: // Mattone
          ctx.fillStyle = '#c84c0c'; ctx.fillRect(sx, sy, T, T);
          ctx.fillStyle = '#d85c1c';
          const bh = T / 3;
          for (let bi = 0; bi < 3; bi++) {
            const off = bi % 2 === 0 ? 0 : T / 3;
            ctx.fillRect(sx + off + 1, sy + bi * bh + 2, T / 2 - 3, bh - 4);
            ctx.fillRect(sx + off + T / 2 + 1, sy + bi * bh + 2, T / 2 - 3, bh - 4);
          }
          break;
        case Q: case M: { // Blocco ?
          const shine = Math.sin(nowQ()) > 0;
          ctx.fillStyle = shine ? '#f8c800' : '#d8a800'; ctx.fillRect(sx, sy, T, T);
          ctx.fillStyle = '#b86800';
          ctx.fillRect(sx + 2, sy, T - 4, 3); ctx.fillRect(sx + 2, sy + T - 3, T - 4, 3);
          ctx.fillRect(sx, sy + 2, 3, T - 4); ctx.fillRect(sx + T - 3, sy + 2, 3, T - 4);
          ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.round(T * 0.58)}px Arial`;
          ctx.textAlign = 'center'; ctx.fillText('?', sx + T / 2, sy + T * 0.72); ctx.textAlign = 'left';
          break;
        }
        case U: // Usato
          ctx.fillStyle = '#888'; ctx.fillRect(sx, sy, T, T);
          ctx.fillStyle = '#666'; ctx.fillRect(sx + 2, sy + 2, T - 4, T - 4);
          break;
        case S: // Solido
          ctx.fillStyle = '#b0b0b0'; ctx.fillRect(sx, sy, T, T);
          ctx.fillStyle = '#ccc'; ctx.fillRect(sx + 2, sy + 2, T - 4, T - 4);
          ctx.fillStyle = '#b0b0b0'; ctx.fillRect(sx, sy + T / 2, T, 2); ctx.fillRect(sx + T / 2, sy, 2, T);
          break;
        case PL: { // Pipe left
          ctx.fillStyle = DGRN; ctx.fillRect(sx, sy, T, T);
          ctx.fillStyle = GRN; ctx.fillRect(sx + 3, sy + 2, T - 6, T);
          const isTopL = row > 0 && tileAt(row - 1, col) !== PL;
          if (isTopL) {
            ctx.fillStyle = DGRN; ctx.fillRect(sx - 4, sy, T + 4, 13);
            ctx.fillStyle = GRN; ctx.fillRect(sx - 4 + 3, sy + 3, T + 4 - 6, 7);
          }
          break;
        }
        case PR: { // Pipe right
          ctx.fillStyle = DGRN; ctx.fillRect(sx, sy, T, T);
          ctx.fillStyle = GRN; ctx.fillRect(sx + 3, sy + 2, T - 6, T);
          const isTopR = row > 0 && tileAt(row - 1, col) !== PR;
          if (isTopR) {
            ctx.fillStyle = DGRN; ctx.fillRect(sx, sy, T + 4, 13);
            ctx.fillStyle = GRN; ctx.fillRect(sx + 3, sy + 3, T + 4 - 6, 7);
          }
          break;
        }
      }
    }

    function drawFlagpole() {
      const fpx = FLAGPOLE_COL * T + T / 2 - camX;
      if (fpx < -30 || fpx > W + 30) return;
      ctx.fillStyle = '#606060'; ctx.fillRect(fpx - 2, T, 4, 10 * T);
      ctx.fillStyle = YEL;
      ctx.beginPath(); ctx.arc(fpx, T, 9, 0, Math.PI * 2); ctx.fill();
      // Bandiera
      const fy = Math.min(flagY, 10 * T);
      ctx.fillStyle = '#00a800';
      ctx.beginPath(); ctx.moveTo(fpx, fy); ctx.lineTo(fpx + 44, fy + 16); ctx.lineTo(fpx, fy + 32); ctx.fill();
    }

    function drawCastle() {
      const cx = 152 * T - camX;
      if (cx > W + 100 || cx + 6 * T < 0) return;
      ctx.fillStyle = '#888';
      for (let ci = 0; ci < 6; ci++) {
        // merli
        if (ci % 2 === 0) { ctx.fillStyle = '#808080'; ctx.fillRect(cx + ci * T, 7 * T - 12, T, 12); }
      }
      ctx.fillStyle = '#808080'; ctx.fillRect(cx, 7 * T, 6 * T, 5 * T);
      // porta
      ctx.fillStyle = '#111'; ctx.fillRect(cx + 2 * T, 9 * T, 2 * T, 3 * T);
      // finestre
      ctx.fillStyle = '#111';
      ctx.fillRect(cx + T / 2, 8 * T, T / 2, T / 2);
      ctx.fillRect(cx + 4 * T, 8 * T, T / 2, T / 2);
    }

    function drawMushroom(p) {
      const sx = p.x - camX, sy = p.y;
      ctx.fillStyle = '#e00000';
      ctx.beginPath(); ctx.arc(sx + p.w / 2, sy + p.h * 0.48, p.w / 2 + 2, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillRect(sx + 2, sy + p.h * 0.46, p.w - 4, p.h * 0.54 + 2);
      [[0.22, 0.18], [0.65, 0.13], [0.43, 0.32]].forEach(([dx, dy]) => {
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sx + p.w * dx, sy + p.h * dy, 6, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#000'; ctx.fillRect(sx + 8, sy + p.h * 0.54, 5, 7); ctx.fillRect(sx + p.w - 13, sy + p.h * 0.54, 5, 7);
      ctx.fillStyle = '#fff'; ctx.fillRect(sx + 9, sy + p.h * 0.54, 2, 3); ctx.fillRect(sx + p.w - 12, sy + p.h * 0.54, 2, 3);
    }

    function drawEnemy(e) {
      const sx = e.x - camX, sy = e.y;
      if (e.type === GOOMBA) {
        // Corpo
        ctx.fillStyle = '#7b3510';
        ctx.beginPath(); ctx.ellipse(sx + e.w / 2, sy + e.h * 0.42, e.w / 2 + 2, e.h * 0.42, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#a04020'; ctx.fillRect(sx + 2, sy + e.h * 0.38, e.w - 4, e.h * 0.62);
        // Piedi
        const fa = e.animFrame ? 4 : -4;
        ctx.fillStyle = '#1a0800';
        ctx.fillRect(sx + 2, sy + e.h - 10 + fa, 13, 10);
        ctx.fillRect(sx + e.w - 15, sy + e.h - 10 - fa, 13, 10);
        // Occhi
        ctx.fillStyle = '#fff';
        ctx.fillRect(sx + 5, sy + e.h * 0.28, 11, 9); ctx.fillRect(sx + e.w - 16, sy + e.h * 0.28, 11, 9);
        ctx.fillStyle = '#000';
        ctx.fillRect(sx + 11, sy + e.h * 0.31, 5, 6); ctx.fillRect(sx + e.w - 13, sy + e.h * 0.31, 5, 6);
        // Sopracciglia arrabbiate
        ctx.fillStyle = '#000';
        ctx.save(); ctx.translate(sx + 12, sy + e.h * 0.25); ctx.rotate(-0.35); ctx.fillRect(-5, 0, 13, 3); ctx.restore();
        ctx.save(); ctx.translate(sx + e.w - 12, sy + e.h * 0.25); ctx.rotate(0.35); ctx.fillRect(-5, 0, 13, 3); ctx.restore();
      } else if (e.type === KOOPA) {
        if (e.shell) {
          ctx.fillStyle = DGRN;
          ctx.beginPath(); ctx.ellipse(sx + e.w / 2, sy + e.h * 0.6, e.w / 2, e.h * 0.38, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = YEL;
          ctx.beginPath(); ctx.ellipse(sx + e.w / 2, sy + e.h * 0.6, e.w / 2 - 7, e.h * 0.3, 0, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = DGRN; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(sx + e.w / 2, sy + e.h * 0.22); ctx.lineTo(sx + e.w / 2, sy + e.h * 0.98); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(sx + 2, sy + e.h * 0.6); ctx.lineTo(sx + e.w - 2, sy + e.h * 0.6); ctx.stroke();
        } else {
          // Guscio
          ctx.fillStyle = DGRN;
          ctx.beginPath(); ctx.ellipse(sx + e.w / 2, sy + e.h * 0.5, e.w / 2 + 2, e.h * 0.38, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = YEL;
          ctx.beginPath(); ctx.ellipse(sx + e.w / 2, sy + e.h * 0.5, e.w / 2 - 6, e.h * 0.3, 0, 0, Math.PI * 2); ctx.fill();
          // Testa
          const hdx = e.vx < 0 ? e.w * 0.22 : e.w * 0.78;
          ctx.fillStyle = YEL;
          ctx.beginPath(); ctx.arc(sx + hdx, sy + e.h * 0.2, 15, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#000';
          ctx.beginPath(); ctx.arc(sx + hdx + (e.vx < 0 ? -5 : 5), sy + e.h * 0.17, 3, 0, Math.PI * 2); ctx.fill();
          // Piedi
          const fa2 = e.animFrame ? 4 : -4;
          ctx.fillStyle = YEL;
          ctx.fillRect(sx + 3, sy + e.h - 13 + fa2, 12, 13); ctx.fillRect(sx + e.w - 15, sy + e.h - 13 - fa2, 12, 13);
        }
      }
    }

    function drawMario() {
      const sx = mario.x - camX, sy = mario.y;
      if (mario.invTimer > 0 && Math.floor(mario.invTimer / 4) % 2 === 0) return;

      ctx.save();
      if (mario.dir < 0) { ctx.translate(sx + mario.w, 0); ctx.scale(-1, 1); ctx.translate(-sx, 0); }
      if (!mario.big) drawSmallMario(sx, sy, mario.animFrame);
      else drawBigMario(sx, sy, mario.animFrame);
      ctx.restore();
    }

    function drawSmallMario(sx, sy, fr) {
      // Cappello
      ctx.fillStyle = RED; ctx.fillRect(sx + 7, sy, 22, 11); ctx.fillRect(sx + 4, sy + 8, 28, 9);
      // Capelli/barba
      ctx.fillStyle = BROWN; ctx.fillRect(sx + 4, sy + 12, 8, 7); ctx.fillRect(sx + 9, sy + 16, 8, 5);
      // Faccia
      ctx.fillStyle = SKIN; ctx.fillRect(sx + 7, sy + 11, 22, 13);
      // Occhio
      ctx.fillStyle = '#000'; ctx.fillRect(sx + 21, sy + 14, 5, 6);
      // Baffi
      ctx.fillStyle = BROWN; ctx.fillRect(sx + 9, sy + 20, 7, 3); ctx.fillRect(sx + 20, sy + 20, 8, 3);
      // Camicia
      ctx.fillStyle = RED; ctx.fillRect(sx + 7, sy + 24, 22, 8);
      // Bretelle
      ctx.fillStyle = BLUE; ctx.fillRect(sx + 4, sy + 32, 28, 8);
      ctx.fillStyle = YEL; ctx.fillRect(sx + 10, sy + 29, 3, 3); ctx.fillRect(sx + 23, sy + 29, 3, 3);
      // Gambe
      const leg = fr === 3 ? 0 : (fr === 1 ? -4 : (fr === 2 ? 4 : 0));
      ctx.fillStyle = BLUE;
      ctx.fillRect(sx + 4, sy + 40, 11, 8 + Math.max(0, leg));
      ctx.fillRect(sx + 21, sy + 40, 11, 8 + Math.max(0, -leg));
      ctx.fillStyle = SHOE;
      ctx.fillRect(sx + 1, sy + 40 + 8 + Math.max(0, leg), 16, 8);
      ctx.fillRect(sx + 19, sy + 40 + 8 + Math.max(0, -leg), 16, 8);
      if (fr === 3) { // salto: gambe piegate
        ctx.fillStyle = BLUE; ctx.fillRect(sx + 4, sy + 36, 11, 6); ctx.fillRect(sx + 21, sy + 36, 11, 6);
        ctx.fillStyle = SHOE; ctx.fillRect(sx + 0, sy + 42, 14, 6); ctx.fillRect(sx + 22, sy + 42, 14, 6);
      }
    }

    function drawBigMario(sx, sy, fr) {
      // Cappello
      ctx.fillStyle = RED; ctx.fillRect(sx + 7, sy, 22, 12); ctx.fillRect(sx + 3, sy + 9, 30, 10);
      // Capelli
      ctx.fillStyle = BROWN; ctx.fillRect(sx + 3, sy + 13, 10, 9); ctx.fillRect(sx + 9, sy + 18, 9, 6);
      // Faccia
      ctx.fillStyle = SKIN; ctx.fillRect(sx + 5, sy + 12, 26, 18);
      // Occhio
      ctx.fillStyle = '#000'; ctx.fillRect(sx + 22, sy + 15, 6, 9);
      // Baffi
      ctx.fillStyle = BROWN; ctx.fillRect(sx + 9, sy + 25, 7, 4); ctx.fillRect(sx + 21, sy + 25, 10, 4);
      // Naso
      ctx.fillStyle = SKIN; ctx.fillRect(sx + 16, sy + 21, 9, 7);
      // Corpo
      ctx.fillStyle = RED; ctx.fillRect(sx + 3, sy + 30, 30, 18);
      ctx.fillStyle = BLUE; ctx.fillRect(sx + 10, sy + 30, 16, 12);
      // Braccia
      ctx.fillStyle = RED; ctx.fillRect(sx - 3, sy + 33, 9, 13); ctx.fillRect(sx + 30, sy + 33, 9, 13);
      ctx.fillStyle = SKIN; ctx.fillRect(sx - 3, sy + 46, 9, 6); ctx.fillRect(sx + 30, sy + 46, 9, 6);
      // Pantaloni
      ctx.fillStyle = BLUE; ctx.fillRect(sx + 3, sy + 48, 30, 22);
      ctx.fillStyle = YEL; ctx.fillRect(sx + 10, sy + 44, 3, 4); ctx.fillRect(sx + 23, sy + 44, 3, 4);
      // Gambe
      const leg = fr === 3 ? 0 : (fr === 1 ? -5 : (fr === 2 ? 5 : 0));
      ctx.fillStyle = BLUE;
      ctx.fillRect(sx + 4, sy + 70, 12, 10 + Math.max(0, leg));
      ctx.fillRect(sx + 20, sy + 70, 12, 10 + Math.max(0, -leg));
      ctx.fillStyle = SHOE;
      ctx.fillRect(sx + 0, sy + 80 + Math.max(0, leg), 18, 11);
      ctx.fillRect(sx + 18, sy + 80 + Math.max(0, -leg), 18, 11);
      if (fr === 3) {
        ctx.fillStyle = BLUE; ctx.fillRect(sx + 4, sy + 66, 12, 8); ctx.fillRect(sx + 20, sy + 66, 12, 8);
        ctx.fillStyle = SHOE; ctx.fillRect(sx - 2, sy + 74, 20, 10); ctx.fillRect(sx + 18, sy + 74, 20, 10);
      }
    }

    function drawHUD() {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(0, 0, W, 64);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px "Courier New",monospace';
      ctx.textAlign = 'left'; ctx.fillText('GAUDIOSO', 18, 22);
      ctx.font = 'bold 22px "Courier New",monospace';
      ctx.fillText(String(score).padStart(6, '0'), 18, 48);
      ctx.textAlign = 'center';
      ctx.font = 'bold 16px "Courier New",monospace'; ctx.fillText('ZONA', W / 2, 22);
      ctx.font = 'bold 22px "Courier New",monospace'; ctx.fillText('1-1', W / 2, 48);
      ctx.textAlign = 'right';
      ctx.font = 'bold 16px "Courier New",monospace'; ctx.fillText('CLOCK', W - 18, 22);
      ctx.font = 'bold 22px "Courier New",monospace'; ctx.fillText(String(Math.max(0, gameTimer)), W - 18, 48);
      // Vite
      ctx.fillStyle = RED; ctx.fillRect(18, 52, 14, 8); ctx.fillStyle = SKIN; ctx.fillRect(18, 58, 14, 6);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 16px "Courier New"'; ctx.textAlign = 'left'; ctx.fillText('×' + lives, 38, 70);
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '13px Arial'; ctx.textAlign = 'right';
      ctx.fillText('ESC=Menu', W - 10, 70);
      ctx.textAlign = 'left';
    }

    function drawOverlay(msg1, msg2) {
      ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 52px "Courier New"'; ctx.textAlign = 'center'; ctx.fillText(msg1, W / 2, H / 2 - 28);
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

    // ── START ─────────────────────────────────────────────────────────────────
    running = true;
    marioActive = true;
    initAll();
    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);

    return stopGame;
  };
})();
