"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
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
  revenue: {
    label: "Revenue (Juta)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

interface AdminRevenueChartProps {
  data: {
    month: string;
    revenue: number;
  }[];
}

export function AdminRevenueChart({ data }: AdminRevenueChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Sistem</CardTitle>
        <CardDescription>Pendapatan platform 6 bulan terakhir</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => `Rp ${value}jt`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
              formatter={(value: number) => [`Rp ${value} juta`, " revenue"]}
            />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}