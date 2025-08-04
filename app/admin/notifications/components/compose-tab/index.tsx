"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Edit,
  Mail,
  MessageSquare,
  Save,
  Globe,
  Send,
  Sparkles,
  Check,
  Users,
  Loader2,
  Search,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useNotificationState } from "../../hooks/use-notification-state"
import { useUserSelection } from "../../hooks/use-user-selection"
import { useTemplateSelection } from "../../hooks/use-template-selection"
import { AiAssistant } from "./ai-assistant"
import { RecipientSelection } from "./recipient-selection"
import { aiSuggestionPrompts } from "../../constants"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const ComposeTab: React.FC = () => {
  const {
    messageType,
    setMessageType,
    messageSubject,
    setMessageSubject,
    messageContent,
    setMessageContent,
    selectedScheduleType,
    isSending,
    setIsSending,
    showSuccess,
    setShowSuccess,
    selectedTimezone,
    selectedTime,
    scheduledMessages,
    setScheduledMessages,
    selectedTemplate,
    date,
  } = useNotificationState()
  const {
    filteredUsers,
    handleSelectUser,
    handleSelectAll,
    mockUsers,
    selectAll,
    searchQuery,
    setSearchQuery,
    selectedUsers,
    setSelectedUsers,
    setShowUserSelector,
    showUserSelector,
  } = useUserSelection()
  const { handleSelectTemplate, messageTemplates } = useTemplateSelection(setMessageSubject, setMessageContent)

  const [showAiAssistant, setShowAiAssistant] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState("")

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Recipient Selection */}
      <Card className="lg:col-span-1 border-none shadow-neo">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recipients
            </span>
            <Badge variant="outline" className="ml-2">
              {selectedUsers.length} selected
            </Badge>
          </CardTitle>
          <CardDescription>Select users to receive your notification</CardDescription>
        </CardHeader>
        <CardContent>
          <RecipientSelection
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
            handleSelectUser={handleSelectUser}
            mockUsers={mockUsers}
            setShowUserSelector={setShowUserSelector}
          />
        </CardContent>
      </Card>

      {/* Middle and Right Columns - Message Composition */}
      <Card className="lg:col-span-2 border-none shadow-neo">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Compose Message
            </span>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className={cn(
                        "h-8 w-8 transition-all",
                        showAiAssistant && "bg-purple-100 dark:bg-purple-900/20 text-purple-500",
                      )}
                      onClick={() => setShowAiAssistant(!showAiAssistant)}
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>AI Writing Assistant</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Save className="h-3.5 w-3.5 mr-1" />
                    Save as Template
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save as Template</DialogTitle>
                    <DialogDescription>Save your current message as a template for future use</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-name">Template Name</Label>
                      <Input id="template-name" placeholder="Enter template name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Preview</Label>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="font-medium">{messageSubject || "(No subject)"}</p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                          {messageContent || "(No content)"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Template</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Select onValueChange={(value) => handleSelectTemplate(Number.parseInt(value))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Templates" />
                </SelectTrigger>
                <SelectContent>
                  {messageTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
          <CardDescription>Create your notification message</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={messageType} onValueChange={setMessageType} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="zalo" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Zalo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Enter email subject"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <div className="relative">
                  <Textarea
                    id="content"
                    placeholder="Write your message here..."
                    className="min-h-[200px]"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                  />

                  {showAiAssistant && (
                    <AiAssistant
                      onSuggestionApply={(suggestion) => setMessageContent(suggestion)}
                      messageType={messageType}
                      selectedUsers={selectedUsers}
                      aiSuggestionPrompts={aiSuggestionPrompts}
                      messageContent={messageContent}
                      setMessageContent={setMessageContent}
                      showAiAssistant={showAiAssistant}
                      setShowAiAssistant={setShowAiAssistant}
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="include-images" />
                <Label htmlFor="include-images">Include images</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="track-opens" defaultChecked />
                <Label htmlFor="track-opens">Track opens and clicks</Label>
              </div>
            </TabsContent>

            <TabsContent value="zalo" className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="zalo-title">Title</Label>
                <Input id="zalo-title" placeholder="Enter message title" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="zalo-content">Message</Label>
                <Textarea id="zalo-content" placeholder="Write your Zalo message here..." className="min-h-[200px]" />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="include-buttons" />
                <Label htmlFor="include-buttons">Include action buttons</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="send-push" defaultChecked />
                <Label htmlFor="send-push">Send as push notification</Label>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Globe className="h-3.5 w-3.5 mr-1" />
              Preview
            </Button>
          </div>
          <Button
            onClick={() => {}}
            disabled={isSending || selectedUsers.length === 0 || !messageContent.trim()}
            className="relative"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : showSuccess ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Sent Successfully!
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Schedule
              </>
            )}

            {showSuccess && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                className="absolute inset-0 bg-green-500/20 rounded-md"
              />
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* User Selection Dialog */}
      <Dialog open={showUserSelector} onOpenChange={setShowUserSelector}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select Recipients</DialogTitle>
            <DialogDescription>Choose users to receive your notification</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select defaultValue="all">
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="teacher">Teachers</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} aria-label="Select all users" />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => handleSelectUser(user.id)}
                            aria-label={`Select ${user.name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                              <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === "Teacher" ? "outline" : "secondary"}>{user.role}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.lastActive}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        No users found matching your search
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">{selectedUsers.length} users selected</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowUserSelector(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowUserSelector(false)}>Confirm Selection</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
