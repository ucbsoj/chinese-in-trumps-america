// Scroll animation for D3 chart
document.addEventListener("DOMContentLoaded", function () {
  // Flag to track if chart has been animated
  let chartAnimated = false;
  // Variable to store the resize timeout
  let resizeTimeout;
  // Variable to track if a redraw is in progress
  let isRedrawing = false;

  // Create the Intersection Observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // If the chart container is in view and hasn't been animated yet
        if (entry.isIntersecting && !chartAnimated) {
          // Set the flag to true to prevent re-animation
          chartAnimated = true;

          // Trigger chart drawing
          draw();

          // Stop observing after animation is triggered
          observer.unobserve(entry.target);
        }
      });
    },
    {
      // Options: trigger when at least 20% of the element is visible
      threshold: 0.2,
    }
  );

  // Start observing the chart container
  const chartContainer = document.getElementById("d3-container");
  if (chartContainer) {
    observer.observe(chartContainer);
  }

  // Debounced resize handler to prevent multiple redraws
  function handleResize() {
    // Clear any existing timeout
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }

    // Set a new timeout to delay the redraw
    resizeTimeout = setTimeout(function () {
      // Only redraw if chart has been animated and not currently redrawing
      if (chartAnimated && !isRedrawing) {
        isRedrawing = true;

        // Clear the chart completely
        const chartElement = document.getElementById("chart");
        if (chartElement) {
          chartElement.innerHTML = "";

          // Redraw the chart
          draw()
            .then(() => {
              // Reset the redrawing flag when done
              isRedrawing = false;
            })
            .catch((error) => {
              console.error("Error redrawing chart:", error);
              isRedrawing = false;
            });
        }
      }
    }, 250); // 250ms debounce delay
  }

  // Add window resize event listener with debouncing
  window.addEventListener("resize", handleResize);
});
