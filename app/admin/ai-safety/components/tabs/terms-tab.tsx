"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Download, Upload, Trash2, Settings } from "lucide-react"
import type { BannedTerm } from "../../types"

interface TermsTabProps {
  bannedTerms: BannedTerm[]
  onAddTerm: (term: string, category: string, replacement: string) => void
  onRemoveTerm: (termId: string) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export function TermsTab({ bannedTerms, onAddTerm, onRemoveTerm }: TermsTabProps) {
  return (
    <div className="space-y-6">
      <motion.div variants={containerVariants} initial="hidden" animate="show">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Banned Terms & Phrases</CardTitle>
                <CardDescription>Manage words and phrases that should be automatically filtered</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Add Term
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Banned Term</DialogTitle>
                    <DialogDescription>Add a new term or phrase to be filtered from user content</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="term">Term or Phrase</Label>
                      <Input id="term" placeholder="Enter term or phrase to ban" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select defaultValue="Profanity">
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Profanity">Profanity</SelectItem>
                          <SelectItem value="Hate Speech">Hate Speech</SelectItem>
                          <SelectItem value="Harassment">Harassment</SelectItem>
                          <SelectItem value="Inappropriate">Inappropriate</SelectItem>
                          <SelectItem value="Personal Information">Personal Information</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="replacement">Replacement (Optional)</Label>
                      <Input id="replacement" placeholder="e.g., ****, [redacted]" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Add Term</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Term</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Replacement</TableHead>
                  <TableHead>Added By</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bannedTerms.map((term) => (
                  <TableRow key={term.id}>
                    <TableCell className="font-medium">{term.term}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{term.category}</Badge>
                    </TableCell>
                    <TableCell>{term.replacement || "—"}</TableCell>
                    <TableCell>{term.addedBy}</TableCell>
                    <TableCell>{new Date(term.addedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveTerm(term.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Banned Term</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-term">Term or Phrase</Label>
                                <Input id="edit-term" defaultValue={term.term} />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-category">Category</Label>
                                <Select defaultValue={term.category}>
                                  <SelectTrigger id="edit-category">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Profanity">Profanity</SelectItem>
                                    <SelectItem value="Hate Speech">Hate Speech</SelectItem>
                                    <SelectItem value="Harassment">Harassment</SelectItem>
                                    <SelectItem value="Inappropriate">Inappropriate</SelectItem>
                                    <SelectItem value="Personal Information">Personal Information</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-replacement">Replacement</Label>
                                <Input id="edit-replacement" defaultValue={term.replacement} />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Terms
            </Button>
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import Terms
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
