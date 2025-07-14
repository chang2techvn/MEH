"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Home,
  Users,
  BookOpen,
  X,
  Bookmark,
} from "lucide-react"
import { UserProfileCard } from "./user-profile-card"
import { NavItem } from "./nav-item"
import { GroupNavItem } from "./group-nav-item"
import { SavedPostsModal } from "./saved-posts-modal"
import type { Group } from "./types"

interface LeftSidebarProps {
  showLeftSidebar: boolean
  setShowLeftSidebar: (show: boolean) => void
  groups: Group[]
}

export function LeftSidebar({ showLeftSidebar, setShowLeftSidebar, groups }: LeftSidebarProps) {
  const [showSavedModal, setShowSavedModal] = useState(false)

  return (
    <>
      <aside
      className={`
        fixed inset-0 z-50 lg:static lg:z-auto lg:w-[240px] xl:w-[280px]
        ${showLeftSidebar ? "block" : "hidden lg:block"}
      `}
    >
      {/* Mobile overlay */}
      {showLeftSidebar && (
        <div
          className="absolute inset-0 bg-black/50 lg:hidden"
          onClick={() => setShowLeftSidebar(false)}
        ></div>
      )}

      <div
        className={`
        relative h-full w-[280px] sm:w-[320px] lg:w-full 
        bg-white dark:bg-gray-800 lg:bg-transparent lg:dark:bg-transparent
        overflow-auto lg:sticky lg:top-[4.5rem] lg:h-[calc(100vh-4.5rem)]
      `}
      >
        {/* Mobile header */}
        {showLeftSidebar && (
          <div className="p-4 flex justify-between items-center border-b lg:hidden">
            <h2 className="font-semibold">Menu</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowLeftSidebar(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}

        <ScrollArea className="h-full py-4">
          <div className="space-y-1 px-2">
            <UserProfileCard />

            <NavItem icon={Home} label="Challenges" href="/" />
            <NavItem icon={BookOpen} label="Al Learning Hub" href="/resources" />

            <Separator className="my-4" />

            <h3 className="font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase px-4 mb-2">
              Explore
            </h3>

            <NavItem icon={Users} label="Events" href="/events" />
            <NavItem 
              icon={Bookmark} 
              label="Saved" 
              onClick={() => setShowSavedModal(true)}
            />

            <Separator className="my-4" />

            <div className="px-4 text-xs text-gray-500 dark:text-gray-400">
              <p>Privacy · Terms · Advertising · Cookies · More · EnglishMastery © 2025</p>
            </div>
          </div>
        </ScrollArea>
      </div>
    </aside>

    <SavedPostsModal 
      isOpen={showSavedModal} 
      onClose={() => setShowSavedModal(false)}
    />
  </>
  )
}
