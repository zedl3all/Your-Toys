const prevBtn = document.querySelector(".js-prev");
const nextBtn = document.querySelector(".js-next");
const progressBar = document.querySelector(".js-bar");
const circles = document.querySelectorAll(".js-circle");

let currentActive = 1;

const changeBarDisplay = function () {
  const actives = document.querySelectorAll(".active");

  if (window.innerWidth >= 375 && window.innerWidth < 810) {
    progressBar.style.height = `${
      ((actives.length - 1) / (circles.length - 1)) * 100
    }%`;
  } else {
    progressBar.style.width = `${
      ((actives.length - 1) / (circles.length - 1)) * 100
    }%`;
  }
};

const updateCirlceState = function () {
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
  updateCirlceState();
});

prevBtn.addEventListener("click", () => {
  decrementCurrent();
  updateCirlceState();
});
