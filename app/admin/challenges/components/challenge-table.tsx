"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BookOpen, Clock, Edit, Eye, MoreHorizontal, Trash2, Video } from "lucide-react"
import { getDifficultyBadgeColor, getDifficultyDisplayName } from "@/app/utils/challenge-classifier"
import { ANIMATION_VARIANTS } from "../constants"
import type { ChallengeTableProps } from "../types"

export default function ChallengeTable({
  challenges,
  formatDuration,
  formatDate,
  onEdit,
  onDelete,
  onView,
  selectedChallenges,
  toggleSelection,
  toggleSelectAll,
  allSelected,
}: ChallengeTableProps) {
  // Ensure challenges is always an array
  const safeChallenges = Array.isArray(challenges) ? challenges : []
  
  if (safeChallenges.length === 0) {
    return (
      <motion.div initial="hidden" animate="visible" variants={ANIMATION_VARIANTS.fadeIn}>
        <Card className="border-none shadow-neo">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No challenges found matching your criteria</p>
            <Button className="bg-gradient-to-r from-neo-mint to-purist-blue text-white">Create a Challenge</Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={ANIMATION_VARIANTS.staggerContainer}>
      <Card className="border-none shadow-neo overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all challenges"
                  />
                </TableHead>
                <TableHead className="w-[300px]">Challenge</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Topics</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {safeChallenges.map((challenge) => (
                  <motion.tr
                    key={challenge.id}
                    variants={ANIMATION_VARIANTS.slideUp}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className={`${
                      selectedChallenges.includes(challenge.id) ? "bg-muted/50" : ""
                    } hover:bg-muted/30 transition-colors`}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedChallenges.includes(challenge.id)}
                        onCheckedChange={() => toggleSelection(challenge.id)}
                        aria-label={`Select ${challenge.title}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 bg-muted rounded overflow-hidden">
                          {challenge.thumbnailUrl ? (
                            <img
                              src={challenge.thumbnailUrl || "/placeholder.svg"}
                              alt={challenge.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <Video className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="truncate max-w-[200px]" title={challenge.title}>
                          {challenge.title}
                          {challenge.featured && (
                            <Badge
                              className="ml-2 bg-amber-500/20 text-amber-600 hover:bg-amber-500/30"
                              variant="secondary"
                            >
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getDifficultyBadgeColor(challenge.difficulty)}>
                        {getDifficultyDisplayName(challenge.difficulty)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{formatDuration(challenge.duration || 0)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {challenge.topics && challenge.topics.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {challenge.topics.slice(0, 2).map((topic, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                          {challenge.topics.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{challenge.topics.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">No topics</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDate(
                        challenge.createdAt instanceof Date 
                          ? challenge.createdAt.toISOString() 
                          : challenge.createdAt || challenge.created_at || new Date().toISOString()
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(challenge)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(challenge)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onDelete(challenge)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </Card>
    </motion.div>
  )
}
