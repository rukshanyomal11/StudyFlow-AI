"use client";

import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AdminAnalyticsPoint } from "@/data/admin-dashboard";

interface AdminAnalyticsChartProps {
  data: AdminAnalyticsPoint[];
}

function formatTick(value: number) {
  if (value >= 1000) {
    return `${Math.round(value / 100) / 10}k`;
  }

  return `${value}`;
}

export default function AdminAnalyticsChart({
  data,
}: AdminAnalyticsChartProps) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="adminNewUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#eb6b39" stopOpacity={0.34} />
              <stop offset="95%" stopColor="#eb6b39" stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="adminActiveUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2b7a78" stopOpacity={0.38} />
              <stop offset="95%" stopColor="#2b7a78" stopOpacity={0.04} />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical={false}
            stroke="rgba(15, 23, 42, 0.08)"
            strokeDasharray="4 4"
          />

          <XAxis
            axisLine={false}
            dataKey="period"
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickLine={false}
            tickMargin={12}
          />

          <YAxis
            axisLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickFormatter={formatTick}
            tickLine={false}
            width={52}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.98)",
              border: "1px solid rgba(15, 23, 42, 0.08)",
              borderRadius: "18px",
              boxShadow: "0 20px 50px rgba(15, 23, 42, 0.12)",
              padding: "12px 14px",
            }}
            formatter={(value: number, name: string) => [
              new Intl.NumberFormat("en-US").format(value),
              name === "newUsers" ? "New users" : "Active users",
            ]}
            labelStyle={{ color: "#0f172a", fontWeight: 600 }}
          />

          <Area
            dataKey="activeUsers"
            fill="url(#adminActiveUsers)"
            name="Active users"
            stroke="#2b7a78"
            strokeWidth={3}
            type="monotone"
          />

          <Area
            dataKey="newUsers"
            fill="url(#adminNewUsers)"
            name="New users"
            stroke="#eb6b39"
            strokeWidth={3}
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
