// VKNKITS — content managed from /admin
//  - data/promos.json    : promo videos (the first visible one also plays in the big photo band)
//  - data/instagram.json : link to the Behold JSON feed for the latest Instagram posts
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getJSON(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(url + ' ' + r.status);
      return r.json();
    });
  }
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'className') n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  // Only allow site-relative paths or https links coming from the data files
  function safeUrl(u) {
    if (typeof u !== 'string' || !u) return '';
    u = u.trim();
    if (/^https:\/\//i.test(u)) return u;
    if (/^\/?[\w\-./]+$/.test(u) && u.indexOf('..') === -1) return u.charAt(0) === '/' ? u : '/' + u;
    return '';
  }

  var PLAY = '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5l12 7-12 7z"/></svg>';
  var PAUSE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>';

  // ---------- Promo videos ----------
  var promoSection = document.getElementById('promo');
  var promoRow = document.querySelector('[data-promos]');
  if (promoRow) {
    getJSON('/data/promos.json').then(function (data) {
      var list = ((data && data.videos) || []).filter(function (v) {
        return v && v.visible !== false && safeUrl(v.video);
      });
      if (!list.length) return;

      list.forEach(function (v, i) {
        var src = safeUrl(v.video), poster = safeUrl(v.apercu);
        var video = el('video', { playsinline: '', preload: 'metadata', src: src + '#t=0.1' });
        if (poster) video.setAttribute('poster', poster);
        video.controls = false;
        var play = el('button', { type: 'button', className: 'promo-play', 'aria-label': 'Play: ' + (v.titre || 'video') });
        play.innerHTML = PLAY;
        var card = el('figure', { className: 'promo-card' + (i === 0 ? ' is-new' : '') }, [
          el('div', { className: 'promo-media' }, [video, play]),
          el('figcaption', {}, [
            el('div', { className: 'anton promo-title', text: v.titre || '' }),
            v.texte ? el('p', { className: 'promo-text', text: v.texte }) : null
          ])
        ]);
        if (i === 0) card.querySelector('.promo-media').appendChild(el('span', { className: 'promo-badge cap', text: 'New' }));
        play.addEventListener('click', function () {
          // one video with sound at a time
          promoRow.querySelectorAll('video').forEach(function (o) { if (o !== video) o.pause(); });
          video.controls = true;
          video.muted = false;
          video.play();
          card.classList.add('is-playing');
        });
        video.addEventListener('pause', function () { if (video.ended) card.classList.remove('is-playing'); });
        promoRow.appendChild(card);
      });
      promoSection.hidden = false;

      // The first promo also plays silently in the big photo band
      var film = document.querySelector('[data-film-video]');
      var toggle = document.querySelector('[data-film-toggle]');
      if (film && !reduceMotion) {
        film.src = safeUrl(list[0].video);
        film.hidden = false;
        film.autoplay = true;
        film.addEventListener('error', function () { film.hidden = true; if (toggle) toggle.hidden = true; });
        film.play().catch(function () {});
        if (toggle) {
          toggle.hidden = false;
          toggle.addEventListener('click', function () {
            if (film.paused) { film.play(); toggle.setAttribute('aria-label', 'Pause video'); toggle.innerHTML = PAUSE; }
            else { film.pause(); toggle.setAttribute('aria-label', 'Play video'); toggle.innerHTML = PLAY.replace(/28/g, '18'); }
          });
        }
      }
    }).catch(function () { /* no promos yet: section stays hidden */ });
  }

  // ---------- Instagram feed (Behold JSON) ----------
  var ig = document.querySelector('[data-ig]');
  if (ig) {
    getJSON('/data/instagram.json').then(function (cfg) {
      var feed = safeUrl(cfg && cfg.feed_url);
      if (!feed || feed.charAt(0) === '/') return null;
      var max = Math.min(12, Math.max(4, parseInt(cfg.nombre, 10) || 8));
      return getJSON(feed).then(function (data) {
        var posts = Array.isArray(data) ? data : (data && data.posts) || [];
        posts = posts.slice(0, max);
        if (!posts.length) return;
        var frag = document.createDocumentFragment();
        posts.forEach(function (p) {
          var sizes = p.sizes || {};
          var img = (sizes.medium && sizes.medium.mediaUrl) || (sizes.small && sizes.small.mediaUrl) ||
            (p.mediaType === 'VIDEO' ? p.thumbnailUrl : p.mediaUrl) || p.thumbnailUrl;
          var href = safeUrl(p.permalink) || 'https://www.instagram.com/vknkits/';
          img = safeUrl(img);
          if (!img) return;
          var caption = (p.prunedCaption || p.caption || 'Post Instagram de @vknkits').slice(0, 140);
          var a = el('a', { href: href, target: '_blank', rel: 'noopener', className: 'ig-post', 'aria-label': caption }, [
            el('img', { src: img, alt: caption, loading: 'lazy' })
          ]);
          if (p.mediaType === 'VIDEO') a.appendChild(el('span', { className: 'ig-kind', 'aria-hidden': 'true', text: '▶' }));
          if (p.mediaType === 'CAROUSEL_ALBUM') a.appendChild(el('span', { className: 'ig-kind', 'aria-hidden': 'true', text: '❐' }));
          frag.appendChild(a);
        });
        if (!frag.childNodes.length) return;
        ig.innerHTML = '';
        ig.appendChild(frag);
        ig.classList.add('is-live');
      });
    }).catch(function () { /* keep the static photos */ });
  }
})();
