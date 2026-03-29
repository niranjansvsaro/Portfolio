/**
 * Moving Stars & Red Nebula Background
 */
(function () {
  "use strict";

  const container = document.getElementById("starfield");
  if (!container) return;

  // Ensure the starfield is fixed to the viewport and behind everything
  container.style.cssText = "position: fixed; inset: 0; width: 100vw; height: 100vh; z-index: -1; pointer-events: none; background: #050000; overflow: hidden;";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    container.style.background = "radial-gradient(ellipse at 50% 50%, #1a0202 0%, #050000 100%)";
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d", { alpha: false });
  let w = window.innerWidth;
  let h = window.innerHeight;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  // Stars for 3D field
  const numStars = 3000;
  const stars = [];
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: (Math.random() - 0.5) * 10000,
      y: (Math.random() - 0.5) * 10000,
      z: Math.random() * 2000,
      size: 0.5 + Math.random() * 1.5,
      color: Math.random() > 0.85 ? '#ffaaaa' : '#ffffff' // Occasional red tint stars
    });
  }

  // Deep red nebula clouds
  const nebulas = [];
  for (let i = 0; i < 7; i++) {
    nebulas.push({
      x: Math.random() * w,
      y: Math.random() * h,
      radius: 350 + Math.random() * 500, // Massive clouds
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      alpha: 0.1 + Math.random() * 0.15
    });
  }

  function render() {
    // Fill deep space
    ctx.fillStyle = "#050002";
    ctx.fillRect(0, 0, w, h);

    // Render slow moving glowing red nebula
    ctx.globalCompositeOperation = "screen";
    for (let neb of nebulas) {
      neb.x += neb.vx;
      neb.y += neb.vy;

      // Wrapping softly out of bounds
      if (neb.x < -neb.radius) neb.x = w + neb.radius;
      if (neb.x > w + neb.radius) neb.x = -neb.radius;
      if (neb.y < -neb.radius) neb.y = h + neb.radius;
      if (neb.y > h + neb.radius) neb.y = -neb.radius;

      const grad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius);
      grad.addColorStop(0, `rgba(200, 20, 30, ${neb.alpha})`); // Bright deep crimson core
      grad.addColorStop(0.5, `rgba(80, 5, 10, ${neb.alpha * 0.4})`);
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(neb.x, neb.y, neb.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render flying 3D starfield
    const cx = w / 2;
    const cy = h / 2;
    const fov = 400;

    for (let s of stars) {
      // Pull stars towards camera
      s.z -= 1.2; 
      
      // Respawn perfectly in the distance
      if (s.z <= 1) {
        s.z = 2000;
        s.x = (Math.random() - 0.5) * 10000;
        s.y = (Math.random() - 0.5) * 10000;
        continue;
      }

      // Calculate 3D to 2D screen projection
      const projX = cx + (s.x / s.z) * fov;
      const projY = cy + (s.y / s.z) * fov;

      // Ignore rendering if off-screen
      if (projX < 0 || projX > w || projY < 0 || projY > h) continue;

      // Draw star
      const radius = (1 - s.z / 2000) * s.size * 2.2; 
      const alpha = 1 - (s.z / 2000); 

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = s.color;
      ctx.globalAlpha = Math.max(0, alpha);
      
      // Bright stars glow in space
      if (radius > 1.4) {
         ctx.shadowBlur = 6;
         ctx.shadowColor = s.color;
      } else {
         ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.arc(projX, projY, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Clean up rendering state
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
