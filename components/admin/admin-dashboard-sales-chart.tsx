"use client";

import { useState } from "react";
import { ArrowUpRight, Calendar, Download } from "lucide-react";
import { formatMoney } from "@/lib/utils/money";

type DataPoint = {
  label: string;
  revenue: number;
  orders: number;
};

const periods = ["7 Days", "30 Days", "90 Days", "1 Year"] as const;

const dataByPeriod: Record<typeof periods[number], DataPoint[]> = {
  "7 Days": [
    { label: "Mon", revenue: 24500, orders: 18 },
    { label: "Tue", revenue: 31200, orders: 24 },
    { label: "Wed", revenue: 28900, orders: 20 },
    { label: "Thu", revenue: 42000, orders: 32 },
    { label: "Fri", revenue: 56400, orders: 45 },
    { label: "Sat", revenue: 68100, orders: 54 },
    { label: "Sun", revenue: 51200, orders: 39 },
  ],
  "30 Days": [
    { label: "Week 1", revenue: 145000, orders: 112 },
    { label: "Week 2", revenue: 189000, orders: 146 },
    { label: "Week 3", revenue: 215000, orders: 178 },
    { label: "Week 4", revenue: 248500, orders: 195 },
  ],
  "90 Days": [
    { label: "Month 1", revenue: 620000, orders: 480 },
    { label: "Month 2", revenue: 740000, orders: 590 },
    { label: "Month 3", revenue: 890000, orders: 710 },
  ],
  "1 Year": [
    { label: "Q1", revenue: 1850000, orders: 1450 },
    { label: "Q2", revenue: 2100000, orders: 1680 },
    { label: "Q3", revenue: 2450000, orders: 1920 },
    { label: "Q4", revenue: 2980000, orders: 2310 },
  ],
};

export function AdminDashboardSalesChart() {
  const [selectedPeriod, setSelectedPeriod] = useState<typeof periods[number]>("7 Days");
  const [activePoint, setActivePoint] = useState<DataPoint | null>(null);

  const data = dataByPeriod[selectedPeriod];
  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  // Chart dimensions
  const height = 220;
  const width = 600;
  const paddingX = 40;
  const paddingY = 30;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Build SVG path points
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1 || 1)) * chartW;
    const y = height - paddingY - (d.revenue / (maxRevenue || 1)) * chartH;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const prev = points[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1]?.x || 0},${height - paddingY} L ${points[0]?.x || 0},${height - paddingY} Z`;

  return (
    <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-foreground">Sales Overview</h2>
          <p className="text-xs text-muted-foreground">Revenue and order trends over time</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1 text-xs">
            {periods.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setSelectedPeriod(p);
                  setActivePoint(null);
                }}
                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                  selectedPeriod === p
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active hover info or summary */}
      <div className="mt-4 flex items-center gap-6 text-xs">
        <div>
          <span className="text-muted-foreground">Selected Revenue: </span>
          <span className="font-bold text-foreground">
            {activePoint ? formatMoney(activePoint.revenue) : formatMoney(data.reduce((s, d) => s + d.revenue, 0))}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Orders: </span>
          <span className="font-bold text-foreground">
            {activePoint ? activePoint.orders : data.reduce((s, d) => s + d.orders, 0)}
          </span>
        </div>
        {activePoint && (
          <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {activePoint.label}
          </span>
        )}
      </div>

      {/* Interactive SVG Chart */}
      <div className="relative mt-4 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((ratio) => {
            const y = paddingY + ratio * chartH;
            return (
              <line
                key={ratio}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.08"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#chartGradient)" className="text-foreground" />

          {/* Line stroke */}
          <path
            d={pathD}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="text-foreground"
          />

          {/* Data Points */}
          {points.map((p, i) => (
            <g
              key={i}
              className="cursor-pointer group"
              onMouseEnter={() => setActivePoint(p.data)}
              onMouseLeave={() => setActivePoint(null)}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                className={`transition-transform duration-200 fill-background stroke-2 stroke-foreground ${
                  activePoint?.label === p.data.label ? "scale-150 fill-foreground" : "hover:scale-125"
                }`}
              />
              <text
                x={p.x}
                y={height - 8}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px] font-medium"
              >
                {p.data.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
