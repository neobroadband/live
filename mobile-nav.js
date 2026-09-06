/* Mobile navigation: visible theme toggle + reliable, iOS-safe drawer.
   Works on BOTH page types:
   - Marketing pages: opens the #mobileMenu full-screen drawer.
   - Portal pages (admin / customer): no #mobileMenu exists, so the
     hamburger slides the .sidebar in from the left instead.
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
      '<svg class="icon-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>' +
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

  /* ── Portal pages: sidebar acts as the mobile drawer ── */
  function initPortalSidebar(nav, hamburger) {
    var sidebar = document.querySelector('.sidebar');
    if (!sidebar) return false;

    // Dim layer behind the sidebar; tap it to close.
    var backdrop = document.querySelector('.sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
    }

    function isOpen() { return sidebar.classList.contains('open'); }

    function openSidebar() {
      sidebar.classList.add('open');
      backdrop.classList.add('show');
      hamburger.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      sidebar.setAttribute('aria-hidden', 'false');
      lockScroll();
    }

    function closeSidebar() {
      if (!isOpen()) return;
      sidebar.classList.remove('open');
      backdrop.classList.remove('show');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      sidebar.setAttribute('aria-hidden', 'true');
      unlockScroll();
    }

    // Single source of truth: replace any page-level handler by cloning,
    // then bind ours. Prevents double-toggling.
    var fresh = hamburger.cloneNode(true);
    hamburger.parentNode.replaceChild(fresh, hamburger);
    hamburger = fresh;

    hamburger.addEventListener('click', function (e) {
      e.preventDefault();
      isOpen() ? closeSidebar() : openSidebar();
    });

    backdrop.addEventListener('click', closeSidebar);

    // Close after tapping a real link inside the sidebar…
    sidebar.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        // …but let submenu parents expand first (handled below).
        if (!link.parentNode.classList.contains('has-submenu')) closeSidebar();
      });
    });

    /* Sub-menus: on mobile the first tap expands, the second tap follows.
       Works with any of these markups:
         <li class="has-submenu"><a>…</a><ul class="submenu">…</ul></li>
         or a [data-submenu] toggle followed by a hidden <ul>/<div>. */
    sidebar.querySelectorAll('.has-submenu > a, [data-submenu]').forEach(function (toggle) {
      toggle.addEventListener('click', function (e) {
        if (window.innerWidth > 1100) return; // desktop keeps normal behaviour
        var parent = toggle.closest('.has-submenu') || toggle.parentNode;
        var panel = parent.querySelector('.submenu, .sub-menu, ul, div[data-submenu-panel]');
        if (!panel) return; // plain link, let it navigate
        if (!parent.classList.contains('expanded')) {
          e.preventDefault();
          parent.classList.add('expanded');
          toggle.setAttribute('aria-expanded', 'true');
        }
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSidebar();
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (window.innerWidth > 1100) closeSidebar();
      }, 120);
    });

    sidebar.setAttribute('aria-hidden', String(!isOpen()));
    return true;
  }

  /* ── Marketing pages: full-screen #mobileMenu drawer (original behaviour) ── */
  function initMobileMenu(hamburger, menu) {
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

    // Portal pages have no #mobileMenu — drive the sidebar instead.
    if (menu) {
      initMobileMenu(hamburger, menu);
    } else {
      initPortalSidebar(nav, hamburger);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
