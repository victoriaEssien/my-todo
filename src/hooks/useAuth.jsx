import { useState, useEffect } from "react";
import { auth, db } from "../firebase_setup/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Generate and store access token in cookies
        const token =
          Math.random().toString(36).substring(2) +
          Math.random().toString(36).substring(2);
        Cookies.set(import.meta.env.VITE_ACCESS_TOKEN_ID, token, {
          expires: 7,
        });

        // Check if user document exists in Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
          // Create user document if it doesn't exist
          await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            categories: ["Work", "Personal"],
          });
        }
      } else {
        setUser(null);
        Cookies.remove(import.meta.env.VITE_ACCESS_TOKEN_ID);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    navigate("/home");
    return userCredential.user;
  };

  const signIn = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    navigate("/home");
    return userCredential.user;
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    navigate("/");
  };

  return { user, loading, signUp, signIn, signOut };
};
