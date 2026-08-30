/* Interactive cube v2 — CSS-animation idle spin (resilient), timer-driven cell effects,
   transition-based hover tilt, click burst, drag with pause/resume. No rAF dependency. */
(function () {
  'use strict';

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
    var cells = scene.querySelectorAll('.face i');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var PITCH = -13;
    var dragging = false, moved = false, hover = false;
    var dragYaw = 0, dragPitch = PITCH, px = 0, py = 0;

    function flash(el, hold) {
      if (!el) return;
      el.classList.add('active');
      setTimeout(function () { el.classList.remove('active'); }, hold);
    }

    /* ambient flashes — quicker when hovered */
    setInterval(function () {
      var n = hover ? 4 : 2;
      for (var i = 0; i < n; i++) {
        flash(cells[Math.floor(Math.random() * cells.length)], hover ? 420 : 700);
      }
    }, 210);

    /* radial wave across every face */
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

    function setTilt(pitch, yaw, roll) {
      tilt.style.transform =
        'rotateX(' + pitch + 'deg) rotateY(' + (yaw || 0) + 'deg) rotateZ(' + (roll || 0) + 'deg)';
    }

    scene.addEventListener('pointerenter', function () {
      hover = true;
      scene.classList.add('cube-hover');
    });

    scene.addEventListener('pointerleave', function () {
      hover = false; dragging = false;
      scene.classList.remove('cube-hover', 'cube-grab', 'cube-dragging');
      setTilt(PITCH, dragYaw, 0);
    });

    scene.addEventListener('pointermove', function (e) {
      if (dragging) {
        moved = true;
        dragYaw += (e.clientX - px) * 0.45;
        dragPitch = Math.max(-55, Math.min(30, dragPitch - (e.clientY - py) * 0.3));
        px = e.clientX; py = e.clientY;
        setTilt(dragPitch, dragYaw, 0);
      } else {
        var r = scene.getBoundingClientRect();
        var dx = (e.clientX - r.left) / r.width - 0.5;
        var dy = (e.clientY - r.top) / r.height - 0.5;
        /* cursor-follow lean — smoothed by the CSS transition on .cube-tilt */
        setTilt(PITCH - dy * 20, dragYaw, dx * 7);
      }
    });

    scene.addEventListener('pointerdown', function (e) {
      dragging = true; moved = false;
      px = e.clientX; py = e.clientY;
      scene.classList.add('cube-grab', 'cube-dragging'); /* pauses the CSS spin */
      try { scene.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });

    scene.addEventListener('pointerup', function () {
      var wasTap = dragging && !moved;
      dragging = false;
      scene.classList.remove('cube-grab', 'cube-dragging'); /* spin resumes where it paused */
      if (wasTap) {
        /* burst: fast extra revolution + scale pop on the outer wrapper, wave on the cells */
        scene.classList.remove('cube-burst');
        void scene.offsetWidth;
        scene.classList.add('cube-burst');
        wave();
      }
      setTilt(PITCH, dragYaw, 0);
      dragPitch = PITCH;
    });

    /* per-cell hover ripple (mouse only) */
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
