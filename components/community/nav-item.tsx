"use client"

import Link from "next/link"
import type { NavItemProps } from "./types"

export function NavItem({ icon: Icon, label, href, onClick, active = false }: NavItemProps) {
  const content = (
    <>
      <div
        className={`h-9 w-9 2xl:h-10 2xl:w-10 rounded-full flex items-center justify-center ${
          active ? "bg-neo-mint/10 dark:bg-purist-blue/10" : "bg-gray-200 dark:bg-gray-600"
        }`}
      >
        <Icon
          className={`h-5 w-5 2xl:h-6 2xl:w-6 ${active ? "text-neo-mint dark:text-purist-blue" : "text-gray-700 dark:text-gray-300"}`}
        />
      </div>
      <span className="font-medium 2xl:text-lg">{label}</span>
    </>
  )

  const baseClasses = `flex items-center gap-3 2xl:gap-4 p-2 2xl:p-3 rounded-lg transition-all duration-200 ${
    active ? "bg-gray-100 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-700"
  }`

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} w-full text-left`}
      >
        {content}
      </button>
    )
  }

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    )
  }

  return null
}
