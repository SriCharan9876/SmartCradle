import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth, googleProvider } from "../fireBase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);   // store user object
  const [loading, setLoading] = useState(true);

  // Listen for login/logout events
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Extract only useful info from Firebase user
        const { uid, email, displayName, photoURL } = currentUser;
        setUser({ uid, email, displayName, photoURL });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Functions for signup/login/logout
  const signup = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const { uid, email, displayName, photoURL } = result.user;
    setUser({ uid, email, displayName, photoURL });
    return result;
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, loginWithGoogle }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
