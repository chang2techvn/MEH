"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface UserPaginationProps {
  currentPage: number
  totalPages: number
  setCurrentPage: (page: number) => void
  startIndex: number
  itemsPerPage: number
  filteredUsersLength: number
}

export const UserPagination = ({
  currentPage,
  totalPages,
  setCurrentPage,
  startIndex,
  itemsPerPage,
  filteredUsersLength,
}: UserPaginationProps) => {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between p-4 border-t border-muted/30">
      <div className="text-sm text-muted-foreground">
        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredUsersLength)} of{" "}
        {filteredUsersLength} users
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 rounded-full hover:bg-neo-mint/10 dark:hover:bg-purist-blue/10 transition-all duration-300"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
            const pageNumber =
              currentPage > 3 && totalPages > 5
                ? currentPage - 3 + index + (index >= 3 ? totalPages - currentPage : 0)
                : index + 1

            return (
              <Button
                key={index}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="icon"
                onClick={() => setCurrentPage(pageNumber)}
                className={`h-8 w-8 rounded-full transition-all duration-300 ${
                  currentPage === pageNumber
                    ? "bg-neo-mint dark:bg-purist-blue text-white shadow-md"
                    : "hover:bg-neo-mint/10 dark:hover:bg-purist-blue/10"
                }`}
              >
                {pageNumber}
              </Button>
            )
          })}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 rounded-full hover:bg-neo-mint/10 dark:hover:bg-purist-blue/10 transition-all duration-300"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
