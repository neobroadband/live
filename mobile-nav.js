/* Mobile navigation enhancements: visible theme toggle + reliable drawer */
(function () {
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

  function init() {
    var nav = document.querySelector('.top-nav');
    var hamburger = nav && nav.querySelector('.nav-toggle');
    if (!nav || !hamburger || nav.querySelector('.nav-mobile-actions')) return;

    var actions = document.createElement('div');
    actions.className = 'nav-mobile-actions';
    hamburger.parentNode.insertBefore(actions, hamburger);
    actions.appendChild(buildToggle());
    actions.appendChild(hamburger);

    // Keep the drawer state consistent when rotating / resizing.
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1100) {
        document.body.classList.remove('menu-open');
        var menu = document.getElementById('mobileMenu');
        if (menu) menu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
