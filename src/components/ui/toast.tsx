"use client"

import * as React from "react"
import { X } from "lucide-react"

// Simple toast component without radix-ui dependencies
export type ToastProps = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  children?: React.ReactNode
}

export type ToastActionElement = React.ReactNode

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="toast-provider">{children}</div>
}

export const ToastViewport: React.FC<{ className?: string }> = ({ className, ...props }) => {
  return (
    <div
      className={`fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] ${className || ''}`}
      {...props}
    />
  )
}

export const Toast: React.FC<ToastProps> = ({ 
  className, 
  variant = "default", 
  children,
  // These props are used by the toast system but not directly in this component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  id, title, description, action, open, onOpenChange,
  ...props 
}) => {
  const variantClasses = variant === "destructive" 
    ? "border-red-600 bg-red-50 text-red-900" 
    : "border bg-white text-gray-900"
  
  return (
    <div
      className={`group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg ${variantClasses} ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
}

export const ToastAction: React.FC<{ className?: string, children: React.ReactNode }> = ({ 
  className, 
  ...props 
}) => (
  <button
    className={`inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ${className || ''}`}
    {...props}
  />
)

export const ToastClose: React.FC<{ className?: string }> = ({ 
  className, 
  ...props 
}) => (
  <button
    className={`absolute right-2 top-2 rounded-md p-1 text-gray-400 hover:text-gray-900 ${className || ''}`}
    {...props}
  >
    <X className="h-4 w-4" />
  </button>
)

export const ToastTitle: React.FC<{ className?: string, children: React.ReactNode }> = ({ 
  className, 
  ...props 
}) => (
  <div
    className={`text-sm font-semibold ${className || ''}`}
    {...props}
  />
)

export const ToastDescription: React.FC<{ className?: string, children: React.ReactNode }> = ({ 
  className, 
  ...props 
}) => (
  <div
    className={`text-sm opacity-90 ${className || ''}`}
    {...props}
  />
)
