/* ============================================================
   Trattoria da Marco — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ---- URL Parameter Replacements ---- */

  /**
   * Recursively walk text nodes and replace occurrences of `search` with `replace`.
   */
  function replaceTextInNodes(node, search, replace) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.nodeValue.includes(search)) {
        node.nodeValue = node.nodeValue.split(search).join(replace);
      }
    } else if (
      node.nodeType === Node.ELEMENT_NODE &&
      !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.tagName)
    ) {
      node.childNodes.forEach(function (child) {
        replaceTextInNodes(child, search, replace);
      });
    }
  }

  function applyUrlReplacements() {
    var params = new URLSearchParams(window.location.search);

    /* ?stadt= → replaces "München" across all text nodes */
    var stadt = params.get('stadt');
    if (stadt && stadt.trim()) {
      replaceTextInNodes(document.body, 'München', decodeURIComponent(stadt.trim()));
    }

    /* ?firma= → replaces "Trattoria da Marco" across all text nodes */
    var firma = params.get('firma');
    if (firma && firma.trim()) {
      replaceTextInNodes(document.body, 'Trattoria da Marco', decodeURIComponent(firma.trim()));
      /* Also update page title */
      if (document.title.includes('Trattoria da Marco')) {
        document.title = document.title.split('Trattoria da Marco').join(decodeURIComponent(firma.trim()));
      }
    }
  }

  /* ---- Navbar Scroll Behaviour ---- */
  function initNavbar() {
    var navbar = document.querySelector('.navbar');
    if (!navbar) return;

    function onScroll() {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Mobile Menu ---- */
  function initMobileMenu() {
    var hamburger = document.querySelector('.hamburger');
    var mobileMenu = document.querySelector('.mobile-menu');
    if (!hamburger || !mobileMenu) return;

    function toggleMenu() {
      var isOpen = hamburger.classList.toggle('open');
      if (isOpen) {
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
      } else {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    }

    hamburger.addEventListener('click', toggleMenu);

    /* Close when a link is clicked */
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    /* Close on Escape key */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && hamburger.classList.contains('open')) {
        toggleMenu();
      }
    });
  }

  /* ---- Scroll Reveal ---- */
  function initScrollReveal() {
    var elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      elements.forEach(function (el) { observer.observe(el); });
    } else {
      /* Fallback: show all immediately */
      elements.forEach(function (el) { el.classList.add('visible'); });
    }
  }

  /* ---- Cookie Banner ---- */
  function initCookieBanner() {
    var banner = document.getElementById('cookie-banner');
    var acceptBtn = document.getElementById('cookie-accept');
    if (!banner || !acceptBtn) return;

    var COOKIE_KEY = 'tdm_cookie_accepted';

    function getCookie(name) {
      var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    }

    function setCookie(name, value, days) {
      var expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax';
    }

    if (!getCookie(COOKIE_KEY)) {
      /* Show after short delay */
      setTimeout(function () {
        banner.style.display = 'block';
      }, 1200);
    }

    acceptBtn.addEventListener('click', function () {
      setCookie(COOKIE_KEY, '1', 365);
      banner.style.display = 'none';
    });
  }

  /* ---- Active Nav Link ---- */
  function setActiveNavLink() {
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;
      var page = href.split('/').pop().split('?')[0] || 'index.html';
      if (page === currentPage) {
        link.classList.add('active');
      }
    });
  }

  /* ---- Menu Page: sticky nav highlight ---- */
  function initMenuNavHighlight() {
    var menuNavLinks = document.querySelectorAll('.menu-nav a');
    if (!menuNavLinks.length) return;

    var sections = [];
    menuNavLinks.forEach(function (link) {
      var id = link.getAttribute('href').replace('#', '');
      var section = document.getElementById(id);
      if (section) sections.push({ link: link, section: section });
    });

    function updateActive() {
      var scrollY = window.scrollY + 140;
      var current = sections[0];
      sections.forEach(function (item) {
        if (item.section.offsetTop <= scrollY) {
          current = item;
        }
      });
      menuNavLinks.forEach(function (l) { l.classList.remove('active'); });
      if (current) current.link.classList.add('active');
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
  }

  /* ---- Reservation Form ---- */
  function initReservationForm() {
    var form = document.getElementById('reservation-form');
    if (!form) return;

    /* Set min date to today */
    var dateInput = form.querySelector('input[name="datum"]');
    if (dateInput) {
      var today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var successMsg = document.getElementById('form-success');
      if (successMsg) {
        successMsg.style.display = 'block';
        form.reset();
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(function () {
          successMsg.style.display = 'none';
        }, 6000);
      }
    });
  }

  /* ---- Init on DOM Ready ---- */
  document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    initMobileMenu();
    initScrollReveal();
    initCookieBanner();
    setActiveNavLink();
    initMenuNavHighlight();
    initReservationForm();
    applyUrlReplacements();
  });

})();
