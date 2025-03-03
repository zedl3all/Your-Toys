initializeLogin();

async function validateUser(username, password, userType) {
    try {
        const response = await fetch('/validateUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, userType })
        });

        const result = await response.json();
        console.log("Login response:", result);  // Debug the response
        return result;
    } catch (error) {
        console.error("Error during validation:", error);
        return { success: false, message: "Error connecting to server" };
    }
}

function initializeLogin() {
    document.addEventListener('DOMContentLoaded', function () {
        const loginForm = document.getElementById('loginForm');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const errorMessage = document.getElementById('error-message');

        // Ensure toggle options exist
        const customerToggleOption = document.querySelector('.toggle-option[data-userType="customer"]');
        if (customerToggleOption) {
            loginForm.dataset.userType = 'customer';
            customerToggleOption.classList.add('active');
        }

        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            const userType = loginForm.dataset.userType || 'customer';

            if (username === '' || password === '') {
                errorMessage.textContent = 'Please fill in both fields.';
                return;
            }

            const response = await validateUser(username, password, userType);
            console.log("Login response received:", response);

            if (response.success) {
                // THIS IS THE KEY PART - correctly saving user_id
                localStorage.clear(); // Clear any existing data
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', username);
                localStorage.setItem('user_id', response.user_id);
                localStorage.setItem('role_id', response.role_id);

                console.log("Saved to localStorage - user_id:", response.user_id);

                // Redirect to home page
                window.location.href = '/';
            } else {
                errorMessage.textContent = response.message || 'Invalid username or password';
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
