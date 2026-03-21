"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ChartData } from "@/data/mentor-dashboard";

interface PerformanceChartProps {
  data: ChartData[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="name"
            tick={{ fill: "currentColor" }}
            className="text-xs text-muted-foreground"
          />
          <YAxis
            tick={{ fill: "currentColor" }}
            className="text-xs text-muted-foreground"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "12px",
            }}
            labelStyle={{ fontWeight: "600", marginBottom: "4px" }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
            }}
          />
          <Line
            type="monotone"
            dataKey="engagement"
            stroke="#3b82f6"
            strokeWidth={3}
            name="Student Engagement (%)"
            dot={{ r: 4, fill: "#3b82f6" }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="progress"
            stroke="#8b5cf6"
            strokeWidth={3}
            name="Average Progress (%)"
            dot={{ r: 4, fill: "#8b5cf6" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
