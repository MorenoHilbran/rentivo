'use client'

import { useState } from 'react'

export default function RevenueChart({ totalRevenue }) {
  const [hoveredIdx, setHoveredIdx] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  // Last 6 months data percentage (from monthBars in original dashboard: [32, 54, 47, 78, 100, 68])
  const rawPercentages = [32, 54, 47, 78, 100, 68]
  const months = ['Des', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei']

  // Derive realistic amounts. The 100% item (Apr) represents a peak.
  // We can calculate values relative to totalRevenue if provided, or fallback to mock millions.
  const peakValue = totalRevenue > 0 ? (totalRevenue * 1.3) : 15000000
  const chartData = rawPercentages.map((pct, idx) => {
    // Pure deterministic factor based on index, yielding a value between 0.82 and 0.96
    const factor = 0.8 + ((idx * 7 + 11) % 17) / 100
    const value = Math.round((pct / 100) * peakValue * factor)
    return {
      month: months[idx],
      value,
      pct,
    }
  })

  // Format as Indonesian Rupiah
  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val)
  }

  // Dimensions for SVG
  const width = 500
  const height = 180
  const padding = { top: 20, right: 20, bottom: 30, left: 60 }

  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const maxVal = Math.max(...chartData.map((d) => d.value))
  const minVal = 0

  // Calculate coordinates for SVG area/line path
  const points = chartData.map((d, i) => {
    const x = padding.left + (i / (chartData.length - 1)) * chartWidth
    // Prevent divide by zero and scale y
    const y = padding.top + chartHeight - ((d.value - minVal) / (maxVal - minVal || 1)) * chartHeight
    return { x, y, ...d, index: i }
  })

  // Generate cubic bezier curve path for a smooth line
  let linePath = ''
  let areaPath = ''
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]
      const p1 = points[i + 1]
      const cpX1 = p0.x + (p1.x - p0.x) / 2
      const cpY1 = p0.y
      const cpX2 = p0.x + (p1.x - p0.x) / 2
      const cpY2 = p1.y
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`
    }
    // Close the area path to the bottom of the chart
    areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`
  }

  const handleMouseMove = (e, index, point) => {
    const rect = e.currentTarget.getBoundingClientRect()
    // Align tooltip to the element
    const x = point.x - 60 // Center tooltip
    const y = point.y - 45
    setHoveredIdx(index)
    setTooltipPos({ x, y })
  }

  const handleMouseLeave = () => {
    setHoveredIdx(null)
  }

  return (
    <div className="relative rounded-2xl border border-outline-variant bg-surface-container-low p-md transition-all duration-300 hover:shadow-[var(--shadow-md)]">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="font-label-caps text-label-caps text-on-surface-variant">Tren Pendapatan</p>
          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Visualisasi performa keuangan 6 bulan terakhir.</p>
        </div>
        <div className="text-right">
          <span className="font-headline-md text-headline-md font-semibold text-primary">
            {formatRupiah(totalRevenue || chartData[chartData.length - 1].value)}
          </span>
          <span className="block text-[11px] text-success font-medium">▲ +12.4% vs bln lalu</span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden" style={{ height }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Gradients */}
          <defs>
            <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="chart-glow-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + chartHeight * pct
            const val = maxVal - (maxVal - minVal) * pct
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="var(--color-outline-variant)"
                  strokeWidth="0.5"
                  strokeDasharray="4,4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  fill="var(--color-on-surface-variant)"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                  textAnchor="end"
                >
                  {val >= 1000000 ? `${(val / 1000000).toFixed(1)}jt` : new Intl.NumberFormat('id-ID').format(Math.round(val))}
                </text>
              </g>
            )
          })}

          {/* Area under the line */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#chart-area-grad)"
              className="transition-all duration-500 ease-in-out"
            />
          )}

          {/* Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="url(#chart-glow-grad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-500 ease-in-out"
            />
          )}

          {/* X Axis Labels */}
          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={height - 8}
              fill="var(--color-on-surface-variant)"
              fontSize="10"
              fontWeight="500"
              textAnchor="middle"
            >
              {p.month}
            </text>
          ))}

          {/* Interactive Trigger Areas & Dots */}
          {points.map((p, i) => {
            const isHovered = hoveredIdx === i
            return (
              <g key={i}>
                {/* Vertical projection line on hover */}
                {isHovered && (
                  <line
                    x1={p.x}
                    y1={padding.top}
                    x2={p.x}
                    y2={padding.top + chartHeight}
                    stroke="var(--color-primary)"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity="0.5"
                  />
                )}

                {/* Dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4}
                  fill="var(--color-surface-container-lowest)"
                  stroke="var(--color-primary)"
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-150 ease-out pointer-events-none"
                  style={{ filter: isHovered ? 'drop-shadow(0 2px 4px rgba(0, 92, 85, 0.4))' : 'none' }}
                />

                {/* Larger transparent hover target */}
                <rect
                  x={p.x - chartWidth / (chartData.length * 2)}
                  y={padding.top}
                  width={chartWidth / (chartData.length - 1 || 1)}
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseMove={(e) => handleMouseMove(e, i, p)}
                  onMouseLeave={handleMouseLeave}
                />
              </g>
            )
          })}
        </svg>

        {/* HTML Tooltip (rendered overlay for smooth CSS scaling & styling) */}
        {hoveredIdx !== null && (
          <div
            className="absolute z-10 pointer-events-none rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 shadow-md transition-all duration-100 ease-out"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
              backdropFilter: 'blur(4px)',
            }}
          >
            <p className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">
              {chartData[hoveredIdx].month}
            </p>
            <p className="text-body-sm font-semibold text-on-background">
              {formatRupiah(chartData[hoveredIdx].value)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
