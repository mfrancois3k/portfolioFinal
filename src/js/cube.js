// export const initCube = () => {
//   const cube = document.querySelector(".cube");
//   const grids = document.querySelectorAll(".grid");
//   const gridIntervals = new Map();

//   const createGrid = (grid) => {
//     for (let i = 0; i < 100; i++) {
//       const span = document.createElement("span");
      
//       span.addEventListener("mouseenter", () => {
//         if (gridIntervals.has(grid)) {
//           clearTimeout(gridIntervals.get(grid));
//         }
//         grid.querySelectorAll("span").forEach(s => s.classList.remove("active"));
//         span.classList.add("active");
//       });

//       span.addEventListener("mouseleave", () => {
//         span.classList.remove("active");
//         randomInterval(grid);
//       });

//       grid.appendChild(span);
//     }
//   };

//   const addRandomActiveClass = (grid) => {
//     const spans = grid.querySelectorAll("span");
//     const randomIndex = Math.floor(Math.random() * spans.length);
//     spans[randomIndex].classList.add("active");
    
//     setTimeout(() => {
//       spans[randomIndex].classList.remove("active");
//     }, Math.floor(Math.random() * 1000) + 500);
//   };

//   const randomInterval = (grid) => {
//     const interval = Math.floor(Math.random() * 200) + 100;
//     addRandomActiveClass(grid);
//     const timeoutId = setTimeout(() => randomInterval(grid), interval);
//     gridIntervals.set(grid, timeoutId);
//   };

//   grids.forEach((grid) => {
//     createGrid(grid);
//     randomInterval(grid);
//   });

//   document.addEventListener("mousemove", (e) => {
//     const x = e.clientX / window.innerWidth - 0.5;
//     const y = e.clientY / window.innerHeight - 0.5;
//     cube.style.transform = `rotateX(${y * 360}deg) rotateY(${x * 360}deg)`;
//   });
// };

import { gsap } from 'gsap';

export const initCube = () => {
  const cube = document.querySelector(".cube");
  const scene = document.querySelector(".scene");
  const faces = document.querySelectorAll(".face");
  const grids = document.querySelectorAll(".grid");
  const gridIntervals = new Map();
  let isHovering = false;
  let autoRotateAnimation;

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

  // Start auto-rotation animation
  const startAutoRotate = () => {
    let time = 0;
    
    autoRotateAnimation = () => {
      if (!isHovering) {
        time += 0.005;
        const x = Math.sin(time) * 0.5;
        const y = Math.cos(time) * 0.3;
        
        // Add a gentle hover effect
        const hoverY = Math.sin(time * 2) * 10;
        
        cube.style.transform = `rotateX(${y * 360}deg) rotateY(${x * 360}deg) translateY(${hoverY}px)`;
      }
      requestAnimationFrame(autoRotateAnimation);
    };
    
    requestAnimationFrame(autoRotateAnimation);
  };

  // Reset all face highlights
  const resetFaceHighlights = () => {
    faces.forEach(face => {
      face.classList.remove('highlight-face');
    });
  };

  // Determine which face to highlight based on cursor position
  const highlightFaceFromCursor = (e) => {
    if (!isHovering) return;
    
    // Get cursor position relative to the scene
    const rect = scene.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the scene
    const y = e.clientY - rect.top;  // y position within the scene
    
    // Calculate relative position (0 to 1)
    const relX = x / rect.width;
    const relY = y / rect.height;
    
    // Reset all highlights
    resetFaceHighlights();
    
    // Determine which face to highlight based on cursor position
    // This is a simplified approach - in a real 3D space this would be more complex
    if (relY < 0.33) {
      // Top third of the scene
      document.querySelector('.face.top').classList.add('highlight-face');
    } else if (relY > 0.66) {
      // Bottom third of the scene
      document.querySelector('.face.bottom').classList.add('highlight-face');
    } else if (relX < 0.33) {
      // Left third of the scene
      document.querySelector('.face.left').classList.add('highlight-face');
    } else if (relX > 0.66) {
      // Right third of the scene
      document.querySelector('.face.right').classList.add('highlight-face');
    } else if (relX > 0.33 && relX < 0.66 && relY > 0.33 && relY < 0.66) {
      // Center of the scene - front face
      document.querySelector('.face.front').classList.add('highlight-face');
    }
  };

  // Handle mouse interactions
  scene.addEventListener("mouseenter", () => {
    isHovering = true;
    
    // Expansion animation
    gsap.to(cube, {
      scale: 1.2,
      duration: 0.5,
      ease: "elastic.out(1, 0.5)"
    });
    
    // Add glow effect
    gsap.to(cube, {
      boxShadow: "0 0 20px rgba(249, 248, 113, 0.5)",
      duration: 0.3
    });
  });

  scene.addEventListener("mouseleave", () => {
    isHovering = false;
    resetFaceHighlights();
    
    // Return to original size
    gsap.to(cube, {
      scale: 1,
      duration: 0.5,
      ease: "elastic.out(1, 0.5)"
    });
    
    // Remove glow effect
    gsap.to(cube, {
      boxShadow: "none",
      duration: 0.3
    });
  });

  scene.addEventListener("mousemove", (e) => {
    if (isHovering) {
      // Update cube rotation based on cursor position
      const rect = scene.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const x = (e.clientX - centerX) / (rect.width / 2);
      const y = (e.clientY - centerY) / (rect.height / 2);
      
      cube.style.transform = `rotateX(${-y * 45}deg) rotateY(${x * 45}deg)`;
      
      // Highlight the face under the cursor
      highlightFaceFromCursor(e);
    }
  });

  grids.forEach((grid) => {
    createGrid(grid);
    randomInterval(grid);
  });

  startAutoRotate();
};