export const initPreloader = () => {
    const preloader = document.querySelector('.preloader');
    const content = document.querySelector('.content-hidden');
    
    // Ensure all content is loaded
    window.addEventListener('load', () => {
        // Add a slight delay for smoother transition
        setTimeout(() => {
            preloader.classList.add('fade-out');
            content.classList.add('show');
            
            // Remove preloader from DOM after animation
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }, 2000); // Adjust this time as needed
    });
};