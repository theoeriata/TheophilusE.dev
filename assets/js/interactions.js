/**
 * interactions.js — lightweight vanilla JS for site-wide interactions
 * Covers: scroll reveal, reading progress, code copy button, theme toggle transition,
 * mobile nav, and scroll-to-top. All animations respect prefers-reduced-motion.
 */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================
     1. SCROLL REVEAL
     Elements with [data-reveal] animate in when entering viewport.
     Usage: add data-reveal (optional data-reveal-delay="200") to any element.
     ========================================================= */
  function initScrollReveal() {
    if (prefersReduced) return;

    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.dataset.revealDelay || 0;
            setTimeout(() => el.classList.add('revealed'), parseInt(delay, 10));
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    els.forEach((el) => {
      el.classList.add('will-reveal');
      observer.observe(el);
    });
  }

  /* =========================================================
     2. READING PROGRESS BAR
     Shows a thin accent bar at top of page on article pages.
     ========================================================= */
  function initReadingProgress() {
    const bar = document.getElementById('reading-progress');
    if (!bar) return;

    let ticking = false;
    function update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      bar.style.transform = `scaleX(${pct / 100})`;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }

  /* =========================================================
     3. SMOOTH THEME TRANSITION
     Adds a brief .theme-transitioning class during toggle so
     CSS can suppress transitions that would otherwise flash.
     ========================================================= */
  function initThemeTransition() {
    const btn = document.getElementById('theme-toggle');
    if (!btn || prefersReduced) return;

    btn.addEventListener('click', () => {
      document.body.classList.add('theme-transitioning');
      window.setTimeout(() => document.body.classList.remove('theme-transitioning'), 400);
    });
  }

  /* =========================================================
     4. SCROLL-TO-TOP BUTTON VISIBILITY
     The button itself is rendered by footer.html; we only
     manage its visibility here (show after 400px scroll).
     ========================================================= */
  function initScrollToTop() {
    const btn = document.getElementById('scroll-to-top');
    if (!btn) return;

    let ticking = false;
    function update() {
      btn.classList.toggle('visible', window.scrollY > 400);
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'instant' : 'smooth' });
    });
  }

  /* =========================================================
     5. MOBILE NAV
     Toggle open/close for the hamburger nav.
     ========================================================= */
  function initMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const menu = document.getElementById('menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('nav-open', isOpen);
    });

    // Close nav when a link is clicked
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
      });
    });

    // Close nav on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
        toggle.focus();
      }
    });
  }

  /* =========================================================
     6. CODE COPY BUTTON
     Injects a "Copy" button into every <pre> code block.
     ========================================================= */
  function initCodeCopy() {
    document.querySelectorAll('pre > code').forEach((code) => {
      const pre = code.parentElement;
      if (pre.querySelector('.copy-btn')) return; // already added

      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.setAttribute('aria-label', 'Copy code');
      btn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

      btn.addEventListener('click', () => {
        const text = code.innerText;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(() => showCopied(btn));
        } else {
          // Fallback for older browsers
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); showCopied(btn); } catch (_) {}
          document.body.removeChild(ta);
        }
      });

      pre.style.position = 'relative';
      pre.appendChild(btn);
    });
  }

  function showCopied(btn) {
    btn.classList.add('copied');
    btn.setAttribute('aria-label', 'Copied!');
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.setAttribute('aria-label', 'Copy code');
    }, 2000);
  }

  /* =========================================================
     7. ACTIVE NAV HIGHLIGHT
     Mark the current section's nav link as active based on URL.
     PaperMod sets .active on <span> already; this ensures the
     parent <a> gets an aria-current for screen readers.
     ========================================================= */
  function initActiveNav() {
    const path = window.location.pathname;
    document.querySelectorAll('#menu a').forEach((link) => {
      const href = link.getAttribute('href');
      if (href && href !== '/' && path.startsWith(href)) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  /* =========================================================
     INIT
     ========================================================= */
  function init() {
    initScrollReveal();
    initReadingProgress();
    initThemeTransition();
    initScrollToTop();
    initMobileNav();
    initCodeCopy();
    initActiveNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

