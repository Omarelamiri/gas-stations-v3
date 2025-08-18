// src/context/AuthContext.tsx
'use client';

import React, { useState, useEffect, createContext, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/services/firebase/config'
import { User, LoginCredentials, RegisterData, AuthState } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context
export const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Convert Firebase user to our User type
  const convertFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: userData.name || firebaseUser.displayName || 'Unknown',
          role: userData.role || 'user',
          createdAt: userData.createdAt?.toDate() || new Date(),
          updatedAt: userData.updatedAt?.toDate() || new Date(),
        };
      }
      
      // If no user document exists, create one
      const newUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: firebaseUser.displayName || 'Unknown',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await setDoc(userDocRef, {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      return newUser;
    } catch (error) {
      console.error('Error converting Firebase user:', error);
      return null;
    }
  };

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      
      const user = await convertFirebaseUser(userCredential.user);
      
      if (user) {
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
        toast.success('Login successful!');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Login failed. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      
      // Create user document in Firestore
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        name: data.name,
        email: data.email,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      const user: User = {
        id: userCredential.user.uid,
        email: data.email,
        name: data.name,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
      
      toast.success('Registration successful!');
    } catch (error: any) {
      console.error('Registration error:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      
      let errorMessage = 'Registration failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await convertFirebaseUser(firebaseUser);
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: !!user,
        });
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};