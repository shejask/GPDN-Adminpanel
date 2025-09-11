"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function Home() {
  const { admin, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (admin) {
        router.push("/admin")
      } else {
        router.push("/login")
      }
    }
  }, [admin, isLoading, router])

  return null
}
