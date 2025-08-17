// src/services/firebase/auth.ts
import { signOut } from 'firebase/auth';
import { auth } from './config';

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Failed to logout:', error);
    throw error;
  }
};
