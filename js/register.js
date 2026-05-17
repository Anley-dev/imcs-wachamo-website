document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.querySelector('form');

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.querySelector('input[type="email"]').value;
            const password = document.querySelector('input[type="password"]').value;

            // This must be the Firebase method, NOT a fetch() URL
            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    alert('Success! Account created successfully.');
                    window.location.href = 'login.html';
                })
                .catch((error) => {
                    console.error("Firebase Auth Error:", error.code, error.message);
                    alert('Registration Failed: ' + error.message);
                });
        });
    }
});

