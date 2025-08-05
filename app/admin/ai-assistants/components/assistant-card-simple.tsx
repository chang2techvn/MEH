"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, Trash2, Eye } from "lucide-react"
import type { Assistant } from "../types"

interface AssistantCardProps {
  assistant: Assistant
  onToggleActive: (id: string, currentStatus: boolean) => void
  onView: (assistant: Assistant) => void
  onEdit: (assistant: Assistant) => void
  onDelete: (assistant: Assistant) => void
}

export function AssistantCard({ assistant, onToggleActive, onView, onEdit, onDelete }: AssistantCardProps) {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300 border-t-4" style={{
      borderTopColor: assistant.isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
    }}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={assistant.avatar} alt={assistant.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
              {assistant.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-semibold text-base truncate">{assistant.name}</h3>
              <Badge 
                variant={assistant.isActive ? "default" : "secondary"} 
                className="text-xs flex-shrink-0"
              >
                {assistant.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground font-mono">{assistant.model}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow pb-4">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {assistant.description}
        </p>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground">Category:</span>
              <div className="font-medium capitalize">{assistant.category}</div>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Role:</span>
              <div className="font-medium">{assistant.role}</div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">Capabilities:</span>
            <div className="flex flex-wrap gap-1">
              {assistant.capabilities.slice(0, 3).map((cap) => (
                <Badge key={cap} variant="outline" className="text-xs py-0.5 px-2">
                  {cap}
                </Badge>
              ))}
              {assistant.capabilities.length > 3 && (
                <Badge variant="outline" className="text-xs py-0.5 px-2 bg-muted">
                  +{assistant.capabilities.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 pb-4 flex justify-between items-center border-t">
        <div className="flex items-center gap-2">
          <Switch
            checked={assistant.isActive}
            onCheckedChange={() => onToggleActive(assistant.id, assistant.isActive)}
          />
          <span className="text-xs text-muted-foreground">
            {assistant.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onView(assistant)} 
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Eye className="h-4 w-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onEdit(assistant)} 
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(assistant)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
