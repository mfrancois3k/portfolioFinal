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
};