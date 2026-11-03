/**
 * MAYSA — A DIGITAL LOVE ARCHIVE
 * High-performance, lightweight particle systems for the romantic experience:
 * - Canvas 1: Subtle classified archive particles (Screen 1 & 2)
 * - Canvas 2: Falling romantic hearts (Screen 5 & 6)
 * - Canvas 3: Twinkling starry cosmos with stardust trails (Screen 7)
 */

class RomanticHeartEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.hearts = [];
    this.isRunning = false;
    this.animationFrameId = null;
    this.maxHearts = window.innerWidth < 768 ? 24 : 45;
    this.colors = [
      'rgba(232, 166, 185, 0.75)', // Rosa suave
      'rgba(245, 236, 236, 0.85)', // Branco quente
      'rgba(168, 50, 74, 0.65)',   // Vermelho queimado
      'rgba(232, 166, 185, 0.45)', // Rosa translúcido
      'rgba(214, 117, 139, 0.60)'  // Vinho rosado
    ];

    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);
    
    window.addEventListener('resize', this.resize, { passive: true });
    this.resize();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.maxHearts = window.innerWidth < 768 ? 22 : 42;
  }

  createHeart() {
    const size = 6 + Math.random() * 16;
    return {
      x: Math.random() * this.width,
      y: -20 - Math.random() * 80,
      size: size,
      speedY: 0.6 + Math.random() * 1.4,
      speedX: (Math.random() - 0.5) * 0.8,
      oscillationSpeed: 0.015 + Math.random() * 0.025,
      oscillationDistance: 15 + Math.random() * 25,
      oscillationAngle: Math.random() * Math.PI * 2,
      rotation: (Math.random() - 0.5) * 0.4,
      rotationSpeed: (Math.random() - 0.5) * 0.01,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      opacity: 0.25 + Math.random() * 0.65,
      glow: Math.random() > 0.6
    };
  }

  init() {
    this.hearts = [];
    for (let i = 0; i < this.maxHearts; i++) {
      const h = this.createHeart();
      h.y = Math.random() * this.height; // Distribute vertically initially
      this.hearts.push(h);
    }
  }

  drawHeartShape(ctx, x, y, size, rotation, color, opacity, glow) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();

    const scale = size / 20;
    ctx.moveTo(0, 0);
    // Draw heart path
    ctx.bezierCurveTo(-10 * scale, -12 * scale, -20 * scale, 5 * scale, 0, 18 * scale);
    ctx.bezierCurveTo(20 * scale, 5 * scale, 10 * scale, -12 * scale, 0, 0);

    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;

    if (glow) {
      ctx.shadowColor = 'rgba(232, 166, 185, 0.6)';
      ctx.shadowBlur = 8;
    }

    ctx.fill();
    ctx.restore();
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    if (this.hearts.length === 0) this.init();
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  loop() {
    if (!this.isRunning) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.hearts.length; i++) {
      const h = this.hearts[i];
      h.oscillationAngle += h.oscillationSpeed;
      h.x += Math.sin(h.oscillationAngle) * 0.5 + h.speedX;
      h.y += h.speedY;
      h.rotation += h.rotationSpeed;

      // Draw heart
      this.drawHeartShape(
        this.ctx,
        h.x,
        h.y,
        h.size,
        h.rotation,
        h.color,
        h.opacity,
        h.glow
      );

      // Reset when falling off-screen
      if (h.y > this.height + 30 || h.x < -40 || h.x > this.width + 40) {
        this.hearts[i] = this.createHeart();
      }
    }

    this.animationFrameId = requestAnimationFrame(this.loop);
  }
}

class CosmosStarEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stars = [];
    this.floatingHearts = [];
    this.trails = [];
    this.isRunning = false;
    this.animationFrameId = null;

    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);

    window.addEventListener('resize', this.resize, { passive: true });
    window.addEventListener('mousemove', this.handlePointerMove, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.handlePointerMove(e.touches[0]);
      }
    }, { passive: true });

    this.resize();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.init();
  }

  init() {
    const starCount = window.innerWidth < 768 ? 90 : 180;
    this.stars = [];
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: 0.5 + Math.random() * 1.8,
        baseAlpha: 0.2 + Math.random() * 0.7,
        alpha: 0.2 + Math.random() * 0.7,
        twinkleSpeed: 0.01 + Math.random() * 0.03,
        twinklePhase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.3 ? '#F5ECEC' : (Math.random() > 0.5 ? '#E8A6B5' : '#FFD2DC')
      });
    }

    // A few gentle floating hearts among the stars
    const heartCount = window.innerWidth < 768 ? 8 : 16;
    this.floatingHearts = [];
    for (let i = 0; i < heartCount; i++) {
      this.floatingHearts.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: 5 + Math.random() * 10,
        speedY: -0.2 - Math.random() * 0.4,
        speedX: (Math.random() - 0.5) * 0.3,
        angle: Math.random() * Math.PI * 2,
        alpha: 0.2 + Math.random() * 0.5
      });
    }
  }

  handlePointerMove(e) {
    if (!this.isRunning) return;
    if (this.trails.length > 30) this.trails.shift();
    this.trails.push({
      x: e.clientX,
      y: e.clientY,
      radius: 1.5 + Math.random() * 2,
      alpha: 0.8,
      decay: 0.02 + Math.random() * 0.02,
      color: Math.random() > 0.4 ? '#E8A6B5' : '#F5ECEC'
    });
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    if (this.stars.length === 0) this.init();
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  loop() {
    if (!this.isRunning) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Deep cosmic subtle gradient backdrop
    const grad = this.ctx.createRadialGradient(
      this.width * 0.5, this.height * 0.6, 10,
      this.width * 0.5, this.height * 0.6, this.width * 0.9
    );
    grad.addColorStop(0, 'rgba(72, 24, 39, 0.25)'); // Dark wine center glow
    grad.addColorStop(0.6, 'rgba(20, 10, 15, 0.15)');
    grad.addColorStop(1, 'rgba(8, 8, 8, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw twinkling stars
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      s.twinklePhase += s.twinkleSpeed;
      const alpha = s.baseAlpha + Math.sin(s.twinklePhase) * 0.3;

      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = s.color;
      this.ctx.globalAlpha = Math.max(0.1, Math.min(1, alpha));
      this.ctx.shadowColor = s.color;
      this.ctx.shadowBlur = s.radius > 1.2 ? 6 : 0;
      this.ctx.fill();
    }

    // Draw floating ethereal hearts in space
    for (let i = 0; i < this.floatingHearts.length; i++) {
      const h = this.floatingHearts[i];
      h.y += h.speedY;
      h.x += Math.sin(h.angle) * 0.3;
      h.angle += 0.02;

      if (h.y < -20) {
        h.y = this.height + 20;
        h.x = Math.random() * this.width;
      }

      this.drawTinyHeart(this.ctx, h.x, h.y, h.size, h.alpha);
    }

    // Draw pointer trails (stardust)
    for (let i = this.trails.length - 1; i >= 0; i--) {
      const t = this.trails[i];
      t.alpha -= t.decay;
      if (t.alpha <= 0) {
        this.trails.splice(i, 1);
        continue;
      }
      this.ctx.beginPath();
      this.ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = t.color;
      this.ctx.globalAlpha = t.alpha;
      this.ctx.shadowColor = '#E8A6B5';
      this.ctx.shadowBlur = 4;
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1;
    this.ctx.shadowBlur = 0;

    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  drawTinyHeart(ctx, x, y, size, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    const s = size / 20;
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-10 * s, -12 * s, -20 * s, 5 * s, 0, 18 * s);
    ctx.bezierCurveTo(20 * s, 5 * s, 10 * s, -12 * s, 0, 0);
    ctx.fillStyle = '#E8A6B5';
    ctx.globalAlpha = alpha;
    ctx.shadowColor = 'rgba(232, 166, 185, 0.5)';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.restore();
  }
}

window.RomanticHeartEngine = RomanticHeartEngine;
window.CosmosStarEngine = CosmosStarEngine;
