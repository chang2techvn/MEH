"use client"

import type React from "react"

import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const ActivityChart: React.FC = () => {
  return (
    <Card className="md:col-span-4 border-none shadow-neo">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-semibold">Notification Activity</CardTitle>
          <CardDescription>Message engagement over the last 30 days</CardDescription>
        </div>
        <Badge variant="outline" className="bg-purist-blue/10">
          <ArrowUpRight className="h-3 w-3 mr-1 text-purist-blue" />
          Improving
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="h-[240px] w-full rounded-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center relative overflow-hidden">
          {/* Simulated chart with animated bars */}
          <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
            {[40, 65, 35, 85, 55, 45, 70, 60, 75, 50, 90, 65].map((height, i) => (
              <motion.div
                key={i}
                className="w-4 bg-gradient-to-t from-purist-blue to-neo-mint rounded-t-md"
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{
                  delay: i * 0.05,
                  duration: 0.7,
                  type: "spring",
                  stiffness: 50,
                }}
              />
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
        </div>
      </CardContent>
    </Card>
  )
}
