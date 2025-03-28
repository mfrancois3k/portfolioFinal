import { gsap } from 'gsap';
import SplitType from 'split-type';

export const initPreloader = () => {
  // Create preloader elements
  const preloader = document.createElement('div');
  preloader.className = 'preloader';
  
  const preloaderContent = document.createElement('div');
  preloaderContent.className = 'preloader-content';
  
  const preloaderName = document.createElement('div');
  preloaderName.className = 'preloader-name';
  preloaderName.textContent = 'Michael Francois';
  
  const preloaderTitle = document.createElement('div');
  preloaderTitle.className = 'preloader-title';
  preloaderTitle.textContent = 'Portfolio';
  
  preloaderContent.appendChild(preloaderName);
  preloaderContent.appendChild(preloaderTitle);
  preloader.appendChild(preloaderContent);
  document.body.appendChild(preloader);

  // Split text for animation
  const splitName = new SplitType('.preloader-name', { types: 'chars' });
  const splitTitle = new SplitType('.preloader-title', { types: 'chars' });

  // Create timeline
  const tl = gsap.timeline({
    onComplete: () => {
      gsap.to(preloader, {
        duration: 1,
        yPercent: -100,
        ease: "power4.inOut",
        onComplete: () => preloader.remove()
      });
    }
  });

  // Initial state
  gsap.set([splitName.chars, splitTitle.chars], { 
    x: 100,
    opacity: 0
  });

  // Animation sequence
  tl.to(splitName.chars, {
    duration: 0.8,
    x: 0,
    opacity: 1,
    stagger: 0.03,
    ease: "power4.out"
  })
  .to(splitTitle.chars, {
    duration: 0.8,
    x: 0,
    opacity: 1,
    stagger: 0.03,
    ease: "power4.out"
  }, "-=0.4")
  .to([splitName.chars, splitTitle.chars], {
    duration: 0.6,
    x: -100,
    opacity: 0,
    stagger: 0.02,
    ease: "power4.in",
    delay: 0.8
  });
};