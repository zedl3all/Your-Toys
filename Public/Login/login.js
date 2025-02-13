initializeLogin();

function initializeLogin() {
    document.addEventListener('DOMContentLoaded', function() {
        const loginForm = document.getElementById('loginForm');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const errorMessage = document.getElementById('error-message');

        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (username === '' || password === '') {
                errorMessage.textContent = 'Please fill in both fields.';
                return;
            }

            // Simulate a login process
            if (username === 'admin' && password === 'password') {
                alert('Login successful!');
                window.location.href = '/home';
            } else {
                errorMessage.textContent = 'Invalid username or password.';
            }
        });
    });
}

function showpassword() {
    var x = document.getElementById("password");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
}