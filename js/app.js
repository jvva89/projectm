/**
 * MAYSA — A DIGITAL LOVE ARCHIVE
 * Main Application Orchestrator
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Engines
  const heartCanvas = document.getElementById('heartCanvas');
  const cosmosCanvas = document.getElementById('cosmosCanvas');

  const heartEngine = new RomanticHeartEngine(heartCanvas);
  const cosmosEngine = new CosmosStarEngine(cosmosCanvas);
  const audioEngine = new RomanticAudioEngine();

  // State
  let currentScreen = 1;
  let currentLightboxIndex = 0;
  let activeFilter = 'all';

  // DOM Elements
  const screens = {
    1: document.getElementById('screen-1'),
    2: document.getElementById('screen-2'),
    3: document.getElementById('screen-3'),
    4: document.getElementById('screen-4'),
    5: document.getElementById('screen-5'),
    6: document.getElementById('screen-6'),
    7: document.getElementById('screen-7')
  };

  const navDots = document.querySelectorAll('.nav-dot');
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const galleryGrid = document.getElementById('galleryGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // Lightbox Elements
  const lightbox = document.getElementById('lightboxModal');
  const lightboxMedia = document.getElementById('lightboxMedia');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  // Audio Toggle Button Listener
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      audioEngine.toggle();
    });
  }

  // Switch Screen Function
  function goToScreen(screenNumber, immediate = false) {
    if (screenNumber === currentScreen && !immediate) return;

    const prevScreen = screens[currentScreen];
    const nextScreen = screens[screenNumber];

    if (!nextScreen) return;

    // Handle canvas particle engines based on screen
    if (screenNumber === 5 || screenNumber === 6) {
      heartEngine.start();
      cosmosEngine.stop();
    } else if (screenNumber === 7) {
      heartEngine.stop();
      cosmosEngine.start();
    } else {
      heartEngine.stop();
      cosmosEngine.stop();
    }

    const activateNext = () => {
      Object.values(screens).forEach(s => {
        if (s) {
          s.classList.remove('active');
          s.classList.remove('fade-out');
        }
      });

      nextScreen.classList.add('active');
      currentScreen = screenNumber;
      updateNav();
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Screen-specific triggers
      if (screenNumber === 2) {
        startTerminalSequence();
      } else if (screenNumber === 4) {
        startAnomalySequence();
      } else if (screenNumber === 6) {
        initLetterScrollObserver();
      }
    };

    if (immediate) {
      activateNext();
    } else {
      // Fade out current screen smoothly
      if (prevScreen) {
        prevScreen.classList.remove('active');
        prevScreen.classList.add('fade-out');
      }

      setTimeout(() => {
        activateNext();
      }, 300);
    }
  }

  // Update navigation dots indicator
  function updateNav() {
    navDots.forEach(dot => {
      const step = parseInt(dot.getAttribute('data-step'), 10);
      if (step === currentScreen) {
        dot.classList.add('active');
        dot.setAttribute('aria-current', 'step');
      } else {
        dot.classList.remove('active');
        dot.removeAttribute('aria-current');
      }
      // Allow jumping to visited or earlier screens
      if (step <= currentScreen) {
        dot.removeAttribute('disabled');
        dot.style.opacity = '1';
        dot.style.pointerEvents = 'auto';
      }
    });
  }

  // Nav dots click handler
  navDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const targetStep = parseInt(dot.getAttribute('data-step'), 10);
      goToScreen(targetStep);
    });
  });

  // SCREEN 1 -> SCREEN 2 (Access Archive)
  const accessBtn = document.getElementById('accessArchiveBtn');
  if (accessBtn) {
    accessBtn.addEventListener('click', () => {
      // Start ambient audio on first interaction
      audioEngine.start();
      goToScreen(2);
    });
  }

  // SCREEN 2: Terminal Sequence
  function startTerminalSequence() {
    const terminalLines = [
      { text: 'Initializing personal archive kernel...', delay: 200 },
      { text: 'Scanning encrypted memory partitions [14 records found]...', delay: 750 },
      { text: 'Bypassing biometric authorization layer...', delay: 1350 },
      { text: 'Subject identification confirmed: MAYSA RIBEIRO DA SILVA.', delay: 1950 }
    ];

    const terminalOutput = document.getElementById('terminalOutput');
    const progressBar = document.getElementById('terminalProgressBar');
    const dossierCard = document.getElementById('dossierCard');
    const continueBtn = document.getElementById('continueToGalleryBtn');

    if (!terminalOutput) return;

    terminalOutput.innerHTML = '';
    dossierCard.classList.remove('revealed');
    continueBtn.classList.remove('revealed');
    progressBar.style.width = '0%';

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress = Math.min(currentProgress + 3, 98);
      progressBar.style.width = currentProgress + '%';
    }, 40);

    terminalLines.forEach((item, index) => {
      setTimeout(() => {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = `<span class="prompt">></span> <span class="typing-text">${item.text}</span>`;
        terminalOutput.appendChild(line);

        if (index === terminalLines.length - 1) {
          clearInterval(progressInterval);
          progressBar.style.width = '100%';

          setTimeout(() => {
            dossierCard.classList.add('revealed');
            continueBtn.classList.add('revealed');
          }, 400);
        }
      }, item.delay);
    });
  }

  // SCREEN 2 -> SCREEN 3 (Continue)
  const continueToGalleryBtn = document.getElementById('continueToGalleryBtn');
  if (continueToGalleryBtn) {
    continueToGalleryBtn.addEventListener('click', () => {
      goToScreen(3);
    });
  }

  // SCREEN 3: Render Gallery
  function renderGallery(filter = 'all') {
    if (!galleryGrid || !window.MEDIA_ARCHIVE) return;
    galleryGrid.innerHTML = '';

    const filtered = window.MEDIA_ARCHIVE.filter(item => {
      if (filter === 'all') return true;
      if (filter === 'retratos') return item.category === 'retratos';
      if (filter === 'momentos') return item.category === 'momentos';
      if (filter === 'videos') return item.type === 'video';
      return true;
    });

    filtered.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = `gallery-card card-${item.orientation} ${item.type === 'video' ? 'card-video' : ''}`;
      card.setAttribute('data-id', item.id);
      card.setAttribute('data-index', window.MEDIA_ARCHIVE.findIndex(m => m.id === item.id));

      if (item.type === 'image') {
        card.innerHTML = `
          <div class="card-media-wrapper">
            <img src="${item.src}" alt="${item.title}" loading="lazy" class="gallery-img">
            <div class="card-overlay">
              <span class="card-tag">${item.code}</span>
              <div class="card-info">
                <h4 class="card-title">${item.title}</h4>
                <p class="card-caption">${item.caption}</p>
              </div>
            </div>
          </div>
        `;
      } else {
        card.innerHTML = `
          <div class="card-media-wrapper video-wrapper">
            <video src="${item.src}" muted playsinline loop preload="metadata" class="gallery-video"></video>
            <div class="video-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>VÍDEO VIVO</span>
            </div>
            <div class="card-overlay">
              <span class="card-tag">${item.code}</span>
              <div class="card-info">
                <h4 class="card-title">${item.title}</h4>
                <p class="card-caption">${item.caption}</p>
              </div>
            </div>
          </div>
        `;

        // Play video preview on hover / mobile tap
        const videoEl = card.querySelector('video');
        card.addEventListener('mouseenter', () => {
          videoEl.play().catch(() => {});
        });
        card.addEventListener('mouseleave', () => {
          videoEl.pause();
        });
      }

      card.addEventListener('click', () => {
        const originalIndex = window.MEDIA_ARCHIVE.findIndex(m => m.id === item.id);
        openLightbox(originalIndex);
      });

      galleryGrid.appendChild(card);
    });
  }

  // Filter Buttons Handler
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter');
      renderGallery(activeFilter);
    });
  });

  // SCREEN 3 Lightbox
  function openLightbox(index) {
    if (!window.MEDIA_ARCHIVE || !window.MEDIA_ARCHIVE[index]) return;
    currentLightboxIndex = index;
    const item = window.MEDIA_ARCHIVE[index];

    lightboxMedia.innerHTML = '';

    if (item.type === 'image') {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.title;
      img.className = 'lightbox-img';
      lightboxMedia.appendChild(img);
    } else {
      const video = document.createElement('video');
      video.src = item.src;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.className = 'lightbox-video';
      lightboxMedia.appendChild(video);
    }

    lightboxTitle.textContent = item.title;
    lightboxCaption.textContent = item.caption;
    lightboxCounter.textContent = `${index + 1} / ${window.MEDIA_ARCHIVE.length}`;

    lightbox.classList.add('active');
    document.body.classList.add('modal-open');
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.classList.remove('modal-open');
    const video = lightboxMedia.querySelector('video');
    if (video) video.pause();
    lightboxMedia.innerHTML = '';
  }

  function nextLightbox() {
    currentLightboxIndex = (currentLightboxIndex + 1) % window.MEDIA_ARCHIVE.length;
    openLightbox(currentLightboxIndex);
  }

  function prevLightbox() {
    currentLightboxIndex = (currentLightboxIndex - 1 + window.MEDIA_ARCHIVE.length) % window.MEDIA_ARCHIVE.length;
    openLightbox(currentLightboxIndex);
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', nextLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', prevLightbox);

  // Close lightbox on backdrop click
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-backdrop')) {
        closeLightbox();
      }
    });
  }

  // Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextLightbox();
    if (e.key === 'ArrowLeft') prevLightbox();
  });

  // Touch Swipe for Mobile Lightbox
  let touchStartX = 0;
  let touchEndX = 0;

  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 45) {
      if (diff < 0) nextLightbox();
      else prevLightbox();
    }
  }, { passive: true });

  // SCREEN 3 -> SCREEN 4 (Advance Archive Button)
  const proceedToAnomalyBtn = document.getElementById('proceedToAnomalyBtn');
  if (proceedToAnomalyBtn) {
    proceedToAnomalyBtn.addEventListener('click', () => {
      goToScreen(4);
    });
  }

  // SCREEN 4: The Anomaly Sequence
  function startAnomalySequence() {
    const p1 = document.getElementById('anomalyText1');
    const p2 = document.getElementById('anomalyText2');
    const p3 = document.getElementById('anomalyText3');
    const discoverBtn = document.getElementById('discoverBtn');
    const container = document.getElementById('anomalyContainer');

    // Reset
    p1.classList.remove('revealed');
    p2.classList.remove('revealed');
    p3.classList.remove('revealed');
    discoverBtn.classList.remove('revealed');
    container.classList.remove('glitch-active');
    container.classList.remove('deep-blackout');

    // Step 1: Glitch + First Sentence
    setTimeout(() => {
      container.classList.add('glitch-active');
      p1.classList.add('revealed');
    }, 400);

    // Step 2: Second Sentence
    setTimeout(() => {
      p2.classList.add('revealed');
    }, 1800);

    // Step 3: Screen fades to pitch dark
    setTimeout(() => {
      container.classList.remove('glitch-active');
      container.classList.add('deep-blackout');
    }, 3200);

    // Step 4: Third Sentence emerges from darkness with soft warm light
    setTimeout(() => {
      p3.classList.add('revealed');
      discoverBtn.classList.add('revealed');
    }, 4400);
  }

  // SCREEN 4 -> SCREEN 5 (Discover)
  const discoverBtn = document.getElementById('discoverBtn');
  if (discoverBtn) {
    discoverBtn.addEventListener('click', () => {
      goToScreen(5);
    });
  }

  // SCREEN 5 -> SCREEN 6 (Read Letter)
  const readLetterBtn = document.getElementById('readLetterBtn');
  if (readLetterBtn) {
    readLetterBtn.addEventListener('click', () => {
      goToScreen(6);
    });
  }

  // SCREEN 6: Render Letter
  function renderLetter() {
    const letterContainer = document.getElementById('letterBodyContainer');
    if (!letterContainer || !window.LETTER_DATA) return;
    letterContainer.innerHTML = '';

    const paragraphs = window.LETTER_DATA.paragraphs;

    paragraphs.forEach((pText, idx) => {
      const p = document.createElement('div');
      p.className = 'letter-paragraph scroll-reveal';

      // Check if this is the "Maysa, eu te amo tanto. Eu te amo muito, muito..." paragraph
      if (idx === 15 || pText.includes('muito, muito, muito')) {
        p.className += ' paragraph-epic-love';
        p.innerHTML = `
          <div class="epic-love-header">
            <span class="epic-heart-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </span>
            <span class="epic-badge">1.010 repetições de amor sem fim</span>
          </div>
          <div class="epic-love-text">${pText}</div>
        `;
      } else if (idx === 0) {
        p.className += ' paragraph-greeting';
        p.innerHTML = `<span class="greeting-highlight">${pText}</span>`;
      } else if (idx === 16) {
        // "sksksks"
        p.className += ' paragraph-laugh';
        p.innerHTML = `<em>${pText}</em>`;
      } else if (idx === 17) {
        // Closing lines
        p.className += ' paragraph-closing';
        // Split if has multiple lines
        const lines = pText.split('\n');
        p.innerHTML = lines.map(line => `<p class="closing-line">${line}</p>`).join('');
      } else {
        p.innerHTML = `<p>${pText}</p>`;
      }

      letterContainer.appendChild(p);
    });
  }

  // Scroll reveal observer for letter
  function initLetterScrollObserver() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    if (!('IntersectionObserver' in window)) {
      revealElements.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.01,
      rootMargin: '100px 0px 50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  // SCREEN 6 -> SCREEN 7 (To Universe)
  const toUniverseBtn = document.getElementById('toUniverseBtn');
  if (toUniverseBtn) {
    toUniverseBtn.addEventListener('click', () => {
      goToScreen(7);
    });
  }

  // SCREEN 7 -> SCREEN 1 (Restart)
  const restartArchiveBtn = document.getElementById('restartArchiveBtn');
  if (restartArchiveBtn) {
    restartArchiveBtn.addEventListener('click', () => {
      goToScreen(1);
    });
  }

  // Initial setup
  renderGallery('all');
  renderLetter();
  updateNav();

  // Check URL hash or query param (e.g. #screen-3 or ?screen=3)
  const urlParams = new URLSearchParams(window.location.search);
  const screenParam = urlParams.get('screen');
  const hash = window.location.hash;

  if (screenParam && screens[parseInt(screenParam, 10)]) {
    goToScreen(parseInt(screenParam, 10), true);
  } else if (hash && hash.startsWith('#screen-')) {
    const num = parseInt(hash.replace('#screen-', ''), 10);
    if (screens[num]) {
      goToScreen(num, true);
    }
  }
});
