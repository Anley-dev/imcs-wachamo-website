// Global error catcher to alert your mobile screen if anything crashes
window.onerror = function(message, source, lineno, colno, error) {
    alert("CRASH DETECTED:\n" + message + "\nLine: " + lineno);
    return false;
};

document.addEventListener('DOMContentLoaded', () => {
    // Make sure this matches the actual ID of your HTML form element
    const registerForm = document.querySelector('form') || document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Fetching your input values (Ensure your HTML inputs have these exact IDs)
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            // Firebase Authentication Call
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    alert("Registration Successful! Account created for: " + userCredential.user.email);
                    // Redirect to login page after success
                    window.location.href = 'login.html';
                })
                .catch((error) => {
                    // This will tell us if your API key is truly valid or if something else is wrong
                    alert("FIREBASE ERROR: " + error.message);
                    console.error(error);
                });
        });
    } else {
        alert("Debug Error: Form element not found on this page!");
    }
});

