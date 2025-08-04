"use client"

import { motion } from "framer-motion"
import { LineChart, BarChart3, Award } from "lucide-react"
import { ExpandableCard } from "../expandable-card"
import { LineChartComponent } from "../charts/line-chart"
import { BarChartComponent } from "../charts/bar-chart"
import {
  USER_GROWTH_DATA,
  CHALLENGE_COMPLETION_DATA,
  SKILL_IMPROVEMENT_DATA,
  ANIMATION_VARIANTS,
} from "../../constants"

interface OverviewTabProps {
  isLoading: boolean
}

export const OverviewTab = ({ isLoading }: OverviewTabProps) => {
  return (
    <motion.div variants={ANIMATION_VARIANTS.container} initial="hidden" animate="show" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpandableCard
          title="User Growth"
          description="Monthly user growth over the past year"
          icon={<LineChart className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        >
          <LineChartComponent data={USER_GROWTH_DATA} isLoading={isLoading} />
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span>Current period</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span>Previous period</span>
            </div>
          </div>
        </ExpandableCard>

        <ExpandableCard
          title="Challenge Completion"
          description="Completion rates by challenge type"
          icon={<BarChart3 className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        >
          <BarChartComponent data={CHALLENGE_COMPLETION_DATA} isLoading={isLoading} />
        </ExpandableCard>
      </div>

      <ExpandableCard
        title="Skill Improvement Metrics"
        description="Average improvement across all users by skill type"
        icon={<Award className="h-5 w-5 text-primary" />}
        isLoading={isLoading}
      >
        <BarChartComponent data={SKILL_IMPROVEMENT_DATA} isLoading={isLoading} />
      </ExpandableCard>
    </motion.div>
  )
}
