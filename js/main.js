// Global error catcher to alert your screen if the JavaScript crashes
window.onerror = function(message, source, lineno, colno, error) {
    alert("CRASH DETECTED:\n" + message + "\nLine: " + lineno);
    return false;
};

document.addEventListener('DOMContentLoaded', () => {
    // Looks for a form element on the login page
    const loginForm = document.querySelector('form') || document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Fetching input values (Ensure your HTML inputs have id="email" and id="password")
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!email || !password) {
                alert("Please fill in all fields.");
                return;
            }

            // Firebase Sign-In Call
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    alert("Welcome Back! Login Successful.");
                    // Redirect to your profile/dashboard page upon success
                    window.location.href = 'profile.html';
                })
                .catch((error) => {
                    // This catches wrong passwords, missing users, or API config bugs
                    alert("Login failed: " + error.message);
                    console.error(error);
                });
        });
    } else {
        alert("Debug Error: Login form element not found on this page!");
    }
});

