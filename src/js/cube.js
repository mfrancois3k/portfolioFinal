export const initCube = () => {
  const cube = document.querySelector(".cube");
  const grids = document.querySelectorAll(".grid");
  const gridIntervals = new Map();

  const createGrid = (grid) => {
    for (let i = 0; i < 100; i++) {
      const span = document.createElement("span");
      
      span.addEventListener("mouseenter", () => {
        if (gridIntervals.has(grid)) {
          clearTimeout(gridIntervals.get(grid));
        }
        grid.querySelectorAll("span").forEach(s => s.classList.remove("active"));
        span.classList.add("active");
      });

      span.addEventListener("mouseleave", () => {
        span.classList.remove("active");
        randomInterval(grid);
      });

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

  grids.forEach((grid) => {
    createGrid(grid);
    randomInterval(grid);
  });

  document.addEventListener("mousemove", (e) => {
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    cube.style.transform = `rotateX(${y * 360}deg) rotateY(${x * 360}deg)`;
  });
};