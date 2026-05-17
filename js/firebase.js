// IMCS Wachemo - Core Firebase Integration Module

// Web application Firebase configuration matrix
const firebaseConfig = {
    apiKey: "AIzaSyDSlXqHHVNYcx8WTb66RvJazDaMCl3l6B8",
    authDomain: "imcs-wachemo.firebaseapp.com",
    projectId: "imcs-wachemo",
    storageBucket: "imcs-wachemo.firebasestorage.app",
    messagingSenderId: "437248834008",
    appId: "1:437248834008:web:cf328836ff7981d927daad",
// Initialize Firebase Instance
const app = initializeApp(firebaseConfig);
};

// Initialize Firebase if it hasn't been initialized yet
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Make auth and db accessible globally
window.auth = firebase.auth();
window.db = firebase.firestore();
