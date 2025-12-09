"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
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
  bookings: {
    label: "Booking",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

interface BookingLineChartProps {
  data: {
    date: string;
    bookings: number;
  }[];
}

export function BookingLineChart({ data }: BookingLineChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Booking Harian</CardTitle>
        <CardDescription>30 hari terakhir</CardDescription>
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
              tickFormatter={(value) => value.slice(0, 3)}
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
              formatter={(value: number) => [`${value} booking`, "Total"]}
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
    </Card>
  );
}
