"use client"

import { TrendingUp } from "lucide-react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Area, AreaChart } from "recharts"
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
  bookings: {
    label: "Booking",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

interface AdminBookingTrendChartProps {
  data: {
    date: string;
    bookings: number;
  }[];
}

export function AdminBookingTrendChart({ data }: AdminBookingTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trend Booking Harian</CardTitle>
        <CardDescription>Booking selama 7 hari terakhir</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 8,
            }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-muted/30"
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent />}
              formatter={(value: number) => [`${value} booking`, " total"]}
            />
            <Line
              dataKey="bookings"
              type="monotone"
              stroke="var(--color-bookings)"
              strokeWidth={3}
              dot={{
                fill: "var(--color-bookings)",
                stroke: "white",
                strokeWidth: 2,
                r: 5,
              }}
              activeDot={{
                fill: "var(--color-bookings)",
                stroke: "white",
                strokeWidth: 3,
                r: 7,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Rata-rata 22 booking per hari <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Menampilkan total booking harian untuk 7 hari terakhir
        </div>
      </CardFooter>
    </Card>
  )
}