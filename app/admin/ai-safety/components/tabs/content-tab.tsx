"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Eye, MessageSquare } from "lucide-react"
import type { FlaggedContent } from "../../types"

interface ContentTabProps {
  filteredFlaggedContent: FlaggedContent[]
  searchQuery: string
  onSearchChange: (query: string) => void
  onUpdateStatus: (contentId: string, status: "pending" | "reviewed" | "approved" | "rejected") => void
}

export function ContentTab({ filteredFlaggedContent, searchQuery, onSearchChange, onUpdateStatus }: ContentTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Flagged Content</CardTitle>
              <CardDescription>Review and manage content that has been flagged by the AI safety system</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search flagged content..."
                className="pl-8 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Rule</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFlaggedContent.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Search className="h-8 w-8 mb-2" />
                        <p>No flagged content found</p>
                        <p className="text-sm">Try adjusting your search query</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFlaggedContent.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.userName}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{item.content}</TableCell>
                      <TableCell>{item.rule}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.severity === "critical"
                              ? "destructive"
                              : item.severity === "high"
                                ? "destructive"
                                : item.severity === "medium"
                                  ? "outline"
                                  : "secondary"
                          }
                        >
                          {item.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.score}%</TableCell>
                      <TableCell>
                        <Select value={item.status} onValueChange={(value: any) => onUpdateStatus(item.id, value)}>
                          <SelectTrigger className="w-[110px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Send Feedback to User</DialogTitle>
                                <DialogDescription>
                                  Provide feedback about why this content was flagged
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>Flagged Content</Label>
                                  <div className="p-3 bg-muted rounded-md text-sm">{item.content}</div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="feedback">Feedback Message</Label>
                                  <Textarea
                                    id="feedback"
                                    placeholder="Explain why this content was flagged and how it can be improved..."
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="submit">Send Feedback</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
