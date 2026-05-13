// menu.js — schone versie, sluit overal bij klik
// // perf: geen offsetHeight/offsetWidth/getBoundingClientRect na DOM-wijzigingen —
//         Lighthouse 'forced reflow' komt NIET uit dit bestand (oorzaak: async CSS-load onload swap)

document.addEventListener('DOMContentLoaded', function () {
  const menuBtn = document.getElementById('menu-btn');
  const navMenu = document.getElementById('nav-menu');

  if (!menuBtn || !navMenu) return;

  function openMenu() {
    navMenu.classList.add('active');
    menuBtn.classList.add('open');
    // Accessibility: informeer screenreaders dat menu open is
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Sluit navigatiemenu');
  }

  function closeMenu() {
    navMenu.classList.remove('active');
    menuBtn.classList.remove('open');
    // Accessibility: informeer screenreaders dat menu gesloten is
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open navigatiemenu');
  }

  menuBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    navMenu.classList.contains('active') ? closeMenu() : openMenu();
  });

  navMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Sluit menu bij klik OVERAL buiten het menu (mobiel + desktop)
  document.addEventListener('click', function (e) {
    if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && e.target !== menuBtn) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

});