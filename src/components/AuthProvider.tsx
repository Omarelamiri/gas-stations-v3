'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/services/firebase/config'

export type AuthContextValue = {
  user: User | null
  loading: boolean
  error: Error | null
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true, error: null })

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      (u) => {
        setUser(u)
        setLoading(false)
      },
      (e) => {
        setError(e as Error)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [])

  const value = useMemo(() => ({ user, loading, error }), [user, loading, error])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => useContext(AuthContext)