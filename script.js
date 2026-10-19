/* ── Interactive Background Animations (Particles, Glow Spotlight, & Scroll Parallax) ── */

// 1. Fluid Mouse Spotlight with Spring/Lerp Physics
const mouseSpotlight = document.getElementById('mouse-spotlight');
let targetMouseX = window.innerWidth / 2;
let targetMouseY = window.innerHeight / 2;
let currentSpotX = targetMouseX;
let currentSpotY = targetMouseY;

window.addEventListener('mousemove', (e) => {
  targetMouseX = e.clientX;
  targetMouseY = e.clientY;
}, { passive: true });

function animateSpotlight() {
  if (mouseSpotlight) {
    // Smooth lerp follow for fluid ambient light
    currentSpotX += (targetMouseX - currentSpotX) * 0.075;
    currentSpotY += (targetMouseY - currentSpotY) * 0.075;
    mouseSpotlight.style.transform = `translate(${currentSpotX - 325}px, ${currentSpotY - 325}px)`;
  }
  requestAnimationFrame(animateSpotlight);
}
animateSpotlight();

// 2. Interactive Constellation Canvas Particle System
const canvas = document.getElementById('bg-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let dpr = 1;

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.size = Math.random() * 2 + 0.8;
      // Gentle floating upwards and wandering horizontally
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = -(Math.random() * 0.35 + 0.15);
      this.alpha = Math.random() * 0.45 + 0.15;
      this.alphaVel = (Math.random() - 0.5) * 0.006;
      this.angle = Math.random() * Math.PI * 2;
      // 55% Neon Pink, 45% Sky Aqua
      this.isPink = Math.random() > 0.45;
    }

    update() {
      this.angle += this.pulseSpeed;
      this.x += this.vx + Math.sin(this.angle) * 0.2;
      this.y += this.vy;

      // Mouse interactive fluid repulsion
      const dx = targetMouseX - this.x;
      const dy = targetMouseY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150 && dist > 0) {
        const force = (1 - dist / 150) * 1.2;
        this.x -= (dx / dist) * force;
        this.y -= (dy / dist) * force;
      }

      // Loop around screen boundaries
      if (this.x < -20) this.x = width + 20;
      if (this.x > width + 20) this.x = -20;
      if (this.y < -20) this.reset();

      this.alpha += this.alphaVel;
      if (this.alpha <= 0.1 || this.alpha >= 0.65) {
        this.alphaVel = -this.alphaVel;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      if (this.isPink) {
        ctx.fillStyle = `rgba(247, 37, 133, ${this.alpha})`;
        ctx.shadowColor = 'rgba(247, 37, 133, 0.55)';
        ctx.shadowBlur = 5;
      } else {
        ctx.fillStyle = `rgba(76, 201, 240, ${this.alpha * 0.9})`;
        ctx.shadowColor = 'rgba(76, 201, 240, 0.45)';
        ctx.shadowBlur = 4;
      }
      ctx.fill();
      ctx.shadowBlur = 0; // Reset shadow for performance
    }
  }

  // Optimize particle count for screen size and 60fps smoothness
  const particleCount = Math.min(65, Math.max(30, Math.floor((window.innerWidth * window.innerHeight) / 25000)));
  const particles = Array.from({ length: particleCount }, () => new Particle());

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);

    // Draw connecting constellation lines
    const maxDist = 125;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const lineAlpha = (1 - dist / maxDist) * 0.16;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(76, 201, 240, ${lineAlpha * 1.5})`;
          ctx.lineWidth = 0.65;
          ctx.stroke();
        }
      }
    }

    // Update and draw each particle
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animateParticles);
  }

  animateParticles();
}

// 3. Parallax Background Shift on Scroll
const bgLightContainer = document.getElementById('bg-light-container');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  if (bgLightContainer) {
    bgLightContainer.style.transform = `translateY(${scrolled * 0.12}px)`;
  }
}, { passive: true });

// 3. Sticky header backdrop dynamic update
const appHeader = document.querySelector('.app-header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 30) {
    appHeader.style.borderColor = 'rgba(247, 37, 133, 0.4)';
    appHeader.style.boxShadow = '0 4px 20px rgba(247, 37, 133, 0.2), 0 4px 20px rgba(0,0,0,0.6)';
  } else {
    appHeader.style.borderColor = 'var(--theme-base-300)';
    appHeader.style.boxShadow = 'none';
  }
});

// 4. Smooth reveal observer for cards & project items
const revealElements = document.querySelectorAll(
  '.project-item-sb, .card-sb, .info-panel-lines, .hero-title-huge'
);

// Ensure all portfolio content is visible by default so nothing is ever hidden
revealElements.forEach(el => {
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';
  el.style.transition = 'all 0.6s cubic-bezier(.615, .19, .305, .91)';
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, 40 * i);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.05 }
);

revealElements.forEach(el => revealObserver.observe(el));

// 5. Active Nav Link Observer
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let currentSection = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      currentSection = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + currentSection) {
      link.classList.add('active');
    }
  });
});

/* ══════════════════════════════════════════════════════════════════
   LANDING INTRO CONTROLLER ("HELLO" -> "PORTFOLIO" -> OPEN PORTFOLIO)
   ══════════════════════════════════════════════════════════════════ */
(function initLandingIntro() {
  const landingScreen = document.getElementById('landing-intro');
  const animatedText = document.getElementById('landing-animated-text');
  const subtext = document.getElementById('landing-subtext');
  const progressBar = document.getElementById('landing-progress-bar');
  const percentVal = document.getElementById('landing-percent');
  const statusCode = document.getElementById('landing-status-code');
  const skipBtn = document.getElementById('landing-skip-btn');

  if (!landingScreen || !animatedText) return;

  // Lock scrolling while intro is running
  document.body.classList.add('landing-active');

  let isFinished = false;

  function updateProgress(percent) {
    const clamped = Math.min(100, Math.max(0, percent));
    if (progressBar) progressBar.style.width = `${clamped}%`;
    if (percentVal) percentVal.textContent = `${Math.round(clamped)}%`;
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function typeWord(word, startProg, endProg, baseSpeed = 100) {
    for (let i = 1; i <= word.length; i++) {
      if (isFinished) return;
      animatedText.textContent = word.slice(0, i);
      const prog = startProg + (i / word.length) * (endProg - startProg);
      updateProgress(prog);
      const jitter = Math.floor(Math.random() * 20) - 10;
      await wait(Math.max(35, baseSpeed + jitter));
    }
  }

  async function deleteWord(speed = 45) {
    const current = animatedText.textContent;
    for (let i = current.length - 1; i >= 0; i--) {
      if (isFinished) return;
      animatedText.textContent = current.slice(0, i);
      await wait(speed);
    }
  }

  function finishAndReveal() {
    if (isFinished) return;
    isFinished = true;

    // Finalize intro UI
    animatedText.textContent = 'portfolio';
    animatedText.classList.add('is-portfolio');
    updateProgress(100);
    if (subtext) subtext.textContent = 'READY // MOUNTING PORTFOLIO';
    if (statusCode) statusCode.textContent = 'STAGE: 04 // MOUNTED';

    setTimeout(() => {
      // Slide up curtain
      landingScreen.classList.add('landing-exit');
      document.body.classList.remove('landing-active');

      // Ensure every single section and card is 100% visible
      const allContent = document.querySelectorAll(
        '.hero-tagline, .hero-title-huge, .hero-bio-lead, .hero-actions-row, .code-window, .project-item-sb, .card-sb, .info-panel-lines'
      );
      allContent.forEach((el, index) => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });

      // Cleanup overlay from accessibility tree after slide completes
      setTimeout(() => {
        landingScreen.style.display = 'none';
      }, 950);
    }, 450);
  }

  // Skip handlers (Only Esc key or click on Skip button)
  if (skipBtn) {
    skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      finishAndReveal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      finishAndReveal();
    }
  });

  // Main animation flow
  async function runSequence() {
    updateProgress(10);
    await wait(180);
    if (isFinished) return;

    // 1. Type "hello"
    if (subtext) subtext.textContent = 'GREETING USER...';
    if (statusCode) statusCode.textContent = 'STAGE: 01 // HELLO';
    await typeWord('hello', 10, 42, 105);
    if (isFinished) return;

    // 2. Pause on "hello"
    await wait(650);
    if (isFinished) return;

    // 3. Backspace "hello"
    if (subtext) subtext.textContent = 'TRANSITIONING CONTEXT...';
    if (statusCode) statusCode.textContent = 'STAGE: 02 // SWITCH';
    await deleteWord(50);
    if (isFinished) return;

    await wait(200);
    if (isFinished) return;

    // 4. Highlight & Type "portfolio"
    animatedText.classList.add('is-portfolio');
    if (subtext) subtext.textContent = 'INITIALIZING PORTFOLIO...';
    if (statusCode) statusCode.textContent = 'STAGE: 03 // PORTFOLIO';
    await typeWord('portfolio', 42, 95, 90);
    if (isFinished) return;

    // 5. Pause to appreciate "portfolio"
    await wait(550);
    if (isFinished) return;

    // 6. Open the portfolio page
    finishAndReveal();
  }

  // Kickoff on load
  runSequence();
})();

