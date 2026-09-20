import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from './api'

interface AuthUser {
  email: string
  role: string
}

interface AuthContextType {
  session: { user: AuthUser } | null
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  signIn: async () => {},
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<{ user: AuthUser } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem('auth_token')
    if (token) {
      api.getSession()
        .then(({ user }) => {
          setSession({ user })
        })
        .catch(() => {
          // Token invalid, clear it
          localStorage.removeItem('auth_token')
          setSession(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { token, user } = await api.login(email, password)
    localStorage.setItem('auth_token', token)
    setSession({ user })
  }

  const signOut = async () => {
    localStorage.removeItem('auth_token')
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut, signIn }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
