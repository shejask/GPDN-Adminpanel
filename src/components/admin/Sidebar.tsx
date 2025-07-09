"use client"
import { cn } from "@/lib/utils"
// Button component is used in other parts of the application
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  FileText,
  Tags,
  Building2,
  Users,
  Shield,
  UserCog,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ChevronDown
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useAuth } from "@/contexts/auth-context"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
    capability: "", // Empty string means no specific capability required
  },
  {
    label: "Members",
    icon: Users,
    href: "/admin/members",
    capability: "admins management",
  },
  {
    label: "Threads",
    icon: MessageSquare,
    href: "/admin/forums",
    capability: "thread management",
  },
  {
    label: "Resources",
    icon: BookOpen,
    href: "/admin/resources",
    capability: "resource management",
  },

   
  {
    label: "Services",
    icon: Building2,
    href: "/admin/services",
    capability: "services management",
  },
]

const categoryRoutes = [

  {
    label: "Blogs",
    icon: FileText,
    href: "/admin/blogs",
    capability: "resource management",
  },
  
  {
    label: "Categories",
    icon: Tags,
    href: "/admin/categories",
    capability: "thread management",
  },

]

const userRoutes = [
  {
    label: "Roles",
    icon: Shield,
    href: "/admin/users/roles",
    capability: "admins management",
  },
  {
    label: "Admins",
    icon: UserCog,
    href: "/admin/users/admins",
    capability: "admins management",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { hasCapability } = useAuth()

  return (
    <div className="space-y-4 h-screen py-4 flex flex-col bg-gray-900 fixed text-white w-64">
      <div className="px-3 py-2 flex-1">
        <Link href="/admin" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">GPDN</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => {
            // Skip rendering if capability is required and user doesn't have it
            if (route.capability && !hasCapability(route.capability)) return null
            
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                  pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                )}
              >
                <div className="flex items-center flex-1">
                  <route.icon className="h-5 w-5 mr-3" />
                  {route.label}
                </div>
              </Link>
            )
          })}
          
          <Accordion type="single" collapsible className="w-full border-none">
            {/* Palliative Care Section */}
            <AccordionItem value="palliative">
              <AccordionTrigger className="text-sm p-3 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition">
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 mr-3" />
                  Palliative Care
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {/* Palliative Units */}
                <Link
                  href="/admin/palliative"
                  className={cn(
                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition pl-11",
                    pathname === "/admin/palliative" ? "text-white bg-white/10" : "text-zinc-400"
                  )}
                >
                  <div className="flex items-center flex-1">
                    <Building2 className="h-5 w-5 mr-3" />
                    Units
                  </div>
                </Link>
                
                {/* Palliative Services */}
                <Link
                  href="/admin/services"
                  className={cn(
                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition pl-11",
                    pathname === "/admin/services" ? "text-white bg-white/10" : "text-zinc-400"
                  )}
                >
                  <div className="flex items-center flex-1">
                    <Tags className="h-5 w-5 mr-3" />
                    Services
                  </div>
                </Link>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="categories">
              <AccordionTrigger className="text-sm p-3 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-3" />
                  Blogs
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {categoryRoutes.map((route) => {
                  if (route.capability && !hasCapability(route.capability)) return null
                  
                  return (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={cn(
                        "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition pl-11",
                        pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                      )}
                    >
                      <div className="flex items-center flex-1">
                        <route.icon className="h-5 w-5 mr-3" />
                        {route.label}
                      </div>
                    </Link>
                  )
                })}
              </AccordionContent>
            </AccordionItem>
            
            {/* Only show Users section if user has admins management capability */}
            {hasCapability("admins management") && (
              <AccordionItem value="users">
                <AccordionTrigger className="text-sm p-3 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-3" />
                    Users
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {userRoutes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      className={cn(
                        "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition pl-11",
                        pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                      )}
                    >
                      <div className="flex items-center flex-1">
                        <route.icon className="h-5 w-5 mr-3" />
                        {route.label}
                      </div>
                    </Link>
                  ))}
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </div>
    </div>
  )
}