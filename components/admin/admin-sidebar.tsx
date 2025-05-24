"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSidebar } from "@/components/ui/sidebar"
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Users,
  Video,
  Bell,
  Award,
  FileText,
  Zap,
  Key,
  Cpu,
  BarChart,
  Shield,
} from "lucide-react"

export function AdminSidebar() {
  const pathname = usePathname()
  const { isOpen, toggle } = useSidebar()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    content: true,
    users: true,
    analytics: true,
    ai: true,
  })

  // Toggle sidebar group
  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

  // Check if a link is active
  const isActive = (path: string) => {
    return pathname === path
  }

  // Sidebar items with nested structure
  const sidebarItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/admin",
    },
    {
      title: "Content Management",
      icon: <BookOpen className="h-5 w-5" />,
      group: "content",
      items: [
        {
          title: "Video Settings",
          icon: <Video className="h-4 w-4" />,
          href: "/admin/video-settings",
        },
        {
          title: "Challenges",
          icon: <Award className="h-4 w-4" />,
          href: "/admin/challenges",
        },
        {
          title: "Resources",
          icon: <FileText className="h-4 w-4" />,
          href: "/admin/resources",
        },
      ],
    },
    {
      title: "User Management",
      icon: <Users className="h-5 w-5" />,
      group: "users",
      items: [
        {
          title: "All Users",
          icon: <Users className="h-4 w-4" />,
          href: "/admin/users",
        },
        {
          title: "Notifications",
          icon: <Bell className="h-4 w-4" />,
          href: "/admin/notifications",
        },
        {
          title: "Messages",
          icon: <MessageSquare className="h-4 w-4" />,
          href: "/admin/messages",
        },
      ],
    },
    {
      title: "Analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      group: "analytics",
      items: [
        {
          title: "Overview",
          icon: <BarChart className="h-4 w-4" />,
          href: "/admin/analytics",
        },
        {
          title: "User Engagement",
          icon: <Users className="h-4 w-4" />,
          href: "/admin/analytics/engagement",
        },
        {
          title: "Content Performance",
          icon: <Video className="h-4 w-4" />,
          href: "/admin/analytics/content",
        },
      ],
    },
    {
      title: "AI Management",
      icon: <Zap className="h-5 w-5" />,
      group: "ai",
      items: [
        {
          title: "API Keys & Models",
          icon: <Key className="h-4 w-4" />,
          href: "/admin/ai-settings",
        },
        {
          title: "AI Assistants",
          icon: <Cpu className="h-4 w-4" />,
          href: "/admin/ai-assistants",
        },
        {
          title: "AI Scoring",
          icon: <Award className="h-4 w-4" />,
          href: "/admin/ai-scoring",
        },
        {
          title: "Content Generation",
          icon: <FileText className="h-4 w-4" />,
          href: "/admin/ai-generation",
        },
        {
          title: "Safety & Moderation",
          icon: <Shield className="h-4 w-4" />,
          href: "/admin/ai-safety",
        },
      ],
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/admin/settings",
    },
  ]

  return (
    <>
      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button variant="outline" size="icon" onClick={toggle} className="rounded-full">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 shadow-sm lg:static lg:w-auto"
          >
            <div className="flex h-16 items-center border-b px-6">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-neo-mint to-purist-blue flex items-center justify-center text-white font-bold">
                  A
                </div>
                <span className="text-xl font-bold">Admin</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={toggle} className="absolute right-4 top-3.5 lg:hidden">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-4rem)] py-4">
              <div className="px-3 space-y-1">
                {sidebarItems.map((item, i) => (
                  <div key={i} className="mb-2">
                    {item.href ? (
                      <Link href={item.href}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-start ${
                            isActive(item.href)
                              ? "bg-gradient-to-r from-neo-mint/20 to-purist-blue/20 text-foreground font-medium"
                              : ""
                          }`}
                        >
                          {item.icon}
                          <span className="ml-2">{item.title}</span>
                        </Button>
                      </Link>
                    ) : (
                      <div className="space-y-1">
                        <Button
                          variant="ghost"
                          className="w-full justify-between"
                          onClick={() => item.group && toggleGroup(item.group)}
                        >
                          <div className="flex items-center">
                            {item.icon}
                            <span className="ml-2">{item.title}</span>
                          </div>
                          {item.group && (
                            <div>
                              {openGroups[item.group] ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </div>
                          )}
                        </Button>

                        {item.group && openGroups[item.group] && item.items && (
                          <div className="ml-4 pl-2 border-l space-y-1">
                            {item.items.map((subItem, j) => (
                              <Link key={j} href={subItem.href}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`w-full justify-start ${
                                    isActive(subItem.href)
                                      ? "bg-gradient-to-r from-neo-mint/20 to-purist-blue/20 text-foreground font-medium"
                                      : ""
                                  }`}
                                >
                                  {subItem.icon}
                                  <span className="ml-2">{subItem.title}</span>
                                </Button>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-4 px-3 border-t">
                <Link href="/">
                  <Button variant="ghost" className="w-full justify-start">
                    <Home className="h-5 w-5 mr-2" />
                    Back to Site
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </Button>
              </div>
            </ScrollArea>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
