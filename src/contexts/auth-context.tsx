"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

type Admin = {
  _id: string
  fullName: string
  email: string
  phoneNumber: string
  role: {
    _id: string
    role: string
    capabilities: string[]
  }
}

type AuthContextType = {
  admin: Admin | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasCapability: (capability: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored admin data on initial load
    const storedAdmin = localStorage.getItem("admin")
    if (storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin))
      } catch (error) {
        console.error("Failed to parse stored admin data:", error)
        localStorage.removeItem("admin")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("https://api.thegpdn.org/api/admin/adminLogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.status === 200) {
        // Extract the admin data from the correct nesting level
        const adminData = data.data.data;
        
        // Store the complete admin data with the proper role structure
        setAdmin(adminData);
        localStorage.setItem("admin", JSON.stringify(adminData));
        toast.success("Logged in successfully");
        router.push("/admin");
      } else {
        throw new Error(data.message || "Login failed")
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to login'
      toast.error(errorMessage)
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setAdmin(null)
    localStorage.removeItem("admin")
    toast.success("Logged out successfully")
    router.push("/login")
  }

  const hasCapability = (capability: string) => {
    if (!admin || !admin.role || !admin.role.capabilities) return false
    return admin.role.capabilities.includes(capability)
  }

  return (
    <AuthContext.Provider value={{ admin, isLoading, login, logout, hasCapability }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}