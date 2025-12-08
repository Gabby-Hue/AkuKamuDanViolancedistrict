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
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          +36 venue baru bulan ini <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Menampilkan pertumbuhan venue yang bergabung dengan platform
        </div>
      </CardFooter>
    </Card>
  )
}