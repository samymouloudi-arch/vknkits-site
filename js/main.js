// VKNKITS — small interactions. No libraries needed.
(function () {
  // Mobile menu
  var menuBtn = document.querySelector('.menu-btn');
  var mobileNav = document.querySelector('.mobile-nav');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Mystery card: click to spin and reveal
  document.querySelectorAll('[data-flip]').forEach(function (card) {
    card.querySelectorAll('[data-flip-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var flipped = card.classList.toggle('is-flipped');
        card.querySelector('.front').setAttribute('aria-expanded', flipped ? 'true' : 'false');
        card.querySelector('.back').setAttribute('aria-hidden', flipped ? 'false' : 'true');
        if (flipped) {
          var cta = card.querySelector('.back .btn');
          setTimeout(function () { cta && cta.focus({ preventScroll: true }); }, 700);
        }
      });
    });
  });

  // Background videos: pause button, and fall back to the poster photo if the file is missing
  document.querySelectorAll('video[data-bg]').forEach(function (v) {
    var src = v.querySelector('source');
    if (src) src.addEventListener('error', function () {
      // Video file not there yet: show the poster photo instead
      if (!v.parentElement.querySelector('img.poster') && v.poster) {
        var img = document.createElement('img');
        img.src = v.poster; img.alt = ''; img.className = 'poster-fallback';
        v.parentElement.insertBefore(img, v);
      }
      v.style.display = 'none';
      var t = v.parentElement.querySelector('[data-video-toggle]');
      if (t) t.style.display = 'none';
    });
    var btn = v.parentElement.querySelector('[data-video-toggle]');
    if (btn) {
      btn.addEventListener('click', function () {
        if (v.paused) { v.play(); btn.setAttribute('aria-label', 'Pause video'); btn.innerHTML = pauseIcon; }
        else { v.pause(); btn.setAttribute('aria-label', 'Play video'); btn.innerHTML = playIcon; }
      });
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { v.removeAttribute('autoplay'); v.pause(); }
  });
  var pauseIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>';
  var playIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l12 7-12 7z"/></svg>';

  // Order form: quantity, total and "teams to skip"
  var order = document.querySelector('#order-form');
  if (order) {
    var PRICE = 50;
    var qty = order.querySelector('#quantity');
    var totalEl = document.querySelector('[data-total]');
    var sizeEl = document.querySelector('[data-size]');
    var skipCountEl = document.querySelector('[data-skip-count]');
    var skipHidden = order.querySelector('input[name="teams_to_skip"]');
    var totalHidden = order.querySelector('input[name="total"]');

    function update() {
      var q = Math.min(10, Math.max(1, parseInt(qty.value, 10) || 1));
      qty.value = q;
      totalEl.textContent = '$' + (q * PRICE);
      totalHidden.value = '$' + (q * PRICE);
      var size = order.querySelector('input[name="size"]:checked');
      sizeEl.textContent = size ? size.value : '—';
      var skipped = Array.prototype.map.call(order.querySelectorAll('[data-team]:checked'), function (c) { return c.value; });
      var other = order.querySelector('#other_teams').value.trim();
      if (other) skipped.push(other);
      skipHidden.value = skipped.join(', ');
      skipCountEl.textContent = order.querySelectorAll('[data-team]:checked').length + (other ? '+' : '');
    }
    order.querySelector('[data-qty="-"]').addEventListener('click', function () { qty.value = (parseInt(qty.value, 10) || 1) - 1; update(); });
    order.querySelector('[data-qty="+"]').addEventListener('click', function () { qty.value = (parseInt(qty.value, 10) || 1) + 1; update(); });
    order.addEventListener('input', update);
    order.addEventListener('change', update);
    order.addEventListener('submit', update);
    update();
  }

  // Footer year
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
