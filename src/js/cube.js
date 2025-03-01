export const initCube = () => {
  const cube = document.querySelector(".cube");
  const scene = document.querySelector(".scene");
  const grids = document.querySelectorAll(".grid");
  const gridIntervals = new Map();
  
  // Rotation state variables
  let isAutoRotating = true;
  let autoRotateAngle = 0;
  let currentRotationX = 0;
  let currentRotationY = 0;
  
  // Get window width for responsive rotation speed
  let windowWidth = window.innerWidth;
  
  // Rotation speed configuration based on screen size
  const getRotationConfig = () => {
    if (windowWidth <= 480) { // Mobile
      return {
        rotationSpeed: 0.3,
        maxRotation: 15,
        sensitivity: 0.3
      };
    } else if (windowWidth <= 768) { // Tablet
      return {
        rotationSpeed: 0.4,
        maxRotation: 20,
        sensitivity: 0.4
      };
    } else { // Desktop
      return {
        rotationSpeed: 0.5,
        maxRotation: 25,
        sensitivity: 0.5
      };
    }
  };

  // Update rotation config on window resize
  window.addEventListener('resize', () => {
    windowWidth = window.innerWidth;
  });

  // Touch variables
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let rotX = 0;
  let rotY = 0;
  let lastRotX = 0;
  let lastRotY = 0;

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

  const autoRotate = () => {
    if (!isAutoRotating) return;
    
    const config = getRotationConfig();
    
    autoRotateAngle += config.rotationSpeed;
    currentRotationY = autoRotateAngle;
    currentRotationX = Math.sin(autoRotateAngle * 0.01) * config.maxRotation;
    
    cube.style.transform = `rotateX(${currentRotationX}deg) rotateY(${currentRotationY}deg)`;
  };

  const updateCubeRotation = () => {
    if (isDragging) return;
    
    if (isAutoRotating) {
      autoRotate();
    }
    
    requestAnimationFrame(updateCubeRotation);
  };

  // Touch event handlers
  const handleTouchStart = (e) => {
    isDragging = true;
    isAutoRotating = false;
    scene.classList.add("hovered");
    
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    
    const transform = cube.style.transform;
    const matches = transform.match(/rotateX\(([-\d.]+)deg\) rotateY\(([-\d.]+)deg\)/);
    if (matches) {
      lastRotX = parseFloat(matches[1]) || 0;
      lastRotY = parseFloat(matches[2]) || 0;
    }
    
    e.preventDefault();
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const config = getRotationConfig();
    const touch = e.touches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    
    rotX = lastRotX + (deltaY * config.sensitivity);
    rotY = lastRotY + (deltaX * config.sensitivity);
    
    cube.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    isDragging = false;
    scene.classList.remove("hovered");
    isAutoRotating = true;
    
    // Store the final rotation values
    lastRotX = rotX;
    lastRotY = rotY;
    
    // Update current rotation to match the final touch position
    currentRotationX = rotX;
    currentRotationY = rotY;
    autoRotateAngle = rotY; // Sync auto-rotation angle with current position
  };

  // Initialize grids
  grids.forEach((grid) => {
    createGrid(grid);
    randomInterval(grid);
  });

  // Mouse event handlers
  scene.addEventListener("mouseenter", () => {
    isAutoRotating = false;
    scene.classList.add("hovered");
  });

  scene.addEventListener("mouseleave", () => {
    isAutoRotating = true;
    scene.classList.remove("hovered");
    
    // Sync auto-rotation angle with current position
    autoRotateAngle = currentRotationY;
  });

  scene.addEventListener("mousemove", (e) => {
    if (!isAutoRotating && scene.classList.contains("hovered")) {
      const config = getRotationConfig();
      const rect = scene.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      
      currentRotationX = y * (180 * config.sensitivity);
      currentRotationY = x * (180 * config.sensitivity);
      
      cube.style.transform = `rotateX(${currentRotationX}deg) rotateY(${currentRotationY}deg)`;
    }
  });

  // Add touch event listeners
  scene.addEventListener("touchstart", handleTouchStart, { passive: false });
  scene.addEventListener("touchmove", handleTouchMove, { passive: false });
  scene.addEventListener("touchend", handleTouchEnd);
  scene.addEventListener("touchcancel", handleTouchEnd);

  // Start the animation loop
  updateCubeRotation();
};
