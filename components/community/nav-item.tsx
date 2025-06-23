"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type { NavItemProps } from "./types"

export function NavItem({ icon: Icon, label, href, active = false }: NavItemProps) {
  const router = useRouter()

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
        active ? "bg-gray-100 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
      onClick={(e) => {
        e.preventDefault()
        router.push(href)
      }}
    >
      <div
        className={`h-9 w-9 rounded-full flex items-center justify-center ${
          active ? "bg-neo-mint/10 dark:bg-purist-blue/10" : "bg-gray-200 dark:bg-gray-600"
        }`}
      >
        <Icon
          className={`h-5 w-5 ${active ? "text-neo-mint dark:text-purist-blue" : "text-gray-700 dark:text-gray-300"}`}
        />
      </div>
      <span className="font-medium">{label}</span>
    </Link>
  )
}
