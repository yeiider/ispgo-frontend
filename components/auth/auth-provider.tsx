"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/auth"
import { logout as serverLogout } from "@/app/actions/auth"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children, initialUser }: { children: ReactNode; initialUser?: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser || null)
  const [isLoading, setIsLoading] = useState(!initialUser)
  const router = useRouter()

  // Cargar usuario desde cookie en cliente
  useEffect(() => {
    if (!initialUser) {
      try {
        const userCookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("user="))
          ?.split("=")[1]

        if (userCookie) {
          setUser(JSON.parse(decodeURIComponent(userCookie)))
        }
      } catch (error) {
        console.error("Error parsing user cookie:", error)
      }
      setIsLoading(false)
    }
  }, [initialUser])

  const logout = useCallback(async () => {
    await serverLogout()
    setUser(null)
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
