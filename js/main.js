/**
 * TechBridge - top page scripts
 * - Mobile navigation drawer（開閉・フォーカス管理・背面スクロール固定）
 * - Scroll reveal（IntersectionObserver）
 *
 * 対象ブラウザは現行のモダンブラウザ（inert / IntersectionObserver / matchMedia.addEventListener 対応）。
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;

  /* ---- Mobile navigation ---- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('gnav');
  var inertTargets = Array.prototype.slice.call(document.querySelectorAll('main, footer'));
  var FOCUSABLE = 'a[href], button:not([disabled])';
  var MOBILE_NAV_QUERY = '(max-width: 1080px)'; // CSS のハンバーガー切替と同じ式にする（小数幅の取りこぼし防止）
  var savedScrollY = 0;

  function lockScroll() {
    savedScrollY = window.scrollY || window.pageYOffset;
    body.style.top = -savedScrollY + 'px';
    root.classList.add('is-nav-open');
  }

  function unlockScroll() {
    root.classList.remove('is-nav-open');
    body.style.top = '';
    // scroll-behavior: smooth の影響を受けずに元の位置へ戻す
    var prev = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, savedScrollY);
    root.style.scrollBehavior = prev;
  }

  function setOpen(open) {
    if (!toggle || !nav) return;
    if (open === nav.classList.contains('is-open')) return;

    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open)); // 開閉状態は aria-expanded のみで伝える

    // ドロワー表示中は背面コンテンツを不活性化（フォーカス・支援技術の両方から外す）
    inertTargets.forEach(function (el) {
      if (open) {
        el.setAttribute('inert', '');
      } else {
        el.removeAttribute('inert');
      }
    });

    if (open) {
      lockScroll();
      var first = nav.querySelector(FOCUSABLE);
      if (first) first.focus();
    } else {
      unlockScroll();
      toggle.focus();
    }
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (!nav.classList.contains('is-open')) return;

      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }

      // ドロワー内でフォーカスをループさせる（トグルボタンも含める）
      if (e.key === 'Tab') {
        var items = Array.prototype.slice.call(nav.querySelectorAll(FOCUSABLE));
        items.push(toggle);
        var index = items.indexOf(document.activeElement);
        var next = e.shiftKey ? index - 1 : index + 1;
        if (index === -1 || next < 0 || next >= items.length) {
          e.preventDefault();
          items[e.shiftKey ? items.length - 1 : 0].focus();
        }
      }
    });

    window.matchMedia(MOBILE_NAV_QUERY).addEventListener('change', function (e) {
      if (!e.matches) setOpen(false);
    });
  }

  /* ---- Scroll reveal ---- */
  var targets = Array.prototype.slice.call(document.querySelectorAll('.js-reveal'));

  function revealAll() {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
  }

  try {
    if (!('IntersectionObserver' in window)) {
      revealAll();
    } else {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -5% 0px', threshold: 0.05 });

      targets.forEach(function (el) {
        // 初期表示時点でビューポート内にある要素は Observer を待たずにフェードインを開始する
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('is-visible');
        } else {
          observer.observe(el);
        }
      });
    }
    root.classList.add('js-ready');
  } catch (err) {
    // 何かあれば演出を諦めて全表示に戻す
    root.classList.remove('js');
    revealAll();
  }
})();
