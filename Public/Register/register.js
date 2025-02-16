initializeRegister();

async function registerUser(data) {
    try {
        const response = await fetch('/registerUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error registering user:", error);
        return { success: false, message: "Server error. Please try again later." };
    }
}

function initializeRegister() {
    document.addEventListener('DOMContentLoaded', function () {
        const registerForm = document.getElementById('registerForm');

        registerForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            console.log(data);

            // Password validation
            if (data.password !== data.confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            // Register user
            const result = await registerUser(data);

            if (result.success) {
                alert("Registration successful!");
                window.location.href = "/login";
            } else {
                alert("Registration failed: " + result.message);
            }
        });
    });
}
