initializeLogin();

async function validateUser(username, password) {
    const response = await fetch('/validateUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    console.log(result);
    return result;
}

function initializeLogin() {
    document.addEventListener('DOMContentLoaded', function() {
        const loginForm = document.getElementById('loginForm');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const errorMessage = document.getElementById('error-message');

        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (username === '' || password === '') {
                errorMessage.textContent = 'Please fill in both fields.';
                return;
            }

            const isValid = await validateUser(username, password);
            console.log(username, password);
            console.log(isValid);
            if (isValid) {
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