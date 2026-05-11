// menu.js — schone versie, sluit overal bij klik

document.addEventListener('DOMContentLoaded', function () {
  const menuBtn = document.getElementById('menu-btn');
  const navMenu = document.getElementById('nav-menu');

  if (!menuBtn || !navMenu) return;

  function openMenu() {
    navMenu.classList.add('active');
    menuBtn.classList.add('open');
  }

  function closeMenu() {
    navMenu.classList.remove('active');
    menuBtn.classList.remove('open');
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