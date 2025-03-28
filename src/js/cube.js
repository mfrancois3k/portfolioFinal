export const initCube = () => {
  const cube = document.querySelector(".cube");
  const scene = document.querySelector(".scene");
  const faces = document.querySelectorAll(".face");
  const grids = document.querySelectorAll(".grid");
  const gridIntervals = new Map();
  let isHovering = false;
  let rotationInterval;
  let rotationAngle = 0;

  const createGrid = (grid) => {
    for (let i = 0; i < 100; i++) {
      const span = document.createElement("span");
      grid.appendChild(span);
    }
  };

  const addRandomActiveClass = (grid) => {
    const spans = grid.querySelectorAll("span");
    const randomIndex = Math.floor(Math.random() * spans.length);
    spans[randomIndex].classList.add("active");

    setTimeout(() => {
      spans[randomIndex].classList.remove("active");
    }, Math.floor(Math.random() * 1000) + 500);
  };

  const randomInterval = (grid) => {
    const interval = Math.floor(Math.random() * 200) + 100;
    addRandomActiveClass(grid);
    const timeoutId = setTimeout(() => randomInterval(grid), interval);
    gridIntervals.set(grid, timeoutId);
  };

  const startAutoRotation = () => {
    stopAutoRotation();
    rotationInterval = setInterval(() => {
      rotationAngle += 1;
      cube.style.transform = `rotateY(${rotationAngle}deg) rotateX(${rotationAngle}deg)`;
    }, 25);
  };

  const stopAutoRotation = () => {
    if (rotationInterval) {
      clearInterval(rotationInterval);
    }
  };

  scene.addEventListener("mouseenter", () => {
    isHovering = true;
    stopAutoRotation();
    cube.style.transform = `scale(1.2)`;
    cube.style.boxShadow = "0 0 20px rgba(249, 248, 113, 0.5)";
  });

  scene.addEventListener("mouseleave", () => {
    isHovering = false;
    cube.style.transform = `scale(1)`;
    cube.style.boxShadow = "none";
    rotationAngle = 0;
    startAutoRotation();
  });

  scene.addEventListener("mousemove", (e) => {
    if (isHovering) {
      const rect = scene.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const x = (e.clientX - centerX) / (rect.width / 2);
      const y = (e.clientY - centerY) / (rect.height / 2);

      cube.style.transform = `rotateX(${-y * 45}deg) rotateY(${x * 45}deg) scale(1.2)`;
    }
  });

  grids.forEach((grid) => {
    createGrid(grid);
    randomInterval(grid);
  });

  startAutoRotation();

  return () => {
    stopAutoRotation();
    grids.forEach((grid) => {
      if (gridIntervals.has(grid)) {
        clearTimeout(gridIntervals.get(grid));
      }
    });
  };
};
