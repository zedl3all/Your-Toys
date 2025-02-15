initializeLogin();

async function validateUser(username, password, userType) {
    const response = await fetch('/validateUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, userType })
    });

    const result = await response.json();
    console.log(result);
    return result;
}

function initializeLogin() {
    document.addEventListener('DOMContentLoaded', function () {
        const loginForm = document.getElementById('loginForm');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const errorMessage = document.getElementById('error-message');

        // Ensure the toggle option elements exist
        const customerToggleOption = document.querySelector('.toggle-option[data-userType="customer"]');
        if (customerToggleOption) {
            // Set default userType to customer
            loginForm.dataset.userType = 'customer';
            customerToggleOption.classList.add('active');
        } else {
            console.error('Customer toggle option not found.');
        }

        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            const userType = loginForm.dataset.userType;

            if (username === '' || password === '') {
                errorMessage.textContent = 'Please fill in both fields.';
                return;
            }

            const isValid = await validateUser(username, password, userType);
            console.log(username, password, userType);
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

//wip by pao
function toggleUserType(element, userType) {
    // Remove active class from all options
    document.querySelectorAll('.toggle-option').forEach(option => {
        option.classList.remove('active');
    });

    // Add active class to clicked option
    element.classList.add('active');
    element.dataset.userType = userType;

    document.getElementById('loginForm').dataset.userType = userType;

    // You can add additional logic here based on the userType
    console.log('Selected user type:', userType);
}