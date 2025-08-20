"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { BookOpen, Clock, Edit, Eye, Trash2, Video } from "lucide-react"
import { getDifficultyBadgeColor, getDifficultyDisplayName } from "@/app/utils/challenge-classifier"
import { ANIMATION_VARIANTS } from "../constants"
import type { ChallengeGridProps } from "../types"

export default function ChallengeGrid({
  challenges,
  formatDuration,
  onEdit,
  onDelete,
  onView,
  selectedChallenges,
  toggleSelection,
}: ChallengeGridProps) {
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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={ANIMATION_VARIANTS.staggerContainer}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <AnimatePresence>
        {safeChallenges.map((challenge) => (
          <motion.div
            key={challenge.id}
            variants={ANIMATION_VARIANTS.slideUp}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="relative"
          >
            <Card
              className={`h-full border-none shadow-neo hover:shadow-neo-hover transition-shadow ${
                selectedChallenges.includes(challenge.id) ? "ring-2 ring-primary ring-offset-2" : ""
              }`}
            >
              <div className="absolute top-2 right-2 z-10">
                <Checkbox
                  checked={selectedChallenges.includes(challenge.id)}
                  onCheckedChange={() => toggleSelection(challenge.id)}
                  aria-label={`Select ${challenge.title}`}
                />
              </div>

              <div className="relative aspect-video bg-muted overflow-hidden">
                {challenge.thumbnailUrl ? (
                  <img
                    src={challenge.thumbnailUrl || "/placeholder.svg"}
                    alt={challenge.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Video className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <div className="flex items-center justify-between">
                    <Badge className={getDifficultyBadgeColor(challenge.difficulty)}>
                      {getDifficultyDisplayName(challenge.difficulty)}
                    </Badge>
                    <div className="flex items-center gap-1 text-white text-xs">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(challenge.duration || 0)}</span>
                    </div>
                  </div>
                </div>
                {challenge.featured && (
                  <div className="absolute top-0 left-0 bg-amber-500 text-white text-xs px-2 py-1">Featured</div>
                )}
              </div>

              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg line-clamp-2" title={challenge.title}>
                  {challenge.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{challenge.description}</p>

                {challenge.topics && challenge.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {challenge.topics.slice(0, 3).map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {challenge.topics.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{challenge.topics.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-4 pt-0 flex justify-between">
                <Button variant="outline" size="sm" onClick={() => onView(challenge)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(challenge)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDelete(challenge)} className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
