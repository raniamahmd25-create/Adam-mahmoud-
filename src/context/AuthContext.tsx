import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';

const ADMIN_EMAIL = 'raniamahmd25@gmail.com';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (name: string, bio: string, photoURL?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile from firestore
  const fetchProfile = async (firebaseUser: User): Promise<UserProfile> => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        setProfile(data);
        return data;
      } else {
        // Create new user profile document
        const isUserAdmin = firebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        const newProfile: UserProfile = {
          id: firebaseUser.uid,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'مستخدم جديد',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || '',
          bio: 'عاشق للألعاب ومستكشف للتطبيقات الحديثة.',
          role: isUserAdmin ? 'admin' : 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, newProfile);
        setProfile(newProfile);
        return newProfile;
      }
    } catch (err) {
      console.warn('Could not fetch user profile:', err);
      // Fallback in-memory profile so user is not blocked
      const fallback: UserProfile = {
        id: firebaseUser.uid,
        displayName: firebaseUser.displayName || 'مستخدم',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || '',
        bio: '',
        role: firebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProfile(fallback);
      return fallback;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user) {
        await fetchProfile(cred.user);
      }
    } catch (err: unknown) {
      console.error('Google Sign in error:', err);
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await fetchProfile(cred.user);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await updateFirebaseProfile(cred.user, { displayName: name });
      const isUserAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const newProfile: UserProfile = {
        id: cred.user.uid,
        displayName: name,
        email: email,
        photoURL: '',
        bio: 'عاشق للألعاب ومستكشف للتطبيقات الحديثة.',
        role: isUserAdmin ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      try {
        await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${cred.user.uid}`);
      }
      setProfile(newProfile);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  const updateUserProfile = async (name: string, bio: string, photoURL?: string) => {
    if (!user) throw new Error('يجب تسجيل الدخول أولاً');
    await updateFirebaseProfile(user, {
      displayName: name,
      ...(photoURL !== undefined ? { photoURL } : {}),
    });

    const userDocRef = doc(db, 'users', user.uid);
    const updates: Partial<UserProfile> = {
      displayName: name,
      bio,
      ...(photoURL !== undefined ? { photoURL } : {}),
      updatedAt: new Date().toISOString(),
    };

    try {
      await updateDoc(userDocRef, updates);
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const isAdmin = Boolean(
    (user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) ||
    profile?.role === 'admin'
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        updateUserProfile,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
