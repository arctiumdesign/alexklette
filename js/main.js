// Arctium Gartenpflege – Interaktionen
(function () {
  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobiles Menü ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Header-Linie beim Scrollen ---------- */
  var header = document.querySelector('.site-header');
  var onScroll = function () { if (header) header.classList.toggle('scrolled', window.scrollY > 10); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Jahr im Footer ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Sanftes Einblenden ---------- */
  var items = document.querySelectorAll('.steps li, .section-head, .about > div, .contact > div, .bird-grid > div');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    items.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 3) * 80 + 'ms';
      io.observe(el);
    });
  }

  /* =========================================================
     JAHRESZEITEN
     ========================================================= */
  var month = new Date().getMonth(); // 0 = Januar
  function seasonFromMonth(m) {
    return m >= 2 && m <= 4 ? 'fruehling' : m >= 5 && m <= 7 ? 'sommer' : m >= 8 && m <= 10 ? 'herbst' : 'winter';
  }
  var realSeason = seasonFromMonth(month);
  var periods = document.querySelectorAll('.period');
  var birdSection = document.getElementById('vogelschutz');
  var serviceSection = document.getElementById('leistungen');

  // Seite folgt der echten Jahreszeit; die Schalter wirken nur auf ihren Abschnitt.
  root.setAttribute('data-season', realSeason);

  function markButtons(target, s) {
    document.querySelectorAll('.season-switch[data-for="' + target + '"] [data-set-season]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-set-season') === s ? 'true' : 'false');
    });
  }

  function setServiceSeason(s) {
    if (serviceSection) serviceSection.setAttribute('data-season', s);
    markButtons('leistungen', s);
  }

  function setSeason(s) {
    if (birdSection) birdSection.setAttribute('data-season', s);
    markButtons('vogelschutz', s);

    // Vogelschutz: aktuellen Zeitraum markieren
    var brut = s === realSeason ? (month >= 2 && month <= 8) : (s === 'fruehling' || s === 'sommer');
    periods.forEach(function (p) {
      p.classList.toggle('current', p.getAttribute('data-period') === (brut ? 'brut' : 'schnitt'));
    });

    fx.start(s);
  }

  document.querySelectorAll('.season-switch[data-for] [data-set-season]').forEach(function (b) {
    b.addEventListener('click', function () {
      var s = b.getAttribute('data-set-season');
      if (b.closest('.season-switch').getAttribute('data-for') === 'leistungen') setServiceSeason(s);
      else setSeason(s);
    });
  });

  /* ---------- Partikel (Blüten, Pollen, Blätter, Schnee) ---------- */
  var fx = (function () {
    var canvas = document.querySelector('.season-fx');
    if (!canvas || reduceMotion || !canvas.getContext) return { start: function () {} };
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, dpr = 1, parts = [], season = null, raf = null, last = 0;

    var cfg = {
      fruehling: { n: 20, colors: ['#f6d3dc', '#fbe7ec', '#ffffff', '#f2c1cf'], size: [4, 7], vy: [18, 34], kind: 'petal' },
      sommer:    { n: 26, colors: ['rgba(222,178,64,.55)', 'rgba(240,206,110,.5)', 'rgba(255,255,255,.7)'], size: [1.4, 3], vy: [-10, -22], kind: 'mote' },
      herbst:    { n: 16, colors: ['#b5441f', '#c8622a', '#d98b2e', '#9c3a1c', '#c9a03a'], size: [9, 15], vy: [30, 55], kind: 'leaf' },
      winter:    { n: 70, colors: ['#ffffff'], size: [1.5, 3.8], vy: [22, 48], kind: 'snow' }
    };
    function rnd(a, b) { return a + Math.random() * (b - a); }

    var host = canvas.parentElement, visible = true;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = host.clientWidth; H = host.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function make(c, anywhere) {
      var up = c.vy[0] < 0;
      return {
        x: rnd(0, W),
        y: anywhere ? rnd(0, H) : (up ? H + 10 : -20),
        s: rnd(c.size[0], c.size[1]),
        vy: rnd(c.vy[0], c.vy[1]),
        sway: rnd(10, 40), phase: rnd(0, Math.PI * 2), freq: rnd(.4, 1.1),
        rot: rnd(0, Math.PI * 2), vr: rnd(-1.2, 1.2),
        color: c.colors[Math.floor(Math.random() * c.colors.length)]
      };
    }

    function draw(p, kind, t) {
      ctx.save();
      ctx.translate(p.x + Math.sin(t * p.freq + p.phase) * p.sway, p.y);
      if (kind === 'snow') {
        ctx.beginPath(); ctx.arc(0, 0, p.s, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.fill();
        ctx.lineWidth = .8; ctx.strokeStyle = 'rgba(90,120,140,.28)'; ctx.stroke();
      } else if (kind === 'mote') {
        ctx.globalAlpha = .6 + .4 * Math.sin(t * 2 + p.phase);
        ctx.beginPath(); ctx.arc(0, 0, p.s, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.fill();
      } else if (kind === 'petal') {
        ctx.rotate(p.rot);
        ctx.scale(1, .55 + .45 * Math.cos(t * 1.5 + p.phase));
        ctx.beginPath();
        ctx.moveTo(0, -p.s);
        ctx.bezierCurveTo(p.s, -p.s * .6, p.s * .7, p.s * .8, 0, p.s);
        ctx.bezierCurveTo(-p.s * .7, p.s * .8, -p.s, -p.s * .6, 0, -p.s);
        ctx.fillStyle = p.color; ctx.fill();
        ctx.lineWidth = .6; ctx.strokeStyle = 'rgba(190,120,140,.35)'; ctx.stroke();
      } else { // leaf
        ctx.rotate(p.rot);
        ctx.scale(Math.cos(t * 1.2 + p.phase), 1);
        var s = p.s;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.quadraticCurveTo(s * .75, -s * .2, 0, s);
        ctx.quadraticCurveTo(-s * .75, -s * .2, 0, -s);
        ctx.fillStyle = p.color; ctx.globalAlpha = .9; ctx.fill();
        ctx.globalAlpha = .5;
        ctx.beginPath(); ctx.moveTo(0, -s * .8); ctx.lineTo(0, s * 1.25);
        ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(70,30,10,.6)'; ctx.stroke();
      }
      ctx.restore();
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      var dt = Math.min((now - last) / 1000, .05); last = now;
      var c = cfg[season], t = now / 1000;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.y += p.vy * dt; p.rot += p.vr * dt;
        if (p.vy > 0 && p.y > H + 30) parts[i] = make(c, false);
        else if (p.vy < 0 && p.y < -30) parts[i] = make(c, false);
        draw(parts[i], c.kind, t);
      }
    }

    function start(s) {
      season = s;
      var c = cfg[s];
      var n = Math.round(c.n * (W < 700 ? .5 : .8) * Math.max(H / 800, .6));
      parts = [];
      for (var i = 0; i < n; i++) parts.push(make(c, true));
      if (!raf && !document.hidden && visible) { last = performance.now(); raf = requestAnimationFrame(frame); }
    }
    // nur animieren, wenn der Abschnitt sichtbar ist
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (!visible) { cancelAnimationFrame(raf); raf = null; }
        else if (season && !raf && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); }
      }).observe(host);
    }

    resize();
    window.addEventListener('resize', function () {
      var oldW = W; resize();
      if (season && Math.abs(W - oldW) > 50) start(season); // nicht bei Mobil-Adressleiste neu starten
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
      else if (season && !raf && visible) { last = performance.now(); raf = requestAnimationFrame(frame); }
    });
    return { start: start };
  })();

  setServiceSeason(realSeason);
  setSeason(realSeason);
})();
