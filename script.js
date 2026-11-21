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

      const photoPositions = Array.from(photos, (photo) => ({
        element: photo,
        center: 0,
        width: 0,
        tone: '',
      }));

      function cachePhotoPositions() {
        const trackRect = track.getBoundingClientRect();
        photoPositions.forEach((item) => {
          item.center = item.element.offsetLeft + item.element.offsetWidth / 2 - trackRect.left;
          item.width = item.element.offsetWidth;
        });
      }

      function updatePhotoTones(progress) {
        const travel = getScrollDistance();
        const viewportCenter = window.innerWidth / 2;
        photoPositions.forEach((item) => {
          const center = item.center - travel * progress;
          const focused = Math.abs(viewportCenter - center) < item.width * 0.95
            && center + item.width / 2 > 0
            && center - item.width / 2 < window.innerWidth;
          const tone = focused ? 'focus' : 'dim';
          if (item.tone !== tone) {
            item.tone = tone;
            item.element.setAttribute('data-tone', tone);
          }
        });
      }

      // Main Horizontal Tween pinned to viewport
      const galleryTween = gsap.to(track, {
        x: () => -getScrollDistance(),
        force3D: true,
        ease: 'none',
        scrollTrigger: {
          trigger: '.gallery-hscroll-section',
          pin: true,
          scrub: true,
          start: 'top top',
          end: () => '+=' + getScrollDistance(),
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            updatePhotoTones(self.progress);
          },
        },
      });

      // Subtle Parallax Layering for Photo Cards (data-speed 0.88 to 1.15)
      const parallaxCards = document.querySelectorAll('.gallery-photo[data-speed]');
      const parallaxTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '.gallery-hscroll-section',
          start: 'top top',
          end: () => '+=' + getScrollDistance(),
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      parallaxCards.forEach((card) => {
        const speed = parseFloat(card.getAttribute('data-speed')) || 1.0;
        parallaxTimeline.to(card, {
          x: (speed - 1.0) * 160,
          force3D: true,
          ease: 'none',
        }, 0);
      });

      // Recalculate once all images inside track finish loading
      const galleryImages = track.querySelectorAll('img');
      let refreshTimer;
      const scheduleGalleryRefresh = () => {
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
      };

      galleryImages.forEach((img) => {
        if (!img.complete) {
          img.addEventListener('load', scheduleGalleryRefresh, { once: true });
        }
      });

      window.addEventListener('load', () => {
        scheduleGalleryRefresh();
      });
      ScrollTrigger.addEventListener('refresh', cachePhotoPositions);
      cachePhotoPositions();

      return () => {
        // Cleanup if breakpoint leaves desktop
        galleryTween.kill();
        parallaxTimeline.kill();
        ScrollTrigger.removeEventListener('refresh', cachePhotoPositions);
      };
    });
  }

  // ------------------------------------------------------------------------
  // 2B. TRACK PORTAL (ON TRACK / OFF TRACK) STICKY REVEAL ANIMATION
  // ------------------------------------------------------------------------
  const ototSection = document.getElementById('track-portal');
  if (ototSection && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      ScrollTrigger.matchMedia({
        // Desktop: Pin and scrub reveal
        '(min-width: 992px)': function () {
          const ototTl = gsap.timeline({
            scrollTrigger: {
              trigger: '#track-portal',
              start: 'top top',
              end: '+=70%',
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
            },
          });

          // Left skeleton slides & reveals from left
          ototTl.from('.otot-photo-col.is-left .otot-skeleton-card', {
            x: -80,
            opacity: 0.2,
            clipPath: 'inset(0% 100% 0% 0%)',
            ease: 'power2.out',
            duration: 1,
          }, 0);

          // Right skeleton slides & reveals from right
          ototTl.from('.otot-photo-col.is-right .otot-skeleton-card', {
            x: 80,
            opacity: 0.2,
            clipPath: 'inset(0% 0% 0% 100%)',
            ease: 'power2.out',
            duration: 1,
          }, 0);

          // Center ON TRACK text block
          ototTl.from('.otot-block.is-ontrack', {
            y: -30,
            opacity: 0,
            ease: 'power2.out',
            duration: 0.8,
          }, 0.15);

          // Center Divider
          ototTl.from('.otot-mid-divider', {
            scaleX: 0,
            opacity: 0,
            ease: 'power2.out',
            duration: 0.6,
          }, 0.2);

          // Center OFF TRACK text block
          ototTl.from('.otot-block.is-offtrack', {
            y: 30,
            opacity: 0,
            ease: 'power2.out',
            duration: 0.8,
          }, 0.25);
        },

        // Mobile/Tablet: Clean staggered scroll reveal without pinning
        '(max-width: 991px)': function () {
          gsap.from('.otot-block', {
            scrollTrigger: {
              trigger: '#track-portal',
              start: 'top 80%',
              once: true,
            },
            y: 40,
            opacity: 0,
            stagger: 0.2,
            duration: 0.8,
            ease: 'power2.out',
          });
        },
      });
    }
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
  const folderChoices = document.querySelectorAll('.folder-choice');
  const folderPanels = document.querySelectorAll('.folder-panel');

  function closeFolders() {
    folderPanels.forEach((panel) => {
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
    });
    folderChoices.forEach((choice) => {
      choice.hidden = false;
    });
    if (typeof ScrollTrigger !== 'undefined') {
      setTimeout(() => ScrollTrigger.refresh(), 150);
    }
  }

  function openFolder(folderName) {
    closeFolders();
    const panel = document.querySelector(`[data-folder-panel="${folderName}"]`);
    if (!panel) return;
    const choice = document.querySelector(`[data-folder="${folderName}"]`);
    if (choice) choice.hidden = true;
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(panel, { scale: 0.35, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.85, ease: 'expo.out' });
      gsap.fromTo(panel.querySelector('.folder-panel-info'), { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: 0.45, delay: 0.35, ease: 'power2.out' });
      gsap.fromTo(panel.querySelectorAll('.folder-photo-card'), { opacity: 0, x: 45, scale: 0.96 }, {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.1,
        delay: 0.4,
        ease: 'power3.out',
      });
    }
  }

  folderChoices.forEach((choice) => {
    choice.addEventListener('click', () => openFolder(choice.getAttribute('data-folder')));
  });

  folderPanels.forEach((panel) => {
    const closeButton = panel.querySelector('.folder-close');
    if (closeButton) closeButton.addEventListener('click', closeFolders);
  });

  if (tabBtns.length > 0 && tabPanes.length > 0) {
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', function () {
        const targetTabId = this.getAttribute('data-tab');

        // Deactivate all
        tabBtns.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });

        closeFolders();

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
    } else if (e.key === 'Escape' && document.querySelector('.folder-panel.is-open')) {
      closeFolders();
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
  // 6B. EDITORIAL SECTION ENTRANCE ANIMATIONS (GSAP ScrollTrigger)
  // ------------------------------------------------------------------------
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      // Reveal section headers
      gsap.utils.toArray('.section-header-editorial, .sub-header-editorial').forEach((header) => {
        gsap.from(header, {
          scrollTrigger: {
            trigger: header,
            start: 'top 85%',
            once: true,
          },
          y: 35,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
        });
      });

      // Reveal profile columns & vision box
      if (document.querySelector('.profile-layout-grid')) {
        gsap.from('.profile-portrait-col, .profile-bio-col', {
          scrollTrigger: {
            trigger: '.profile-layout-grid',
            start: 'top 80%',
            once: true,
          },
          y: 45,
          opacity: 0,
          stagger: 0.2,
          duration: 0.85,
          ease: 'power2.out',
        });
      }

      // Reveal education float cards
      if (document.querySelector('.editorial-edu-cards-row')) {
        gsap.from('.edu-float-card', {
          scrollTrigger: {
            trigger: '.editorial-edu-cards-row',
            start: 'top 80%',
            once: true,
          },
          y: 50,
          opacity: 0,
          stagger: 0.15,
          duration: 0.75,
          ease: 'power2.out',
        });
      }

      // Reveal Tab Navigation
      if (document.querySelector('.tab-nav-wrapper')) {
        gsap.from('.tab-nav-wrapper', {
          scrollTrigger: {
            trigger: '.tab-nav-wrapper',
            start: 'top 85%',
            once: true,
          },
          y: 30,
          opacity: 0,
          duration: 0.7,
          ease: 'power2.out',
        });
      }

      // Reveal Contact section columns
      if (document.querySelector('.contact-editorial-layout')) {
        gsap.from('.contact-left-col, .contact-right-col', {
          scrollTrigger: {
            trigger: '.contact-editorial-layout',
            start: 'top 80%',
            once: true,
          },
          y: 40,
          opacity: 0,
          stagger: 0.2,
          duration: 0.85,
          ease: 'power2.out',
        });
      }
    }
  }

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
