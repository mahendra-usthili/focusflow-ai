import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile as firebaseUpdateProfile,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure persistence is set
    setPersistence(auth, browserLocalPersistence)
      .catch((err) => console.error("[Auth] Persistence error:", err));

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      
      if (user) {
        try {
          // Fetch additional user profile data from Firestore if needed
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            // Create basic profile if it doesn't exist
            await setDoc(userDocRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email?.split('@')[0] || 'User',
              photoURL: user.photoURL || '',
              createdAt: new Date().toISOString(),
              settings: {
                theme: 'dark',
                notifications: true
              }
            });
            setCurrentUser({ ...user, displayName: user.displayName || user.email?.split('@')[0] || 'User' });
          } else {
            setCurrentUser({ ...user, ...userDoc.data() });
          }
        } catch (error) {
          if (error.message.includes('offline')) {
            console.warn("⚠️ Firestore is offline or not configured. To fix this: Go to Firebase Console -> Build -> Firestore Database -> Click 'Create Database'.");
          } else {
            console.warn("⚠️ Could not fetch Firestore profile (using fallback):", error.message);
          }
          // Fallback to basic user if Firestore fails (e.g., missing permissions)
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logout = () => signOut(auth);

  const updateUserProfile = async ({ displayName, photoURL }) => {
    try {
      // Update Firebase Auth profile
      await firebaseUpdateProfile(auth.currentUser, {
        displayName: displayName || auth.currentUser.displayName,
        photoURL: photoURL ?? auth.currentUser.photoURL,
      });
      // Update Firestore users doc
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, {
        displayName: displayName || auth.currentUser.displayName,
        photoURL: photoURL ?? auth.currentUser.photoURL,
      });
      // Update local state
      setCurrentUser(prev => ({
        ...prev,
        displayName: displayName || prev.displayName,
        photoURL: photoURL ?? prev.photoURL,
      }));
    } catch (err) {
      console.warn('Could not update profile:', err.message);
      throw err;
    }
  };

  const value = {
    currentUser,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen bg-dark-50 dark:bg-dark-950 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/40 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <p className="text-dark-400 text-sm font-semibold uppercase tracking-widest animate-pulse">Loading FocusFlow...</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};
