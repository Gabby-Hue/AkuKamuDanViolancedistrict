"use client"

import { TrendingUp } from "lucide-react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  venues: {
    label: "Total Venue",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

interface AdminVenueGrowthChartProps {
  data: {
    month: string;
    venues: number;
  }[];
}

export function AdminVenueGrowthChart({ data }: AdminVenueGrowthChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pertumbuhan Venue</CardTitle>
        <CardDescription>Jumlah venue bergabung 6 bulan terakhir</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
              formatter={(value: number) => [`${value} venue`, " total"]}
            />
            <Line
              dataKey="venues"
              type="linear"
              stroke="var(--color-venues)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-venues)",
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 6,
                className: "fill-primary",
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}