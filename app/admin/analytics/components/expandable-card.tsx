"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Maximize2, Minimize2, MoreHorizontal, Download, Share2, Printer } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ExpandableCardProps } from "../types"

export const ExpandableCard = ({
  title,
  description,
  children,
  icon,
  isLoading = false,
  className,
}: ExpandableCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className={cn("transition-all duration-300", className, isExpanded ? "col-span-full" : "")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isExpanded ? "Collapse" : "Expand"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex flex-col gap-2">
                    <Button variant="ghost" size="sm" className="justify-start h-8">
                      <Download className="h-4 w-4 mr-2" /> Export
                    </Button>
                    <Button variant="ghost" size="sm" className="justify-start h-8">
                      <Share2 className="h-4 w-4 mr-2" /> Share
                    </Button>
                    <Button variant="ghost" size="sm" className="justify-start h-8">
                      <Printer className="h-4 w-4 mr-2" /> Print
                    </Button>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
