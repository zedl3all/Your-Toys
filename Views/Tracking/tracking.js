document.addEventListener('DOMContentLoaded', function() {
  // Get elements
  const progressBar = document.querySelector('.js-bar');
  const circles = document.querySelectorAll('.js-circle');
  const container = document.querySelector('.progress__container');
  
  if (!container || !progressBar) return;
  
  const statusId = parseInt(container.getAttribute('data-status-id'));
  
  /**
   * Updates the progress bar based on status ID and screen size
   */
  function updateProgressBar() {
      // Calculate progress percentage based on status
      let progressPercentage = 0;
      
      if (statusId >= 4) progressPercentage = 100;
      else if (statusId === 3) progressPercentage = 66;
      else if (statusId === 2) progressPercentage = 33;
      
      // Calculate active steps for animation
      const activeSteps = statusId - 1;
      
      // Check if the layout is vertical or horizontal
      if (window.innerWidth <= 768) {
          // Vertical layout
          progressBar.style.width = '0.3rem';
          progressBar.style.height = `${progressPercentage}%`;
          
          // Adjust for proper vertical positioning
          if (activeSteps > 0) {
              const multiplier = Math.min(activeSteps, 3) / 3;
              const containerHeight = container.offsetHeight - 100;
              progressBar.style.height = `${containerHeight * multiplier}px`;
          } else {
              progressBar.style.height = '0';
          }
      } else {
          // Horizontal layout
          progressBar.style.height = '0.3rem';
          progressBar.style.width = `${progressPercentage}%`;
          
          // Adjust for proper horizontal positioning
          const containerWidth = container.offsetWidth - 50;
          if (activeSteps > 0) {
              const multiplier = Math.min(activeSteps, 3) / 3;
              progressBar.style.width = `${containerWidth * multiplier}px`;
          } else {
              progressBar.style.width = '0';
          }
      }
  }
  
  // Add animation delay to each circle
  circles.forEach((circle, index) => {
      if (circle.classList.contains('active')) {
          circle.style.transitionDelay = `${index * 0.2}s`;
      }
  });
  
  // Initialize progress bar after a short delay to ensure styles are applied
  setTimeout(updateProgressBar, 200);
  
  // Update on window resize
  window.addEventListener('resize', () => {
      setTimeout(updateProgressBar, 50);
  });
  
  // Update when orientation changes on mobile devices
  window.addEventListener('orientationchange', () => {
      setTimeout(updateProgressBar, 200);
  });
});