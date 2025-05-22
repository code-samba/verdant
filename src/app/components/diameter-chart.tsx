"use client"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts"
import { Card } from "@/components/ui/card"
import type { ChartDataPoint } from "../page"

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null

  const groups = []
  for (let i = 0; i < payload.length; i += 5) {
    groups.push(payload.slice(i, i + 5))
  }

  return (
    <div className="bg-white p-2 rounded shadow-lg border border-gray-200 text-sm">
      <div className="font-semibold mb-1">{label}</div>
      {groups.map((group, idx) => (
        <div key={idx} className="flex space-x-4 mb-1">
          {group.map(entry => (
            <div key={entry.dataKey} className="flex items-center space-x-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="whitespace-nowrap">
                {entry.name}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// Paletas de cores distintas para cada grupo
const colorsByGroup: Record<string, string[]> = {
  A: ["#10B981", "#059669", "#34D399", "#6EE7B7", "#A7F3D0"],
  B: ["#F97316", "#FB923C", "#FDBA74", "#FCD34D", "#FDE68A"],
  C: ["#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#DBEAFE"],
  D: ["#EF4444", "#F87171", "#FCA5A5", "#FECACA", "#FFE4E6"],
}

function getGroupFromKey(key: string) {
  // Extrai a letra A, B, C ou D que está depois do número e antes do espaço
  const match = key.match(/\d([A-D])\b/)
  return match ? match[1] : "A"
}

function getColorMap(keys: string[]): Record<string, string> {
  // Agrupa as keys por grupo e cria um map de cores baseado no grupo e índice
  const groups: Record<string, string[]> = {}

  keys.forEach(key => {
    const group = getGroupFromKey(key)
    if (!groups[group]) groups[group] = []
    groups[group].push(key)
  })

  const colorMap: Record<string, string> = {}

  Object.entries(groups).forEach(([group, groupKeys]) => {
    const palette = colorsByGroup[group] || colorsByGroup["A"]
    groupKeys.forEach((key, i) => {
      colorMap[key] = palette[i % palette.length]
    })
  })

  return colorMap
}

const renderLines = (keys: string[]) => {
  const colorMap = getColorMap(keys)

  return keys.map(key => {
    const color = colorMap[key]

    return (
      <Line
        key={key}
        type="linear"
        dataKey={key}
        stroke={color}
        strokeWidth={2}
        dot={{ r: 3, fill: color, stroke: color }}
        activeDot={{ r: 5, fill: color, stroke: "hsl(var(--background))", strokeWidth: 2 }}
        animationDuration={1000}
      />
    )
  })
}

export function DiameterChart({ data, keysFilter }: { data: ChartDataPoint[], keysFilter?: string[] }) {
  const groupKeys = keysFilter ?? (data.length > 0 ? Object.keys(data[0]).filter(k => k !== "date") : [])

  return (
    <Card className="p-4 md:p-6">
      <div className="h-[52vh] 2xl:h-[65vh]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
            <XAxis dataKey="date" tick={{ fill: "hsl(var(--foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} />
            <YAxis tick={{ fill: "hsl(var(--foreground))" }} axisLine={{ stroke: "hsl(var(--border))" }} tickFormatter={v => `${v}`} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "transparent" }} />
            {renderLines(groupKeys)}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
