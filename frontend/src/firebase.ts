import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDwuoMrcbbAHxyUFM251QEw2MN56G3ghKE",
    authDomain: "videototext-c55ab.firebaseapp.com",
    projectId: "videototext-c55ab",
    storageBucket: "videototext-c55ab.firebasestorage.app",
    messagingSenderId: "706124793654",
    appId: "1:706124793654:web:634cc329bfd98ac7121597",
    measurementId: "G-HYBQ8R49VL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Error signing in with Google:", error);
        throw error;
    }
};
