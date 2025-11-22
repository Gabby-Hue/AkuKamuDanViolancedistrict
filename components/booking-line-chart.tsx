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
        <CardTitle>Laporan Booking Harian</CardTitle>
        <CardDescription>7 hari terakhir</CardDescription>
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
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
              formatter={(value: number) => [`${value} booking`, " total"]}
            />
            <Line
              dataKey="bookings"
              type="linear"
              stroke="var(--color-bookings)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-bookings)",
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
          Rata-rata 18 booking per hari <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Menampilkan total booking harian untuk 7 hari terakhir
        </div>
      </CardFooter>
    </Card>
  );
}
