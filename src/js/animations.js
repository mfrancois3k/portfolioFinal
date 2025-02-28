import { gsap } from 'gsap';
import SplitType from 'split-type';

export const initAnimations = () => {
  const splitText = new SplitType(".title, .small-text");
  const tl = gsap.timeline({ paused: true });

  tl.from(splitText.chars, {
    opacity: 0,
    x: "100%",
    stagger: 0.05,
    ease: "expo.out",
    duration: 0.3
  });

  const section1 = document.querySelector("#section-1");
  gsap.set(splitText.chars, { opacity: 0, x: "100%" });

  section1.addEventListener("mouseenter", () => tl.reverse());
  section1.addEventListener("mouseleave", () => tl.play());

  // GSAP Animation Script (assumes GSAP is already loaded in your website)
document.addEventListener('DOMContentLoaded', () => {
  // Form animation timeline
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  
  // Animate container entering
  tl.to('.contact-container', { 
      opacity: 1, 
      duration: 0.8, 
      y: 0,
      ease: 'power4.out'
  });
  
  // Animate title elements
  tl.from('.contact-title', { 
      opacity: 0, 
      x: -30, 
      duration: 0.6 
  }, '-=0.4');
  
  tl.from('.contact-subtitle', { 
      opacity: 0, 
      x: -30, 
      duration: 0.6 
  }, '-=0.3');
  
  tl.from('.contact-subtitle::after', { 
      width: 0, 
      duration: 0.6 
  }, '-=0.2');
  
  // Animate form groups one by one
  tl.to('.contact-container .form-group', { 
      opacity: 1, 
      y: 0, 
      stagger: 0.15, 
      duration: 0.6 
  }, '-=0.3');
  
  // Animate buttons
  tl.to('.contact-container .form-actions', { 
      opacity: 1, 
      duration: 0.6 
  }, '-=0.2');
  
  // Input focus animation
  const inputs = document.querySelectorAll('.contact-container .form-control');
  
  inputs.forEach(input => {
      input.addEventListener('focus', () => {
          gsap.to(input, { 
              borderColor: '#ff3e79', 
              duration: 0.3 
          });
      });
      
      input.addEventListener('blur', () => {
          if (!input.value) {
              gsap.to(input, { 
                  borderColor: '#555', 
                  duration: 0.3 
              });
          }
      });
  });
  
  // Button hover animations
  const buttons = document.querySelectorAll('.contact-container .btn');
  
  buttons.forEach(button => {
      button.addEventListener('mouseenter', () => {
          gsap.to(button, { 
              scale: 1.05, 
              duration: 0.3 
          });
      });
      
      button.addEventListener('mouseleave', () => {
          gsap.to(button, { 
              scale: 1, 
              duration: 0.3 
          });
      });
  });
  
  // Form submission effect
  const form = document.getElementById('contactForm');
  
  form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Animate successful submission
      const submitTl = gsap.timeline();
      
      submitTl.to('.contact-container .form-control', {
          opacity: 0.5,
          duration: 0.3,
          stagger: 0.05
      });
      
      submitTl.to('.contact-container .form-actions', {
          opacity: 0.5,
          duration: 0.3
      }, '-=0.2');
      
      submitTl.to('.contact-container', {
          boxShadow: '0 0 30px rgba(255, 62, 121, 0.3)',
          duration: 0.8
      }, '-=0.2');
      
      // Reset form after animation
      setTimeout(() => {
          form.reset();
          gsap.to('.contact-container', {
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
              duration: 0.5
          });
          gsap.to(['.contact-container .form-control', '.contact-container .form-actions'], {
              opacity: 1,
              duration: 0.5
          });
      }, 2000);
  });
});

gsap.from('.contact-container', {
  opacity: 0,
  y: 30,
  duration: 0.8,
  scrollTrigger: {
    trigger: '#section-5',
    start: 'top center',
    end: 'bottom center',
    toggleActions: 'play none none reverse'
  }
});

gsap.from('.form-group', {
  opacity: 0,
  y: 20,
  duration: 0.5,
  stagger: 0.1,
  scrollTrigger: {
    trigger: '.contact-container',
    start: 'top center',
    end: 'bottom center',
    toggleActions: 'play none none reverse'
  }
});

};
