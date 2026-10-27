/* Content and navigation remain available without JavaScript. */
(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const theme = document.getElementById('theme-toggle');
  function updateTheme() {
    const dark = document.body.classList.contains('dark');
    theme?.setAttribute('aria-pressed', String(dark));
    theme?.setAttribute('aria-label', 'Use ' + (dark ? 'light' : 'dark') + ' theme');
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  }
  updateTheme();
  theme?.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    try { localStorage.setItem('pref-theme', document.body.classList.contains('dark') ? 'dark' : 'light'); } catch (_) {}
    updateTheme();
  });

  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('menu');
  function closeMenu(restoreFocus = false) {
    menu?.classList.remove('nav-open');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', 'Open navigation');
    if (restoreFocus) toggle?.focus();
  }
  toggle?.addEventListener('click', () => {
    const open = menu.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', (open ? 'Close' : 'Open') + ' navigation');
  });
  menu?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.classList.contains('nav-open')) closeMenu(true);
  });
  document.addEventListener('click', event => { if (!event.target.closest('.nav')) closeMenu(); });
  document.querySelector('.nav')?.addEventListener('focusout', event => {
    if (!event.currentTarget.contains(event.relatedTarget)) closeMenu();
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', () => closeMenu());

  const contents = document.querySelector('.toc details');
  const wideReading = window.matchMedia('(min-width: 901px)');
  if (contents) {
    contents.open = wideReading.matches;
    wideReading.addEventListener('change', event => { contents.open = event.matches; });
  }

  const progress = document.getElementById('reading-progress');
  const article = document.querySelector('.post-single .post-content');
  const topLink = document.getElementById('scroll-to-top');
  let scheduled = false;
  function updateScroll() {
    topLink?.classList.toggle('visible', window.scrollY > 400);
    if (progress && article) {
      const start = article.getBoundingClientRect().top + window.scrollY - 100;
      const distance = Math.max(1, article.offsetHeight - window.innerHeight + 100);
      const percent = Math.max(0, Math.min(100, (window.scrollY - start) / distance * 100));
      progress.style.transform = 'scaleX(' + percent / 100 + ')';
      progress.setAttribute('aria-valuenow', String(Math.round(percent)));
    }
    scheduled = false;
  }
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  window.addEventListener('resize', updateScroll);
  updateScroll();

  if (navigator.clipboard && document.body.dataset.codeCopy === 'true') {
    document.querySelectorAll('pre > code').forEach(code => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-btn';
      button.textContent = 'Copy';
      button.setAttribute('aria-label', 'Copy code');
      button.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(code.textContent);
          button.textContent = 'Copied';
        } catch (_) { button.textContent = 'Copy failed'; }
        setTimeout(() => { button.textContent = 'Copy'; }, 2000);
      });
      code.parentElement.appendChild(button);
    });
  }
})();
