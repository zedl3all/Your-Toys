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

function setCurrentStep(step) {
    if (step >= 0 && step < steps.length) {
        currentStep = step;
        updateStepper();
    }
}

// nextBtn.addEventListener("click", () => {
//     if (currentStep < steps.length - 1) {
//         currentStep++;
//         updateStepper();
//     }
// });

// prevBtn.addEventListener("click", () => {
//     if (currentStep > 0) {
//         currentStep--;
//         updateStepper();
//     }
// });

// Example of receiving input and updating the stepper
// Replace this with actual input handling logic
document.addEventListener("inputReceived", (event) => {
    const step = event.detail.step; // Assuming the input event provides the step number
    setCurrentStep(step);
});
