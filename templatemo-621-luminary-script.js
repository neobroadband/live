/*
  Universal Cross-Browser & Multi-Device Script
  Handles: Viewport normalisation, iOS touch scroll-lock, universal carousels, and theme toggling
*/

(function () {
  'use strict';

  // ── 1. Dynamic Viewport Normalization (iOS Safari 100vh Fix) ──
  function updateViewportUnits() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  window.addEventListener('resize', updateViewportUnits, { passive: true });
  window.addEventListener('orientationchange', updateViewportUnits, { passive: true });
  updateViewportUnits();

  // ── 2. Theme State Manager ──
  function applyStoredTheme() {
    let stored = null;
    try {
      stored = localStorage.getItem('nb-theme');
    } catch (e) {}

    // Support automatic OS dark/light mode preference if no manual choice was set
    if (!stored && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      stored = 'light';
    }

    document.documentElement.setAttribute('data-theme', stored === 'light' ? 'light' : 'dark');
  }
  applyStoredTheme();

  function initThemeToggles() {
    const toggles = document.querySelectorAll('.theme-toggle');
    if (!toggles.length) return;

    const sync = () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      toggles.forEach(btn => btn.setAttribute('aria-pressed', String(isLight)));
    };
    sync();

    toggles.forEach(btn => {
      btn.addEventListener('click', () => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const next = isLight ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        try {
          localStorage.setItem('nb-theme', next);
        } catch (e) {}
        sync();
      });
    });
  }

  // ── 3. Smooth Anchor Scrolling with Fallback ──
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // ── 4. Mobile Menu with iOS Safari Scroll-Lock ──
  function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('mobileMenu');
    if (!toggle || !menu) return;

    const menuLinks = menu.querySelectorAll('.mobile-menu-link, a');
    let isOpen = false;

    function lockScroll(lock) {
      if (lock) {
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
      } else {
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
      }
    }

    function toggleMenu(openState) {
      isOpen = typeof openState === 'boolean' ? openState : !isOpen;
      toggle.classList.toggle('active', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      menu.classList.toggle('open', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
      lockScroll(isOpen);
    }

    toggle.addEventListener('click', () => toggleMenu());
    menuLinks.forEach(link => link.addEventListener('click', () => toggleMenu(false)));

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen) toggleMenu(false);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024 && isOpen) toggleMenu(false);
    }, { passive: true });
  }

  // ── 5. Intersection Observer Reveal Elements ──
  function initScrollReveals() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    if (!('IntersectionObserver' in window)) {
      reveals.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));
  }

  // ── 6. Navbar Scroll Blur Elevation ──
  function initNavScrollElevation() {
    const topNav = document.getElementById('topNav');
    if (!topNav) return;

    window.addEventListener('scroll', () => {
      topNav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  // ── 7. Active Navigation Link Detection ──
  function highlightCurrentPage() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-menu-link, .nav-utility a').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      const target = href.split('/').pop().split('#')[0];
      if (target && target === path) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else if (!target && path === 'index.html' && href.startsWith('#')) {
        // Keep hash links clean
      } else {
        link.classList.remove('active');
      }
    });
  }

  // ── DOM Initialization ──
  document.addEventListener('DOMContentLoaded', () => {
    initThemeToggles();
    initSmoothScroll();
    initMobileMenu();
    initScrollReveals();
    initNavScrollElevation();
    highlightCurrentPage();
  });

})();
