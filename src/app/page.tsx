"use client"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface RawRow {
  date: string
  group: string
  seed: string
  growth: number
  diameter: number
}

interface ChartDataPoint {
  date: string
  [key: string]: string | number // example: "1A - Jatoba": number
}

export default function GrowthDashboard() {
  const [data, setData] = useState<ChartDataPoint[]>([])

  useEffect(() => {
    async function fetchSheet() {
      try {
        const res = await fetch(
          "https://docs.google.com/spreadsheets/d/1cTUvxmVhGdnonx9MHnrjekhSkeu2coLyentpYTOWXGQ/gviz/tq?tqx=out:csv"
        )
        const csv = await res.text()

        const rows: RawRow[] = csv
          .trim()
          .split("\n")
          .slice(1)
          .map(row => {
            const [dateRaw, groupRaw, seedRaw, growthRaw, diameterRaw] = row.split(",")
            const date = dateRaw.trim().replace(/^"|"$/g, "")
            const group = groupRaw.trim().replace(/^"|"$/g, "")
            const seed = seedRaw.trim().replace(/^"|"$/g, "")
            const growth = Number(growthRaw?.trim().replace(/"/g, "")) || 0
            const diameter = Number(diameterRaw?.trim().replace(/"/g, "")) || 0
            return { date, group, seed, growth, diameter }
          })

        const grouped: Record<string, ChartDataPoint> = {}

        for (const { date, group, seed, growth } of rows) {
          const key = `${group} - ${seed}`
          if (!grouped[date]) grouped[date] = { date }
          grouped[date][key] = growth
        }

        const chartData = Object.values(grouped)
        setData(chartData)
      } catch (error) {
        console.error("Erro ao carregar a planilha:", error)
      }
    }

    fetchSheet()
  }, [])

  const groupKeys = data.length > 0
    ? Object.keys(data[0]).filter(key => key !== "date")
    : []

  return (
    <main className="flex p-4 md:p-6 flex-col h-[85vh]">
      <div className="flex flex-col gap-4 h-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Growth by Group and Seed</h2>
            <p className="text-muted-foreground">Each line shows a group-seed combination</p>
          </div>
        </div>
        <Card className="flex-1 p-4 md:p-6 flex flex-col">
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "hsl(var(--foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickFormatter={(value) => `${value.toLocaleString()}`}
                />
                <Tooltip />
                {groupKeys.map(key => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke="#000000"
                    strokeWidth={2}
                    dot={{
                      r: 3,
                      fill: "hsl(var(--primary))",
                      stroke: "hsl(var(--primary))",
                    }}
                    activeDot={{
                      r: 5,
                      fill: "hsl(var(--primary))",
                      stroke: "hsl(var(--background))",
                      strokeWidth: 2,
                    }}
                    animationDuration={1000}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </main>
  )
}
