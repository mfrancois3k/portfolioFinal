/* Interactive cube — idle drift, cursor-follow tilt, cell ripples, click burst, drag with momentum. */
(function () {
  'use strict';

  function initCube(scene) {
    var cube = scene.querySelector('.cube');
    if (!cube) return;
    var faces = scene.querySelectorAll('.face');
    var cellCount = parseInt(scene.getAttribute('data-cells') || '100', 10);
    var cols = Math.round(Math.sqrt(cellCount));

    faces.forEach(function (f) {
      for (var i = 0; i < cellCount; i++) f.appendChild(document.createElement('i'));
    });
    var cells = scene.querySelectorAll('.face i');

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      cube.style.transform = 'rotateX(-14deg) rotateY(24deg)';
      return;
    }

    /* ---- state ---- */
    var baseX = -13;          // resting pitch
    var rotY = 0;             // accumulated yaw
    var drift = 0.14;         // idle deg/frame at 60fps
    var boost = 0;            // click impulse, decays
    var momentum = 0;         // drag release velocity, decays
    var tiltX = 0, tiltY = 0; // cursor-follow tilt (lerped)
    var tTiltX = 0, tTiltY = 0;
    var hover = false, dragging = false, moved = false;
    var px = 0, py = 0, lastT = 0;

    function frame(t) {
      var dt = Math.min(48, t - lastT) || 16; lastT = t;
      var k = dt / 16;
      rotY += (drift + boost + momentum) * k;
      boost *= Math.pow(0.94, k);
      momentum *= Math.pow(0.95, k);
      tiltX += (tTiltX - tiltX) * 0.085;
      tiltY += (tTiltY - tiltY) * 0.085;
      cube.style.transform =
        'rotateX(' + (baseX + tiltX) + 'deg) rotateY(' + (rotY + tiltY) + 'deg)';
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    /* ---- ambient flashes (quicken on hover) ---- */
    setInterval(function () {
      var n = hover ? 4 : 2;
      for (var i = 0; i < n; i++) {
        flash(cells[Math.floor(Math.random() * cells.length)], hover ? 420 : 700);
      }
    }, 210);

    function flash(el, hold) {
      if (!el) return;
      el.classList.add('active');
      setTimeout(function () { el.classList.remove('active'); }, hold);
    }

    /* ---- radial wave across every face ---- */
    function wave() {
      faces.forEach(function (f) {
        var kids = f.children;
        var origin = Math.floor(Math.random() * kids.length);
        var ox = origin % cols, oy = Math.floor(origin / cols);
        for (var i = 0; i < kids.length; i++) {
          var d = Math.abs(i % cols - ox) + Math.abs(Math.floor(i / cols) - oy);
          (function (el, delay) {
            setTimeout(function () { flash(el, 240); }, delay);
          })(kids[i], d * 42);
        }
      });
    }

    /* ---- pointer interactions ---- */
    scene.addEventListener('pointerenter', function () {
      hover = true;
      scene.classList.add('cube-hover');
    });

    scene.addEventListener('pointerleave', function () {
      hover = false; dragging = false;
      tTiltX = 0; tTiltY = 0;
      scene.classList.remove('cube-hover', 'cube-grab');
    });

    scene.addEventListener('pointermove', function (e) {
      var r = scene.getBoundingClientRect();
      if (dragging) {
        moved = true;
        momentum = 0;
        rotY += (e.clientX - px) * 0.45;
        tTiltX = Math.max(-35, Math.min(35, tTiltX - (e.clientY - py) * 0.25));
        px = e.clientX; py = e.clientY;
      } else {
        var dx = (e.clientX - r.left) / r.width - 0.5;
        var dy = (e.clientY - r.top) / r.height - 0.5;
        tTiltY = dx * 26;
        tTiltX = -dy * 22;
      }
    });

    scene.addEventListener('pointerdown', function (e) {
      dragging = true; moved = false;
      px = e.clientX; py = e.clientY;
      scene.classList.add('cube-grab');
      try { scene.setPointerCapture(e.pointerId); } catch (err) {}
    });

    scene.addEventListener('pointerup', function (e) {
      if (dragging && moved) {
        momentum = Math.max(-10, Math.min(10, (e.clientX - px) * 0.4));
      } else if (dragging) {
        /* clean tap/click: burst */
        boost += 13;
        scene.classList.remove('cube-pulse');
        void scene.offsetWidth;
        scene.classList.add('cube-pulse');
        wave();
      }
      dragging = false;
      tTiltX = 0; tTiltY = 0;
      scene.classList.remove('cube-grab');
    });

    /* ---- per-cell hover ripple (mouse only) ---- */
    scene.addEventListener('pointerover', function (e) {
      if (e.pointerType !== 'mouse' || dragging) return;
      var el = e.target;
      if (el.tagName !== 'I') return;
      var f = el.parentElement;
      var idx = Array.prototype.indexOf.call(f.children, el);
      var cx = idx % cols, cy = Math.floor(idx / cols);
      for (var i = 0; i < f.children.length; i++) {
        var d = Math.abs(i % cols - cx) + Math.abs(Math.floor(i / cols) - cy);
        if (d <= 2) {
          (function (el2, delay) {
            setTimeout(function () { flash(el2, 300); }, delay);
          })(f.children[i], d * 55);
        }
      }
    });
  }

  document.querySelectorAll('.scene').forEach(initCube);
})();
