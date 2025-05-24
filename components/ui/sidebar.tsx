"use client"

import type * as React from "react"
import { createContext, useContext, useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronLeft } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarContextType {
  isOpen: boolean
  toggle: () => void
  close: () => void
  open: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)

  const toggle = () => setIsOpen((prev) => !prev)
  const close = () => setIsOpen(false)
  const open = () => setIsOpen(true)

  return <SidebarContext.Provider value={{ isOpen, toggle, close, open }}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

const sidebarVariants = cva("flex flex-col h-screen border-r bg-background transition-all duration-300", {
  variants: {
    variant: {
      default: "w-64",
      inset: "w-64",
    },
    state: {
      expanded: "",
      collapsed: "w-16",
    },
  },
  defaultVariants: {
    variant: "default",
    state: "expanded",
  },
})

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sidebarVariants> {}

export function Sidebar({ className, variant, ...props }: SidebarProps) {
  const { isOpen } = useSidebar()
  const state = isOpen ? "expanded" : "collapsed"
  return <div className={cn(sidebarVariants({ variant, state }), className)} {...props} />
}

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarHeader({ className, children, ...props }: SidebarHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between p-4 border-b", className)} {...props}>
      {children}
    </div>
  )
}

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarContent({ className, children, ...props }: SidebarContentProps) {
  return (
    <div className={cn("flex-1 overflow-auto p-4", className)} {...props}>
      {children}
    </div>
  )
}

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarFooter({ className, children, ...props }: SidebarFooterProps) {
  return (
    <div className={cn("p-4 border-t", className)} {...props}>
      {children}
    </div>
  )
}

interface SidebarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  active?: boolean
  as?: React.ElementType
}

export function SidebarItem({ className, children, icon, active, as: Component = "div", ...props }: SidebarItemProps) {
  const { isOpen } = useSidebar()
  const state = isOpen ? "expanded" : "collapsed"

  return (
    <Component
      className={cn(
        "flex items-center py-2 px-3 rounded-md cursor-pointer transition-colors",
        active ? "bg-muted text-primary" : "hover:bg-muted/50",
        state === "collapsed" ? "justify-center" : "",
        className,
      )}
      {...props}
    >
      {icon && <div className={cn("text-muted-foreground", active && "text-primary")}>{icon}</div>}
      {state === "expanded" && <div className={cn("ml-3 truncate")}>{children}</div>}
    </Component>
  )
}

interface SidebarToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function SidebarToggle({ className, ...props }: SidebarToggleProps) {
  const { toggle } = useSidebar()
  return (
    <Button variant="ghost" size="icon" className={cn("", className)} onClick={toggle} {...props}>
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}
