import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const initNavigation = () => {
  const body = document.querySelector('body');
  const menu = document.querySelector('.menu-icon');
  const menuItems = document.querySelectorAll('.nav__list-item a');
  const mainNavLinks = gsap.utils.toArray('.main-nav a');
  const mainNavLinksRev = gsap.utils.toArray('.main-nav a').reverse();

  const toggleClass = (element, stringClass) => {
    element.classList.toggle(stringClass);
  };

  menu.addEventListener('click', () => toggleClass(body, 'nav-active'));

  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      if (body.classList.contains('nav-active')) {
        body.classList.remove('nav-active');
        
        setTimeout(() => {
          targetSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 600);
      }
    });
  });

  const navAnimation = (direction) => {
    const scrollingDown = direction === 1;
    const links = scrollingDown ? mainNavLinks : mainNavLinksRev;
    
    return gsap.to(links, {
      duration: 0.3,
      stagger: 0.05,
      autoAlpha: scrollingDown ? 0 : 1,
      y: scrollingDown ? 20 : 0,
      ease: "power1.inOut"
    });
  };

  ScrollTrigger.create({
    start: 100,
    toggleClass: {
      targets: 'body',
      className: 'has-scrolled'
    },
    onEnter: ({direction}) => navAnimation(direction),
    onLeaveBack: ({direction}) => navAnimation(direction),
    markers: false
  });
};