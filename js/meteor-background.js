/* ================================================
   METEOR SHOWER BACKGROUND — HOMEPAGE CANVAS EFFECT
   Renders 5–10 glowing meteorites falling diagonally
   (top-right → bottom-left) behind all page content.
   ================================================ */

(function () {
  'use strict';

  /* ── Bail out if user prefers reduced motion ─── */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('meteorCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  /* ── Config ────────────────────────────────────── */
  const COUNT_MIN = 5;
  const COUNT_MAX = 10;
  const ANGLE_MIN = 215;          // degrees — top-right → bottom-left
  const ANGLE_MAX = 235;
  const SPEED_MIN = 1.8;
  const SPEED_MAX = 4.5;
  const TAIL_MIN  = 80;
  const TAIL_MAX  = 180;
  const HEAD_MIN  = 1.8;
  const HEAD_MAX  = 3.5;
  const OPACITY_MIN = 0.25;
  const OPACITY_MAX = 0.6;
  const DELAY_MAX = 3000;         // ms — stagger spawn
  const GLOW_MIN  = 4;
  const GLOW_MAX  = 10;

  /* ── Helpers ───────────────────────────────────── */
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
  function degToRad(d) { return (d * Math.PI) / 180; }

  /* ── Canvas sizing ─────────────────────────────── */
  let W, H;
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);   // scale for crisp rendering
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── Meteorite factory ─────────────────────────── */
  function createMeteor(delayed) {
    const angle = degToRad(rand(ANGLE_MIN, ANGLE_MAX));
    const speed = rand(SPEED_MIN, SPEED_MAX);
    const tail  = rand(TAIL_MIN, TAIL_MAX);
    const head  = rand(HEAD_MIN, HEAD_MAX);
    const opacity = rand(OPACITY_MIN, OPACITY_MAX);
    const glow  = rand(GLOW_MIN, GLOW_MAX);

    // Spawn along top edge or right edge (top-right quadrant)
    let x, y;
    if (Math.random() < 0.6) {
      // Spawn above viewport along top
      x = rand(W * 0.2, W * 1.15);
      y = rand(-tail * 2, -20);
    } else {
      // Spawn off right edge
      x = rand(W, W + tail * 1.5);
      y = rand(-tail, H * 0.4);
    }

    return {
      x, y, angle, speed, tail, head, opacity, glow,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      active: !delayed,
      delay: delayed ? rand(0, DELAY_MAX) : 0,
      born: performance.now()
    };
  }

  /* ── Spawn initial pool ────────────────────────── */
  const count = randInt(COUNT_MIN, COUNT_MAX);
  const meteors = [];
  for (let i = 0; i < count; i++) {
    meteors.push(createMeteor(true));     // all start with random delay
  }

  /* ── Draw one meteorite ────────────────────────── */
  function drawMeteor(m) {
    // Tail end point (backwards along angle)
    const tx = m.x - Math.cos(m.angle) * m.tail;
    const ty = m.y - Math.sin(m.angle) * m.tail;

    ctx.save();
    ctx.globalAlpha = m.opacity;

    /* — Fiery tail gradient — */
    const grad = ctx.createLinearGradient(m.x, m.y, tx, ty);
    grad.addColorStop(0,    'rgba(255, 180, 50, 0.95)');   // bright orange at head
    grad.addColorStop(0.15, 'rgba(255, 120, 20, 0.6)');
    grad.addColorStop(0.45, 'rgba(200, 60, 10, 0.25)');
    grad.addColorStop(1,    'rgba(120, 30, 5, 0)');        // fade to transparent

    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(tx, ty);
    ctx.lineWidth = m.head * 1.6;
    ctx.strokeStyle = grad;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Thinner bright core line
    const coreGrad = ctx.createLinearGradient(m.x, m.y, tx, ty);
    coreGrad.addColorStop(0,   'rgba(255, 240, 180, 0.9)');
    coreGrad.addColorStop(0.2, 'rgba(255, 200, 80, 0.4)');
    coreGrad.addColorStop(0.5, 'rgba(255, 140, 40, 0)');

    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(tx, ty);
    ctx.lineWidth = m.head * 0.7;
    ctx.strokeStyle = coreGrad;
    ctx.stroke();

    /* — Glowing rock head — */
    ctx.shadowColor = 'rgba(255, 140, 30, 0.9)';
    ctx.shadowBlur = m.glow;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.head, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 200, 80, 0.95)';
    ctx.fill();

    // Extra inner white-hot core
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.head * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 220, 0.85)';
    ctx.fill();

    ctx.restore();
  }

  /* ── Animation loop ────────────────────────────── */
  function frame(now) {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < meteors.length; i++) {
      const m = meteors[i];

      // Handle spawn delay
      if (!m.active) {
        if (now - m.born >= m.delay) {
          m.active = true;
        } else {
          continue;
        }
      }

      // Move
      m.x += m.vx;
      m.y += m.vy;

      // Draw
      drawMeteor(m);

      // Off-screen? → reset
      if (m.x < -m.tail * 2 || m.y > H + m.tail * 2) {
        meteors[i] = createMeteor(false);
        meteors[i].delay = rand(200, 2500);   // small re-entry pause
        meteors[i].active = false;
        meteors[i].born = now;
      }
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
