/**
 * TechBridge - top page scripts
 * - Mobile navigation toggle
 * - Scroll reveal (IntersectionObserver)
 */
(function () {
  'use strict';

  /* ---- Mobile navigation ---- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('gnav');

  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
      document.documentElement.classList.toggle('is-nav-open', open);
    };

    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setOpen(false);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    var desktopQuery = window.matchMedia('(min-width: 961px)');
    var onQueryChange = function (e) {
      if (e.matches) setOpen(false);
    };
    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener('change', onQueryChange);
    } else {
      desktopQuery.addListener(onQueryChange);
    }
  }

  /* ---- Scroll reveal ---- */
  var targets = document.querySelectorAll('.js-reveal');

  if (!('IntersectionObserver' in window) || !targets.length) {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -5% 0px', threshold: 0.05 });

  targets.forEach(function (el) {
    // 初期表示時点でビューポート内にある要素は即時表示（初回描画のちらつき防止）
    var rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('is-visible');
      return;
    }
    observer.observe(el);
  });
})();
