// IMCS Wachemo - Core Firebase Integration Module (Modular Setup)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDSlXqHHVNYcx8WTb66RvJazDaMCl3l6B8",
    authDomain: "imcs-wachemo.firebaseapp.com",
    projectId: "imcs-wachemo",
    storageBucket: "imcs-wachemo.firebasestorage.app",
    messagingSenderId: "437248834008",
    appId: "1:437248834008:web:cf328836ff7981d927daad"
};

// Initialize Firebase Instance
const app = initializeApp(firebaseConfig);

// Export Auth instance cleanly across modular files
export const auth = getAuth(app);
