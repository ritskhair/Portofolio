/* ==========================================================================
   DRACO PORTFOLIO — JAVASCRIPT
   Author: Muhammad Harits Khairiansyah
   Features:
   1. Lenis Smooth Scroll (Integrated with GSAP Ticker, zero vibration)
   2. Horizontal Photo Gallery Pinned Scroll (ala landonorris.com)
   3. Starting with open negative space + floating quote, then photos glide from right
   4. Photo Center-Focus Detection & Subtle Parallax
   5. Minimalist Corner Editorial Header & Fullscreen Drawer Nav
   6. Interactive 4-Tab Switcher with ScrollTrigger.refresh()
   7. Lightbox Modal & Accessible Keyboard Navigation
   ========================================================================== */

(function () {
  'use strict';

  // ------------------------------------------------------------------------
  // 1. LENIS SMOOTH SCROLL (Desktop Only, Zero Vibration)
  // ------------------------------------------------------------------------
  let lenis = null;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isDesktop = window.innerWidth > 768 && !isTouchDevice;

  if (typeof Lenis !== 'undefined' && isDesktop) {
    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        smoothTouch: false,
        touchMultiplier: 1.2,
      });

      // Synchronize Lenis with GSAP ScrollTrigger
      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
          lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
      } else {
        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }
    } catch (e) {
      console.warn('Lenis initialization notice:', e);
    }
  }

  // ------------------------------------------------------------------------
  // 2. GSAP SCROLLTRIGGER: HORIZONTAL PHOTO GALLERY (ala landonorris.com)
  // ------------------------------------------------------------------------
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    mm.add('(min-width: 769px)', () => {
      const track = document.getElementById('galleryTrack');
      const viewport = document.getElementById('galleryViewport');
      const photos = document.querySelectorAll('.gallery-photo');

      if (!track || !viewport) return;

      // Calculate horizontal translation distance dynamically
      function getScrollDistance() {
        return Math.max(0, track.scrollWidth - window.innerWidth);
      }

      // Main Horizontal Tween pinned to viewport
      const galleryTween = gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: '.gallery-hscroll-section',
          pin: true,
          scrub: 0.9,
          start: 'top top',
          end: () => '+=' + getScrollDistance(),
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Photo center focus detection
            if (photos.length > 0) {
              const viewportCenter = window.innerWidth / 2;
              photos.forEach((photo) => {
                const rect = photo.getBoundingClientRect();
                const photoCenter = rect.left + rect.width / 2;
                const distance = Math.abs(viewportCenter - photoCenter);

                // If photo is within the central 70% of viewport, illuminate and scale
                if (distance < rect.width * 0.95 && rect.right > 0 && rect.left < window.innerWidth) {
                  photo.setAttribute('data-tone', 'focus');
                } else {
                  photo.setAttribute('data-tone', 'dim');
                }
              });
            }
          },
        },
      });

      // Subtle Parallax Layering for Photo Cards (data-speed 0.88 to 1.15)
      const parallaxCards = document.querySelectorAll('.gallery-photo[data-speed]');
      parallaxCards.forEach((card) => {
        const speed = parseFloat(card.getAttribute('data-speed')) || 1.0;
        const deltaX = (speed - 1.0) * 160;

        gsap.to(card, {
          x: deltaX,
          ease: 'none',
          scrollTrigger: {
            trigger: '.gallery-hscroll-section',
            start: 'top top',
            end: () => '+=' + getScrollDistance(),
            scrub: true,
          },
        });
      });

      // Recalculate once all images inside track finish loading
      const galleryImages = track.querySelectorAll('img');
      galleryImages.forEach((img) => {
        if (!img.complete) {
          img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
        }
      });

      window.addEventListener('load', () => {
        ScrollTrigger.refresh();
      });

      return () => {
        // Cleanup if breakpoint leaves desktop
        galleryTween.kill();
      };
    });
  }

  // ------------------------------------------------------------------------
  // 3. EDITORIAL TOP-RIGHT MENU & FULLSCREEN DRAWER OVERLAY
  // ------------------------------------------------------------------------
  const menuToggle = document.getElementById('menuToggle');
  const navDrawer = document.getElementById('navDrawer');
  const drawerClose = document.getElementById('drawerClose');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  function openDrawer() {
    if (!navDrawer) return;
    navDrawer.classList.add('open');
    navDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
  }

  function closeDrawer() {
    if (!navDrawer) return;
    navDrawer.classList.remove('open');
    navDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  }

  let isMenuSpinning = false;

  if (menuToggle) {
    menuToggle.addEventListener('click', function (e) {
      e.preventDefault();
      if (isMenuSpinning) return;
      isMenuSpinning = true;

      const dracoIcon = menuToggle.querySelector('.draco-menu-icon');
      if (dracoIcon) {
        dracoIcon.classList.remove('is-spinning');
        void dracoIcon.offsetWidth; // Force DOM reflow to restart animation reliably
        dracoIcon.classList.add('is-spinning');
      }

      // Smooth 360-degree spin takes 450ms, open drawer right as spin concludes
      setTimeout(() => {
        openDrawer();
        isMenuSpinning = false;
        if (dracoIcon) {
          dracoIcon.classList.remove('is-spinning');
        }
      }, 440);
    });
  }

  if (drawerClose) {
    drawerClose.addEventListener('click', closeDrawer);
  }

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', closeDrawer);
  }

  drawerLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      closeDrawer();

      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          setTimeout(() => {
            if (lenis) {
              lenis.scrollTo(targetEl, { offset: 0, duration: 1.2 });
            } else {
              targetEl.scrollIntoView({ behavior: 'smooth' });
            }
          }, 300);
        }
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navDrawer && navDrawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // ------------------------------------------------------------------------
  // 4. INTERACTIVE TAB SWITCHER (Section: Experience)
  // ------------------------------------------------------------------------
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  if (tabBtns.length > 0 && tabPanes.length > 0) {
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', function () {
        const targetTabId = this.getAttribute('data-tab');

        // Deactivate all
        tabBtns.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });

        // Activate clicked
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');

        // Switch pane
        tabPanes.forEach((pane) => {
          pane.classList.remove('active');
          if (pane.getAttribute('id') === targetTabId) {
            pane.classList.add('active');
          }
        });

        // Refresh ScrollTrigger so that dynamic heights update smoothly
        if (typeof ScrollTrigger !== 'undefined') {
          setTimeout(() => {
            ScrollTrigger.refresh();
          }, 80);
        }
      });
    });
  }

  // ------------------------------------------------------------------------
  // 5. LIGHTBOX MODAL (Projects & Certificates Preview)
  // ------------------------------------------------------------------------
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const triggers = document.querySelectorAll('.lightbox-trigger');

  function openLightbox(imgSrc, title, desc) {
    if (!lightboxModal) return;
    lightboxImg.src = imgSrc;
    lightboxTitle.textContent = title || '';
    lightboxDesc.textContent = desc || '';
    lightboxModal.classList.add('active');
    lightboxModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    lightboxModal.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', function () {
      const imgSrc = this.getAttribute('data-img');
      const title = this.getAttribute('data-title');
      const desc = this.getAttribute('data-desc');
      if (imgSrc) {
        openLightbox(imgSrc, title, desc);
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightboxBackdrop) {
    lightboxBackdrop.addEventListener('click', closeLightbox);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) {
      closeLightbox();
    }
  });

  // ------------------------------------------------------------------------
  // 6. SMOOTH IN-PAGE ANCHOR SCROLL
  // ------------------------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          if (lenis) {
            lenis.scrollTo(targetEl, { offset: 0, duration: 1.2 });
          } else {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  });

  // ------------------------------------------------------------------------
  // 7. WINDOW RESIZE RECALCULATION
  // ------------------------------------------------------------------------
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    }, 200);
  });

})();
