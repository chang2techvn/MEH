"use client"

import React from "react"

interface PageHeaderProps {
  title: string
  description?: string
  centered?: boolean
  className?: string
  children?: React.ReactNode
}

export default function PageHeader({ 
  title, 
  description, 
  centered = false, 
  className = "",
  children
}: PageHeaderProps) {
  return (
    <div className={`container py-12 md:py-16 ${centered ? "text-center" : ""} ${className}`}>
      <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="mt-4 text-xl text-muted-foreground max-w-3xl">
          {description}
        </p>
      )}
    </div>
  )
}
