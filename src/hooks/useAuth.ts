// src/hooks/useAuth.ts
'use client';

import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Re-export AuthProvider for convenience
export { AuthProvider } from '@/context/AuthContext';