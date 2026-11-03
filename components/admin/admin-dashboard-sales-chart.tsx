"use client";

import { useState, useEffect, useRef } from "react";
import { TrendingUp, ShoppingCart, Calendar } from "lucide-react";
import { formatMoney } from "@/lib/utils/money";

type DataPoint = {
  label: string;
  revenue: number;
  orders: number;
};

const periods = ["7 Days", "30 Days", "90 Days", "1 Year"] as const;
type PeriodType = typeof periods[number];

export function AdminDashboardSalesChart() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("7 Days");
  const [activePoint, setActivePoint] = useState<DataPoint | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSales() {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/admin/analytics/sales?period=${encodeURIComponent(selectedPeriod)}`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        if (!cancelled && Array.isArray(json.points)) {
          setData(json.points);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[SalesChart] Failed to load sales:", err);
          setData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadSales();

    return () => {
      cancelled = true;
    };
  }, [selectedPeriod]);

  const safeData: DataPoint[] =
    data.length > 0
      ? data
      : [
          { label: "P1", revenue: 0, orders: 0 },
          { label: "P2", revenue: 0, orders: 0 },
          { label: "P3", revenue: 0, orders: 0 },
          { label: "P4", revenue: 0, orders: 0 },
          { label: "P5", revenue: 0, orders: 0 },
          { label: "P6", revenue: 0, orders: 0 },
          { label: "P7", revenue: 0, orders: 0 }
        ];

  const totalRevenue = safeData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = safeData.reduce((sum, d) => sum + d.orders, 0);
  const maxRevenue = Math.max(...safeData.map((d) => d.revenue), 100);

  // SVG dimensions & margins
  const height = 240;
  const width = 640;
  const paddingLeft = 56;
  const paddingRight = 24;
  const paddingTop = 28;
  const paddingBottom = 36;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  // Build coordinates for each data point
  const points = safeData.map((d, i) => {
    const x = paddingLeft + (i / (safeData.length - 1 || 1)) * chartW;
    const y =
      maxRevenue > 0
        ? height - paddingBottom - (d.revenue / maxRevenue) * chartH
        : height - paddingBottom;
    return { x, y, data: d, index: i };
  });

  // Smooth cubic bezier spline
  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    const prev = points[i - 1];
    const cx1 = ((prev.x + p.x) / 2).toFixed(1);
    const cx2 = cx1;
    return `${acc} C ${cx1},${prev.y.toFixed(1)} ${cx2},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }, "");

  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const baselineY = height - paddingBottom;
  const areaD = `${pathD} L ${lastPoint?.x || 0},${baselineY} L ${firstPoint?.x || 0},${baselineY} Z`;

  // Y-axis grid ticks (4 intervals)
  const yTicks = [1, 0.66, 0.33, 0].map((ratio) => {
    const val = Math.round(maxRevenue * ratio);
    const y = paddingTop + (1 - ratio) * chartH;
    return { val, y };
  });

  const activeCoord =
    activeIndex !== null && points[activeIndex] ? points[activeIndex] : null;

  return (
    <div className="rounded-xl border border-border bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
      {/* Chart Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground tracking-tight">
              Sales Revenue &amp; Trends
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Historical sales volume and order frequency across the selected window
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center rounded-lg border border-border bg-stone-50 p-1 text-xs self-start sm:self-auto shadow-2xs">
          {periods.map((p) => {
            const isSelected = selectedPeriod === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setSelectedPeriod(p);
                  setActivePoint(null);
                  setActiveIndex(null);
                }}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Period Quick Metrics Strip */}
      <div className="mt-4 flex flex-wrap items-center gap-4 sm:gap-8 border-y border-border/60 py-3 text-xs">
        <div>
          <span className="text-[11px] font-medium text-muted-foreground block">
            {activePoint ? `Selected (${activePoint.label})` : `${selectedPeriod} Revenue`}
          </span>
          <span className="text-sm sm:text-base font-bold text-foreground tabular-nums">
            {activePoint ? formatMoney(activePoint.revenue) : formatMoney(totalRevenue)}
          </span>
        </div>

        <div className="border-l border-border/80 pl-4 sm:pl-8">
          <span className="text-[11px] font-medium text-muted-foreground block">
            {activePoint ? `Orders on ${activePoint.label}` : `${selectedPeriod} Orders`}
          </span>
          <span className="text-sm sm:text-base font-bold text-foreground tabular-nums">
            {activePoint ? `${activePoint.orders} orders` : `${totalOrders} orders`}
          </span>
        </div>

        <div className="border-l border-border/80 pl-4 sm:pl-8 hidden md:block">
          <span className="text-[11px] font-medium text-muted-foreground block">
            Average Basket / AOV
          </span>
          <span className="text-sm sm:text-base font-bold text-foreground tabular-nums">
            {activePoint && activePoint.orders > 0
              ? formatMoney(Math.round(activePoint.revenue / activePoint.orders))
              : totalOrders > 0
              ? formatMoney(Math.round(totalRevenue / totalOrders))
              : "৳0"}
          </span>
        </div>
      </div>

      {/* Interactive SVG Chart Canvas */}
      <div className="relative mt-4 w-full">
        {loading ? (
          <div className="flex h-56 w-full items-center justify-center rounded-lg bg-stone-50 animate-pulse text-xs text-muted-foreground font-medium">
            Loading sales data...
          </div>
        ) : (
          <div className="relative w-full overflow-hidden">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto overflow-visible select-none"
              onMouseLeave={() => {
                setActivePoint(null);
                setActiveIndex(null);
              }}
            >
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#111827" stopOpacity="0.14" />
                  <stop offset="85%" stopColor="#111827" stopOpacity="0.02" />
                  <stop offset="100%" stopColor="#111827" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines & Y-Axis Labels */}
              {yTicks.map(({ val, y }, idx) => (
                <g key={idx}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="#E5E7EB"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    className="fill-muted-foreground text-[9.5px] font-medium tabular-nums font-mono"
                  >
                    ৳{val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                  </text>
                </g>
              ))}

              {/* Area Under Curve */}
              <path d={areaD} fill="url(#salesGradient)" />

              {/* Primary Curve Stroke */}
              <path
                d={pathD}
                fill="none"
                stroke="#111827"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Vertical Crosshair Line on Active Point */}
              {activeCoord && (
                <line
                  x1={activeCoord.x}
                  y1={paddingTop}
                  x2={activeCoord.x}
                  y2={baselineY}
                  stroke="#111827"
                  strokeWidth="1.25"
                  strokeDasharray="2 2"
                  strokeOpacity="0.5"
                />
              )}

              {/* Interactive Point Markers & X-Axis Labels */}
              {points.map((p, i) => {
                const isHovered = activeIndex === i;
                return (
                  <g
                    key={i}
                    className="cursor-pointer"
                    onMouseEnter={() => {
                      setActivePoint(p.data);
                      setActiveIndex(i);
                    }}
                  >
                    {/* Invisible widened hit target */}
                    <rect
                      x={p.x - 14}
                      y={paddingTop}
                      width={28}
                      height={chartH}
                      fill="transparent"
                    />

                    {/* Outer glow ring when active */}
                    {isHovered && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="8"
                        className="fill-stone-900/15 animate-ping"
                      />
                    )}

                    {/* Point Dot */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 5.5 : 3.5}
                      className={`transition-all duration-150 ${
                        isHovered
                          ? "fill-stone-900 stroke-2 stroke-white shadow-sm"
                          : "fill-white stroke-2 stroke-stone-900 hover:fill-stone-900"
                      }`}
                    />

                    {/* X-Axis Tick Label */}
                    <text
                      x={p.x}
                      y={height - 10}
                      textAnchor="middle"
                      className={`text-[10px] tabular-nums font-medium transition-colors ${
                        isHovered
                          ? "fill-stone-950 font-bold"
                          : "fill-muted-foreground"
                      }`}
                    >
                      {p.data.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Floating Tooltip Card */}
            {activeCoord && activePoint && (
              <div
                className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-stone-950 px-3 py-2 text-white shadow-lg text-left"
                style={{
                  left: `${(activeCoord.x / width) * 100}%`,
                  top: `${Math.max(12, (activeCoord.y / height) * 100 - 4)}%`
                }}
              >
                <div className="flex items-center justify-between gap-3 text-[10px] text-stone-400 font-semibold uppercase tracking-wider border-b border-stone-800 pb-1">
                  <span>{activePoint.label}</span>
                  <span>{selectedPeriod}</span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-4 text-xs font-bold tabular-nums">
                  <span className="text-stone-300 font-normal">Revenue:</span>
                  <span className="text-white">{formatMoney(activePoint.revenue)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-xs font-bold tabular-nums">
                  <span className="text-stone-300 font-normal">Orders:</span>
                  <span className="text-white">{activePoint.orders}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
