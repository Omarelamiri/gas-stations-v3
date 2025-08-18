// src/app/Providers.tsx
'use client';

import { ReactNode } from 'react';
import { AuthProvider }  from '@/components/AuthProvider';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return <AuthProvider>{children}</AuthProvider>;
}
