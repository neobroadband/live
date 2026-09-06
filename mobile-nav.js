/* Mobile navigation: visible theme toggle + reliable, iOS-safe drawer.
   Safe to include on every page. It will not double-bind if a page already
   wires up its own #navToggle handler. */
(function () {
  var scrollY = 0;

  function applyTheme(next) {
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('nb-theme', next); } catch (e) {}
    document.querySelectorAll('.theme-toggle').forEach(function (b) {
      b.setAttribute('aria-pressed', String(next === 'light'));
    });
  }

  function buildToggle() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle nav-theme-toggle';
    btn.setAttribute('aria-label', 'Toggle light and dark theme');
    btn.setAttribute('aria-pressed', String(document.documentElement.getAttribute('data-theme') === 'light'));
    btn.innerHTML =
      '<span class="theme-toggle-knob">' +
      '<svg class="icon-moon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>' +
      '<svg class="icon-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>' +
      '</span>';
    btn.addEventListener('click', function () {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      applyTheme(isLight ? 'dark' : 'light');
    });
    return btn;
  }

  function lockScroll() {
    scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    document.body.style.top = -scrollY + 'px';
    document.body.classList.add('menu-open');
  }

  function unlockScroll() {
    document.body.classList.remove('menu-open');
    document.body.style.top = '';
    window.scrollTo(0, scrollY);
  }

  function init() {
    var nav = document.querySelector('.top-nav, .portal-nav');
    var hamburger = nav && nav.querySelector('.nav-toggle');
    var menu = document.getElementById('mobileMenu');
    if (!nav || !hamburger) return;

    // Put the theme switch next to the hamburger (once).
    if (!nav.querySelector('.nav-mobile-actions')) {
      var actions = document.createElement('div');
      actions.className = 'nav-mobile-actions';
      hamburger.parentNode.insertBefore(actions, hamburger);
      actions.appendChild(buildToggle());
      actions.appendChild(hamburger);
    }

    if (!menu) return;

    function isOpen() { return menu.classList.contains('open'); }

    function openMenu() {
      menu.classList.add('open');
      hamburger.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      menu.setAttribute('aria-hidden', 'false');
      lockScroll();
    }

    function closeMenu() {
      if (!isOpen()) return;
      menu.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      unlockScroll();
    }

    // Single source of truth for the drawer: replace any page-level handler
    // by cloning the button, then bind ours. Prevents double-toggling.
    var fresh = hamburger.cloneNode(true);
    hamburger.parentNode.replaceChild(fresh, hamburger);
    hamburger = fresh;

    hamburger.addEventListener('click', function (e) {
      e.preventDefault();
      isOpen() ? closeMenu() : openMenu();
    });

    menu.querySelectorAll('.mobile-menu-link, .mobile-menu-footer a').forEach(function (l) {
      l.addEventListener('click', closeMenu);
    });

    // Tap on empty drawer space closes it.
    menu.addEventListener('click', function (e) {
      if (e.target === menu || e.target.classList.contains('mobile-menu-inner')) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (window.innerWidth > 1100) closeMenu();
      }, 120);
    });

    menu.setAttribute('aria-hidden', String(!isOpen()));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
