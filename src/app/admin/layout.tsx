"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/admin/Sidebar"
import { TopNav } from "@/components/admin/TopNav"
import { useAuth } from "@/contexts/auth-context"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { admin, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push("/login")
    }
  }, [admin, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!admin) return null

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <TopNav />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}