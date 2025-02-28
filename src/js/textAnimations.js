import gsap from 'gsap';
import SplitType from 'split-type';

export const initTextAnimations = () => {
    const splitText = new SplitType(".title, .small-text");
    const section1 = document.querySelector("#section-1");
    
    // Create the animation timeline
    const tl = gsap.timeline({ paused: true });

    // Setup the animation
    tl.from(splitText.chars, {
        opacity: 0,
        x: "100%",
        stagger: 0.05,
        ease: "expo.out",
        duration: .3
    });

    // Initial state
    gsap.set(splitText.chars, { opacity: 0, x: "100%" });
    
    // Event listeners
    section1.addEventListener("mouseenter", () => {
        tl.play();
    });
    
    section1.addEventListener("mouseleave", () => {
        tl.reverse();
    });
}