initializeRegister();

async function registerUser(data) {
    const response = await fetch('/registerUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    console.log(result);
    return result;
}

function initializeRegister() {
    document.addEventListener('DOMContentLoaded', function() {
        const registerForm = document.getElementById('registerForm');
        // const passwordInput = document.getElementById('password');
        // const confirmPasswordInput = document.getElementById('confirm-password');

        registerForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            const result = await registerUser(data);
            console.log(data);
            console.log(result);
            if (result.success) {
                alert('Register successful!');
                window.location.href = '/login';
            } else {
                alert('Registration failed: ' + result.message);
            }
        });
    });
}