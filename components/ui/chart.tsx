"use client"
import {
  AreaChart as AreaChartPrimitive,
  BarChart as BarChartPrimitive,
  LineChart as LineChartPrimitive,
} from "@tremor/react"

interface ChartProps {
  data: any[]
  index: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
  className?: string
  showLegend?: boolean
  showAnimation?: boolean
  showTooltip?: boolean
  showGridLines?: boolean
  startEndOnly?: boolean
  yAxisWidth?: number
}

export function AreaChart({
  data,
  index,
  categories,
  colors,
  valueFormatter,
  className,
  showLegend = false,
  showAnimation = true,
  showTooltip = true,
  showGridLines = true,
  startEndOnly = false,
  yAxisWidth = 56,
}: ChartProps) {
  return (
    <AreaChartPrimitive
      data={data}
      index={index}
      categories={categories}
      colors={colors}
      valueFormatter={valueFormatter}
      showLegend={showLegend}
      showAnimation={showAnimation}
      showTooltip={showTooltip}
      showGridLines={showGridLines}
      startEndOnly={startEndOnly}
      yAxisWidth={yAxisWidth}
      className={className}
    />
  )
}

export function BarChart({
  data,
  index,
  categories,
  colors,
  valueFormatter,
  className,
  showLegend = false,
  showAnimation = true,
  showTooltip = true,
  showGridLines = true,
  startEndOnly = false,
  yAxisWidth = 56,
}: ChartProps) {
  return (
    <BarChartPrimitive
      data={data}
      index={index}
      categories={categories}
      colors={colors}
      valueFormatter={valueFormatter}
      showLegend={showLegend}
      showAnimation={showAnimation}
      showTooltip={showTooltip}
      showGridLines={showGridLines}
      startEndOnly={startEndOnly}
      yAxisWidth={yAxisWidth}
      className={className}
    />
  )
}

export function LineChart({
  data,
  index,
  categories,
  colors,
  valueFormatter,
  className,
  showLegend = false,
  showAnimation = true,
  showTooltip = true,
  showGridLines = true,
  startEndOnly = false,
  yAxisWidth = 56,
}: ChartProps) {
  return (
    <LineChartPrimitive
      data={data}
      index={index}
      categories={categories}
      colors={colors}
      valueFormatter={valueFormatter}
      showLegend={showLegend}
      showAnimation={showAnimation}
      showTooltip={showTooltip}
      showGridLines={showGridLines}
      startEndOnly={startEndOnly}
      yAxisWidth={yAxisWidth}
      className={className}
    />
  )
}
