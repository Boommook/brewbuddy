"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "./ui/chart"

export const description = "A line chart"


const chartConfig = {
  abv: {
    label: "ABV",
    color: "var(--color-harvest-orange)",
  },
} satisfies ChartConfig

export function ABVChart({
  ABVData,
}: {
  ABVData: { measuredAt: Date | string; abv: number }[]
}) {
  const chartData = ABVData.map((data) => ({
    date:
      typeof data.measuredAt === "string"
        ? data.measuredAt
        : data.measuredAt.toISOString(),
    abv: data.abv,
  }))
  return (
    <Card className="bg-antique-white-100 border-2 border-golden-orange-700 shadow-style">
      <CardHeader>
        <CardTitle>ABV Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={true} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={true}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              dataKey="abv"
              tickLine={false}
              axisLine={true}
              tickMargin={8}
              tickFormatter={(value) => value.toFixed(2)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="abv"
              type="natural"
              stroke="var(--color-harvest-orange)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
