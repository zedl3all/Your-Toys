
//ยังใช้ไม่ได้

// initializeRegister();

// function initializeRegister() {
//     document.addEventListener('DOMContentLoaded', function() {
//         const registerForm = document.getElementById('registerForm');
//         const passwordInput = document.getElementById('password');
//         const confirmPasswordInput = document.getElementById('confirm-password');

//         registerForm.addEventListener('submit', function(event) {
//             event.preventDefault();

//             const password = passwordInput.value.trim();
//             const confirmPassword = confirmPasswordInput.value.trim();

//             // Check if passwords match
//             if (password !== confirmPassword) {
//                 alert('Passwords do not match!');
//                 return;
//             }

//             // Simulate a successful registration (replace this with actual registration logic)
//             setTimeout(function() {
//                 alert('Registration successful!');
//                 window.location.href = '/login'; // Redirect to the login page
//             }, 1000);
//         });
//     });
// }