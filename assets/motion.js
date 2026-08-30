/* ============================================================
   MICHAELFRANCOIS.NET — MOTION SYSTEM v3
   GSAP + ScrollTrigger + Lenis. Brutalist, deliberate, fast.
   Layers:
     - cube: CSS idle spin (resilient) + drag inertia, magnetic
       pull, scroll-linked rotation (own channel), click explosion
       from the clicked cell, gated light-show repertoire
     - page: masked stamp intro, line-aware split-text, distinct
       scroll reveal verbs, ghost parallax, GSAP-owned marquees
       with real velocity reaction, glitch hovers, custom cursor
   Gates: reduced-motion = calm; touch/small = lean;
          hidden tab / offscreen cube = idle.
   ============================================================ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DESKTOP = window.matchMedia('(pointer: fine)').matches && window.innerWidth > 1100;
  var hasGSAP = typeof window.gsap !== 'undefined';

  function go() { document.documentElement.classList.add('motion-go'); }

  /* ---------- util: split text into masked lines of chars ---------- */
  function splitChars(el) {
    if (el.dataset.split) return { chars: el.querySelectorAll('.ch'), lines: el.querySelectorAll('.ln') };
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    var lines = [];
    function splitRun(node) {
      var ln = document.createElement('span');
      ln.className = 'ln';
      ln.setAttribute('aria-hidden', 'true');
      node.textContent.split('').forEach(function (c) {
        var s = document.createElement('span');
        s.className = 'ch';
        s.textContent = c;
        ln.appendChild(s);
      });
      node.parentNode.replaceChild(ln, node);
      lines.push(ln);
    }
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3 && node.textContent.trim()) splitRun(node);
    });
    el.dataset.split = '1';
    return { chars: el.querySelectorAll('.ch'), lines: lines };
  }

  /* ============================================================
     CUBE
     ============================================================ */
  function initCube(scene) {
    var tilt = scene.querySelector('.cube-tilt');
    var cube = scene.querySelector('.cube');
    if (!cube || !tilt) return;

    var faces = scene.querySelectorAll('.face');
    var cellCount = parseInt(scene.getAttribute('data-cells') || '100', 10);
    var cols = Math.round(Math.sqrt(cellCount));
    faces.forEach(function (f) {
      for (var i = 0; i < cellCount; i++) f.appendChild(document.createElement('i'));
    });
    var cells = Array.prototype.slice.call(scene.querySelectorAll('.face i'));

    if (REDUCED) return; /* frozen, dignified (CSS poses it) */

    var PITCH = -13;
    /* four independent channels, summed — no system ever fights another */
    var state = { pitch: PITCH, yaw: 0, roll: 0 };   /* drag + settle */
    var scrollRot = { yaw: 0 };                       /* scroll scrub */
    var mag = { pitch: 0, roll: 0 };                  /* magnetic pull */
    var lean = { pitch: 0, roll: 0 };                 /* hover lean */
    var dragging = false, moved = false, hover = false, busy = false;
    var px = 0, py = 0, vx = 0, lastMoveT = 0;
    var inertiaTween = null, downCell = null;

    function applyTilt() {
      tilt.style.transform =
        'rotateX(' + (state.pitch + mag.pitch + lean.pitch) +
        'deg) rotateY(' + (state.yaw + scrollRot.yaw) +
        'deg) rotateZ(' + (state.roll + mag.roll + lean.roll) + 'deg)';
    }

    function glide(to, dur, ease) {
      if (!hasGSAP) {
        state.pitch = to.pitch !== undefined ? to.pitch : state.pitch;
        state.yaw = to.yaw !== undefined ? to.yaw : state.yaw;
        state.roll = to.roll !== undefined ? to.roll : state.roll;
        applyTilt(); return;
      }
      gsap.to(state, Object.assign({
        duration: dur || 0.6, ease: ease || 'power3.out',
        onUpdate: applyTilt, overwrite: 'auto'
      }, to));
    }

    /* ---- light shows: gated, non-re-entrant ---- */
    function lit(el, hold) {
      if (!el) return;
      el.classList.add('active');
      clearTimeout(el._lt);
      el._lt = setTimeout(function () { el.classList.remove('active'); }, hold);
    }
    function cellAt(f, x, y) { return f.children[y * cols + x]; }

    var shows = {
      sparkle: function () {
        var n = hover ? 4 : 2;
        for (var i = 0; i < n; i++) lit(cells[(Math.random() * cells.length) | 0], hover ? 420 : 700);
      },
      rain: function () {
        faces.forEach(function (f, fi) {
          var x = (Math.random() * cols) | 0;
          for (var y = 0; y < cols; y++) {
            (function (el, d) { setTimeout(function () { lit(el, 260); }, d); })(cellAt(f, x, y), y * 55 + fi * 90);
          }
        });
      },
      sweep: function () { /* light travels: tight wavefront, per-face phase */
        faces.forEach(function (f, fi) {
          for (var x = 0; x < cols; x++) {
            for (var y = 0; y < cols; y++) {
              (function (el, d) { setTimeout(function () { lit(el, 120); }, d); })(cellAt(f, x, y), x * 55 + fi * 140);
            }
          }
        });
      },
      ring: function () {
        faces.forEach(function (f, fi) {
          var cx = (cols / 2) | 0, cy = (cols / 2) | 0;
          for (var i = 0; i < f.children.length; i++) {
            var d = Math.max(Math.abs(i % cols - cx), Math.abs(((i / cols) | 0) - cy));
            (function (el, delay) { setTimeout(function () { lit(el, 180); }, delay); })(f.children[i], d * 70 + fi * 110);
          }
        });
      }
    };
    var showOrder = ['sparkle', 'sparkle', 'rain', 'sparkle', 'sweep', 'sparkle', 'ring'];
    var showIdx = 0;
    (function nextShow() {
      var name = showOrder[showIdx++ % showOrder.length];
      if (!busy && !document.hidden && scene.offsetWidth > 0) {
        var r = scene.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) shows[name]();
      }
      setTimeout(nextShow, name === 'sparkle' ? 900 : 2600);
    })();

    /* ---- explosion: wave answers the click ---- */
    function explode() {
      var ox, oy;
      if (downCell) {
        var idx = Array.prototype.indexOf.call(downCell.parentElement.children, downCell);
        ox = idx % cols; oy = (idx / cols) | 0;
      } else {
        ox = (Math.random() * cols) | 0; oy = (Math.random() * cols) | 0;
      }
      busy = true; /* ambient shows stand down during the burst */
      setTimeout(function () { busy = false; }, 1200);
      faces.forEach(function (f) {
        for (var i = 0; i < f.children.length; i++) {
          var d = Math.abs(i % cols - ox) + Math.abs(((i / cols) | 0) - oy);
          /* tight 3-ring shockwave — the purple object survives its own climax */
          (function (el, delay) { setTimeout(function () { lit(el, 130); }, delay); })(f.children[i], d * 40);
        }
      });
      /* single spin system: the CSS burst owns the revolution + scale punch */
      scene.classList.remove('cube-burst');
      void scene.offsetWidth;
      scene.classList.add('cube-burst');
    }

    /* ---- magnetic pull (desktop): own channel, unkillable ---- */
    var magX = null, magP = null;
    if (DESKTOP && hasGSAP) {
      magX = gsap.quickTo(mag, 'roll', { duration: 0.9, ease: 'power3.out', onUpdate: applyTilt });
      magP = gsap.quickTo(mag, 'pitch', { duration: 0.9, ease: 'power3.out', onUpdate: applyTilt });
      window.addEventListener('pointermove', function (e) {
        if (dragging || hover) return;
        var r = scene.getBoundingClientRect();
        if (r.width === 0) return;
        var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        var dx = (e.clientX - cx) / window.innerWidth;
        var dy = (e.clientY - cy) / window.innerHeight;
        var dist = Math.min(1, Math.hypot(dx, dy) * 2);
        var pull = 1 - dist;
        magX(dx * 14 * pull);
        magP(-dy * 18 * pull);
      }, { passive: true });
    }
    /* hover lean: quickTo on its own channel too */
    var leanP = hasGSAP ? gsap.quickTo(lean, 'pitch', { duration: 0.5, ease: 'power3.out', onUpdate: applyTilt }) : null;
    var leanR = hasGSAP ? gsap.quickTo(lean, 'roll', { duration: 0.5, ease: 'power3.out', onUpdate: applyTilt }) : null;

    /* ---- scroll-linked rotation: additive channel, never fights drag ---- */
    if (hasGSAP && window.ScrollTrigger) {
      gsap.to(scrollRot, {
        yaw: 180, ease: 'none', onUpdate: applyTilt,
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'max', scrub: 1.2 }
      });
    }

    /* ---- hover lean + drag with inertia ---- */
    scene.addEventListener('pointerenter', function () {
      hover = true; scene.classList.add('cube-hover');
      if (magX) { magX(0); magP(0); } /* hand off from magnet to lean */
    });
    scene.addEventListener('pointerleave', function () {
      hover = false; dragging = false;
      scene.classList.remove('cube-hover', 'cube-grab', 'cube-dragging');
      if (leanP) { leanP(0); leanR(0); }
      glide({ pitch: PITCH, roll: 0 }, 0.7, 'back.out(1.2)');
    });
    scene.addEventListener('pointermove', function (e) {
      if (dragging) {
        moved = true;
        var now = performance.now();
        var dxm = e.clientX - px;
        vx = dxm / Math.max(8, now - lastMoveT) * 16;
        lastMoveT = now;
        state.yaw += dxm * 0.45;
        state.pitch = Math.max(-60, Math.min(35, state.pitch - (e.clientY - py) * 0.3));
        px = e.clientX; py = e.clientY;
        applyTilt();
      } else if (hover && leanP) {
        var r = scene.getBoundingClientRect();
        var dx = (e.clientX - r.left) / r.width - 0.5;
        var dy = (e.clientY - r.top) / r.height - 0.5;
        leanP(-dy * 20);
        leanR(dx * 8);
      }
    });
    scene.addEventListener('pointerdown', function (e) {
      dragging = true; moved = false; vx = 0;
      downCell = e.target.tagName === 'I' ? e.target : null;
      px = e.clientX; py = e.clientY; lastMoveT = performance.now();
      if (leanP) { leanP(0); leanR(0); } /* drag owns the tilt */
      if (inertiaTween) inertiaTween.kill();
      scene.classList.add('cube-grab', 'cube-dragging');
      try { scene.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });
    scene.addEventListener('pointerup', function () {
      var wasTap = dragging && !moved;
      dragging = false;
      scene.classList.remove('cube-grab');
      if (wasTap) {
        scene.classList.remove('cube-dragging');
        explode();
      } else if (hasGSAP && Math.abs(vx) > 0.5) {
        var carry = Math.max(-40, Math.min(40, vx * 14));
        inertiaTween = gsap.to(state, {
          yaw: '+=' + carry, duration: 1.6, ease: 'power3.out',
          onUpdate: applyTilt,
          onComplete: function () { scene.classList.remove('cube-dragging'); }
        });
      } else {
        scene.classList.remove('cube-dragging');
      }
      glide({ pitch: PITCH, roll: 0 }, 0.7, 'back.out(1.2)');
    });

    /* ---- per-cell hover ripple ---- */
    scene.addEventListener('pointerover', function (e) {
      if (e.pointerType !== 'mouse' || dragging) return;
      var el = e.target;
      if (el.tagName !== 'I') return;
      var f = el.parentElement;
      var idx = Array.prototype.indexOf.call(f.children, el);
      var cx = idx % cols, cy = (idx / cols) | 0;
      for (var i = 0; i < f.children.length; i++) {
        var d = Math.abs(i % cols - cx) + Math.abs(((i / cols) | 0) - cy);
        if (d <= 2) {
          (function (el2, delay) { setTimeout(function () { lit(el2, 300); }, delay); })(f.children[i], d * 55);
        }
      }
    });

    applyTilt();
  }

  document.querySelectorAll('.scene').forEach(initCube);

  if (REDUCED) { go(); return; } /* everything below is motion */

  /* ============================================================
     SMOOTH SCROLL (desktop only)
     ============================================================ */
  if (DESKTOP && window.Lenis) {
    var lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1.0 });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
    }
    document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href').replace('/', '');
        var target = id.length > 1 && document.querySelector(id);
        if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -70 }); }
      });
    });
  }

  if (!hasGSAP) { go(); return; }
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ============================================================
     STAMP INTRO (fast, <1.2s; from-states set before reveal)
     ============================================================ */
  /* if the failsafe already revealed the page (slow load), never re-hide and replay */
  var late = document.documentElement.classList.contains('motion-go');
  var intro = gsap.timeline({ defaults: { ease: 'power4.out' }, paused: late });
  var heroH1 = document.querySelector('.hero-main h1');
  if (late) {
    intro.progress(1);
  } else if (heroH1) {
    var split = splitChars(heroH1);
    intro.from('header', { yPercent: -100, duration: 0.45, ease: 'power3.out' });
    /* each masked line gets its own downbeat — the surname lands second */
    Array.prototype.forEach.call(split.lines, function (ln, i) {
      intro.from(ln.querySelectorAll('.ch'), {
        yPercent: 120, duration: 0.55, stagger: 0.02, ease: 'back.out(1.4)'
      }, 0.15 + i * 0.13);
    });
    intro
      .from('.hero-main p, .hero-main .btn-row', { y: 26, autoAlpha: 0, duration: 0.5, stagger: 0.08 }, 0.55)
      .from('.hero-side .hero-cell', { xPercent: 12, autoAlpha: 0, duration: 0.5, stagger: 0.07 }, 0.4)
      .from('.scene', { scale: 0.55, autoAlpha: 0, duration: 0.7, ease: 'back.out(1.6)' }, 0.35);
  } else if (document.querySelector('.lost-row')) {
    /* 404: fours drop like stamps — hit, squash, recover */
    intro
      .from('header', { yPercent: -100, duration: 0.4 })
      .from('.four', { yPercent: -140, duration: 0.38, stagger: 0.12, ease: 'power2.in' }, 0.1)
      .to('.four', { scaleY: 0.9, transformOrigin: '50% 100%', duration: 0.08, stagger: 0.12, ease: 'power1.out' }, 0.48)
      .to('.four', { scaleY: 1, duration: 0.3, stagger: 0.12, ease: 'back.out(2.5)' }, 0.56)
      .from('.lost-row .scene', { scale: 0, duration: 0.6, ease: 'back.out(1.8)' }, 0.3)
      .from('.msg, .btn-row', { y: 24, autoAlpha: 0, duration: 0.45, stagger: 0.08 }, 0.6);
  } else {
    intro
      .from('header', { yPercent: -100, duration: 0.4 })
      .from('.case-hero h1', { yPercent: 40, autoAlpha: 0, duration: 0.55 }, 0.1)
      .from('.case-hero .sub, .case-hero .chip-row, .case-hero .btn-row', { y: 24, autoAlpha: 0, duration: 0.45, stagger: 0.08 }, 0.3);
  }
  go(); /* from-states are applied — reveal in the same task, no FOUC */

  /* ============================================================
     SCROLL CHOREOGRAPHY — three distinct verbs, not one fade
     ============================================================ */
  if (window.ScrollTrigger) {
    /* verb 1 — section titles: hard masked slide, no fade */
    document.querySelectorAll('.sec-head').forEach(function (head) {
      var title = head.querySelector('h2');
      if (!title) return;
      gsap.from(title, {
        yPercent: 110, duration: 0.55, ease: 'power4.out',
        scrollTrigger: { trigger: head, start: 'top 88%' }
      });
    });
    /* verb 2 — cards: clip wipe, top to bottom */
    var cards = document.querySelectorAll('.work-card');
    if (cards.length) {
      ScrollTrigger.batch(cards, {
        start: 'top 92%', once: true,
        onEnter: function (batch) {
          gsap.from(batch, {
            clipPath: 'inset(0 0 100% 0)', duration: 0.5,
            ease: 'power4.inOut', stagger: 0.08, clearProps: 'clipPath'
          });
        }
      });
    }
    /* verb 3 — chips: stepped snap-in, mechanical */
    var chips = document.querySelectorAll('.chips span');
    if (chips.length) {
      ScrollTrigger.batch(chips, {
        start: 'top 94%', once: true,
        onEnter: function (batch) {
          gsap.from(batch, { y: 14, duration: 0.35, ease: 'steps(3)', stagger: 0.04 });
        }
      });
    }
    /* soft rise for prose blocks */
    var points = document.querySelectorAll('.point');
    if (points.length) {
      ScrollTrigger.batch(points, {
        start: 'top 92%', once: true,
        onEnter: function (batch) {
          gsap.from(batch, { y: 28, autoAlpha: 0, duration: 0.55, stagger: 0.07, ease: 'power3.out' });
        }
      });
    }
    /* litmus cells rise — then their PASS stamps slam down, certification-style */
    var litmus = document.querySelectorAll('.litmus-cell');
    if (litmus.length) {
      ScrollTrigger.batch(litmus, {
        start: 'top 92%', once: true,
        onEnter: function (batch) {
          gsap.from(batch, { y: 30, autoAlpha: 0, duration: 0.55, stagger: 0.07, ease: 'power3.out' });
          var stamps = batch.map(function (c) { return c.querySelector('.stamp'); }).filter(Boolean);
          if (stamps.length) {
            /* settles at -2°: the imperfection sells the stamp */
            gsap.fromTo(stamps,
              { scale: 1.9, rotation: -8, autoAlpha: 0 },
              { scale: 1, rotation: -2, autoAlpha: 1, duration: 0.28,
                ease: 'power4.in', stagger: 0.14, transformOrigin: '50% 50%', delay: 0.45 });
          }
        }
      });
    }
    /* ghost words: slow parallax drift — additive to their base transform */
    document.querySelectorAll('.ghost').forEach(function (g) {
      var baseX = gsap.getProperty(g, 'xPercent');
      gsap.fromTo(g, { xPercent: baseX }, {
        xPercent: baseX + (g.style.right ? 6 : -6), yPercent: 12, ease: 'none',
        scrollTrigger: { trigger: g.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.4 }
      });
    });
    /* marquees: GSAP owns the loop; velocity spikes it, one decay tween settles it */
    document.querySelectorAll('.marquee-inner').forEach(function (m) {
      var rev = m.closest('.marquee').classList.contains('rev');
      m.style.animation = 'none'; /* retire the CSS fallback loop */
      var loop = rev
        ? gsap.fromTo(m, { xPercent: -50 }, { xPercent: 0, duration: 26, ease: 'none', repeat: -1 })
        : gsap.to(m, { xPercent: -50, duration: 26, ease: 'none', repeat: -1 });
      ScrollTrigger.create({
        onUpdate: function (self) {
          /* direction-aware: upward scroll briefly runs the tape backward */
          var v = Math.min(1, Math.abs(self.getVelocity()) / 1400);
          var speed = Math.max(Math.abs(loop.timeScale()), 1 + v * 2.2);
          loop.timeScale(speed * (self.direction < 0 ? -1 : 1));
          gsap.to(loop, { timeScale: 1, duration: 0.9, ease: 'power2.out', overwrite: true });
        }
      });
    });
  }

  /* ============================================================
     WORK GRID FILTER — animate what the inline handler toggled
     ============================================================ */
  document.querySelectorAll('.filters button').forEach(function (btn) {
    /* capture phase: hide the grid BEFORE the inline handler snaps the layout */
    btn.addEventListener('click', function () {
      var grid = document.querySelector('.work-grid');
      var h0 = grid ? grid.offsetHeight : 0;
      if (grid) gsap.set(grid, { autoAlpha: 0 });
      setTimeout(function () {
        if (grid) {
          gsap.set(grid, { autoAlpha: 1 });
          var h1 = grid.offsetHeight;
          if (h1 !== h0) {
            /* the reflow is a motion event, not a cut */
            gsap.fromTo(grid, { height: h0 }, {
              height: h1, duration: 0.3, ease: 'power3.inOut',
              clearProps: 'height',
              onComplete: function () { if (window.ScrollTrigger) ScrollTrigger.refresh(); }
            });
          } else if (window.ScrollTrigger) {
            ScrollTrigger.refresh();
          }
        }
        var visible = document.querySelectorAll('.work-card:not(.hidden)');
        if (!visible.length) return;
        gsap.from(visible, {
          autoAlpha: 0, y: 12, duration: 0.35, stagger: 0.05,
          ease: 'power3.out', clearProps: 'opacity,visibility,transform', overwrite: 'auto'
        });
      }, 0);
    }, true);
  });

  /* ============================================================
     GLITCH HOVER on headings
     ============================================================ */
  /* dwell-gated: transit across a heading never triggers it; armed after the intro */
  var glitchArmed = late;
  intro.eventCallback('onComplete', function () { glitchArmed = true; });
  document.querySelectorAll('.sec-head h2, .hero-main h1, .case-hero h1').forEach(function (el) {
    var dwell = null;
    el.addEventListener('pointerenter', function () {
      if (!glitchArmed || el.classList.contains('glitching')) return;
      dwell = setTimeout(function () {
        el.classList.add('glitching');
        setTimeout(function () { el.classList.remove('glitching'); }, 460);
      }, 90);
    });
    el.addEventListener('pointerleave', function () { clearTimeout(dwell); });
  });

  /* ============================================================
     CUSTOM CURSOR (desktop only)
     ============================================================ */
  if (DESKTOP) {
    document.documentElement.classList.add('has-cursor');
    var cur = document.createElement('div');
    cur.className = 'mf-cursor';
    cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<span class="mf-cursor-label">DRAG</span>';
    document.body.appendChild(cur);
    gsap.set(cur, { x: -100, y: -100 }); /* parked until first move */
    var cx = gsap.quickTo(cur, 'x', { duration: 0.18, ease: 'power3.out' });
    var cy = gsap.quickTo(cur, 'y', { duration: 0.18, ease: 'power3.out' });
    window.addEventListener('pointermove', function (e) {
      cur.classList.add('is-on');
      cx(e.clientX); cy(e.clientY);
      var t = e.target;
      var interactive = t.closest && t.closest('a, button, .filters button');
      var onCube = t.closest && t.closest('.scene');
      var onDark = t.closest && t.closest('.band-dark, .cell-dark, .hire-cell, .contact, .resume-btn, .home-btn');
      cur.classList.toggle('is-link', !!interactive && !onCube);
      cur.classList.toggle('is-cube', !!onCube);
      cur.classList.toggle('is-inverted', !!onDark);
    }, { passive: true });
    window.addEventListener('pointerdown', function () { cur.classList.add('is-down'); });
    window.addEventListener('pointerup', function () { cur.classList.remove('is-down'); });
    document.documentElement.addEventListener('mouseleave', function () { cur.classList.remove('is-on'); });
  }
})();
