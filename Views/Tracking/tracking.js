const prevBtn = document.querySelector(".js-prev");
const nextBtn = document.querySelector(".js-next");
const progressBar = document.querySelector(".js-bar");
const circles = document.querySelectorAll(".js-circle");

let currentActive = 1;

const changeBarDisplay = function () {
  const actives = document.querySelectorAll(".active");

  if (window.innerWidth >= 375 && window.innerWidth < 810) {
    progressBar.style.height = `${((actives.length - 1) / (circles.length - 1)) * 100
      }%`;
  } else {
    progressBar.style.width = `${((actives.length - 1) / (circles.length - 1)) * 100
      }%`;
  }
};

const updateCircleState = function () {
  circles.forEach((circle, i) => {
    i < currentActive
      ? circle.classList.add("active")
      : circle.classList.remove("active");
  });

  changeBarDisplay();

  if (currentActive === 1) prevBtn.disabled = true;
  else if (currentActive === circles.length) nextBtn.disabled = true;
  else {
    prevBtn.disabled = false;
    nextBtn.disabled = false;
  }
};

const incrementCurrent = function () {
  currentActive++;

  currentActive > circles.length && (currentActive = circles.length);
};

const decrementCurrent = function () {
  currentActive--;

  currentActive < 1 && (currentActive = 1);
};

nextBtn.addEventListener("click", () => {
  incrementCurrent();
  updateCircleState();
});

prevBtn.addEventListener("click", () => {
  decrementCurrent();
  updateCircleState();
});

// Fetch data from the database and update the progress bar
const fetchDataAndUpdateProgress = async function () {
  try {
    const response = await fetch('/api/progress'); // Replace with your API endpoint
    const data = await response.json();
    currentActive = data.currentStep; // Assuming the API returns an object with currentStep
    updateCircleState();
  } catch (error) {
    console.error('Error fetching progress data:', error);
  }
};

// Call the function to fetch data and update the progress bar on page load
fetchDataAndUpdateProgress();

/**
 * Updates the progress bar width based on the status ID
 * @param {number} statusId - The order status ID
 */
function updateProgressBar(statusId) {
  if (!progressBar) return;

  if (statusId === 2) progressBar.style.width = '0%';
  else if (statusId === 3) progressBar.style.width = '50%';
  else if (statusId === 4) progressBar.style.width = '100%';
  else progressBar.style.width = '0%';

  console.log('Set progress bar width to:', progressBar.style.width);
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  // Get the status ID from the data attribute
  const container = document.querySelector('.progress__container');
  if (container) {
    const statusId = parseInt(container.getAttribute('data-status-id'));
    updateProgressBar(statusId);
  }
});