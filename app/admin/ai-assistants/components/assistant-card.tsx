"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Zap, Edit, Trash2 } from "lucide-react"
import type { Assistant } from "../types"
import { categoryOptions } from "../constants"
import { formatDate } from "../utils/format"

interface AssistantCardProps {
  assistant: Assistant
  onToggleActive: (id: string, currentStatus: boolean) => void
  onView: (assistant: Assistant) => void
  onEdit: (assistant: Assistant) => void
  onDelete: (assistant: Assistant) => void
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
}

export function AssistantCard({ assistant, onToggleActive, onView, onEdit, onDelete }: AssistantCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      layout
      className="h-full"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card
        className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300 overflow-hidden border-t-4 relative"
        style={{
          borderTopColor: assistant.isActive ? "hsl(var(--neo-mint))" : "hsl(var(--muted-foreground))",
        }}
      >
        {!assistant.isActive && (
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800 text-gray-500">
              Inactive
            </Badge>
          </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12 border">
              <AvatarImage src={assistant.avatar || "/placeholder.svg"} alt={assistant.name} />
              <AvatarFallback>
                {assistant.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="font-medium text-lg leading-none">{assistant.name}</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="font-normal text-xs">
                  {assistant.model}
                </Badge>
                <Badge variant="outline" className="font-normal text-xs">
                  {categoryOptions.find((c) => c.value === assistant.category)?.label || assistant.category}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="py-2 flex-grow">
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{assistant.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {assistant.capabilities.slice(0, 3).map((cap) => (
              <Badge key={cap} variant="outline" className="text-xs">
                {cap}
              </Badge>
            ))}
            {assistant.capabilities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{assistant.capabilities.length - 3} more
              </Badge>
            )}
          </div>

          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-between mb-1">
              <span>Created:</span>
              <span>{formatDate(assistant.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Last updated:</span>
              <span>{formatDate(assistant.updatedAt)}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-4 pb-3 flex justify-between items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <Switch
                    checked={assistant.isActive}
                    onCheckedChange={() => onToggleActive(assistant.id, assistant.isActive)}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">{assistant.isActive ? "Deactivate" : "Activate"} assistant</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => onView(assistant)} className="h-8 w-8">
                    <Zap className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">View details</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(assistant)} className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Edit assistant</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(assistant)}
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Delete assistant</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
