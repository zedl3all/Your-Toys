let currentStep = 1;
const steps = document.querySelectorAll(".step");
const progressBar = document.querySelector(".progress-bar");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
function updateStepper() {
    steps.forEach((step, index) => {
        if (index < currentStep) {
            step.classList.add("completed");
        } else {
            step.classList.remove("completed");
        }
        step.classList.toggle("active", index === currentStep);
    });
    progressBar.style.width = ((currentStep) / (steps.length - 1)) * 100 + "%";
    prevBtn.disabled = currentStep === 0;
    nextBtn.disabled = currentStep === steps.length - 1;
}
nextBtn.addEventListener("click", () => {
    if (currentStep < steps.length - 1) {
        currentStep++;
        updateStepper();
    }
});
prevBtn.addEventListener("click", () => {
    if (currentStep > 0) {
        currentStep--;
        updateStepper();
    }
});