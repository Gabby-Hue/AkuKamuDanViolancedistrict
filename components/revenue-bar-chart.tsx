"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  revenue: {
    label: "Pendapatan",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface RevenueBarChartProps {
  data: {
    month: string;
    revenue: number;
  }[];
}

export function RevenueBarChart({ data }: RevenueBarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pendapatan Bulanan</CardTitle>
        <CardDescription>6 bulan terakhir</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data} margin={{ top: 8 }}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-muted/30"
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => `Rp ${(value / 1000).toFixed(0)}rb`}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent />}
              formatter={(value: number) => [
                `Rp ${value.toLocaleString("id-ID")}`,
                " Pendapatan",
              ]}
            />
            <Bar
              dataKey="revenue"
              fill="var(--color-revenue)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 20.1% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Menampilkan total pendapatan 6 bulan terakhir
        </div>
      </CardFooter>
    </Card>
  );
}
