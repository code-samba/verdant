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

type GroupKey = "A" | "B" | "C" | "D"

interface RawRow {
  date: string
  group: GroupKey
  growth: number
}

interface ChartDataPoint {
  date: string
  A?: number
  B?: number
  C?: number
  D?: number
}

export default function GrowthDashboard() {
  const [data, setData] = useState<ChartDataPoint[]>([])

  useEffect(() => {
    async function fetchSheet() {
      try {
        const res = await fetch(
          "https://docs.google.com/spreadsheets/d/1_3M3v2GxE9kNtF5lpXUqubaDpGVlJ0Yk_14MpFJUD-M/gviz/tq?tqx=out:csv"
        )
        const csv = await res.text()

        const rows: RawRow[] = csv
          .trim()
          .split("\n")
          .slice(1)
          .map(row => {
            const [dateRaw, groupRaw, growthRaw] = row.split(",")
            const date = dateRaw.trim().replace(/^"|"$/g, "")
            const group = groupRaw.trim().replace(/^"|"$/g, "") as GroupKey
            const growth = Number(growthRaw?.trim().replace(/"/g, "")) || 0
            return { date, group, growth }
          })
          .filter(({ date, group, growth }) => date && group && !isNaN(growth))

        const grouped: Record<string, ChartDataPoint> = {}

        for (const { date, group, growth } of rows) {
          if (!grouped[date]) grouped[date] = { date }
          grouped[date][group] = growth
        }

        setData(Object.values(grouped))
      } catch (error) {
        console.error("Erro ao carregar a planilha:", error)
      }
    }

    fetchSheet()
  }, [])

  return (
    <main className="flex p-4 md:p-6 flex-col h-[85vh]">
      <div className="flex flex-col gap-4 h-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Growth Trajectory</h2>
            <p className="text-muted-foreground">Visualizing exponential growth over time</p>
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
                {(["A", "B", "C", "D"] as GroupKey[]).map(group => (
                  <Line
                    key={group}
                    type="monotone"
                    dataKey={group}
                    stroke="#000000"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "hsl(var(--primary))",
                      stroke: "hsl(var(--primary))",
                    }}
                    activeDot={{
                      r: 6,
                      fill: "hsl(var(--primary))",
                      stroke: "hsl(var(--background))",
                      strokeWidth: 2,
                    }}
                    animationDuration={1500}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          { 
            /*
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Current Value</p>
                <p className="text-2xl font-bold">{totalGrowth.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Growth Rate</p>
                <p className="text-2xl font-bold text-emerald-500">+21%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">YoY Change</p>
                <p className="text-2xl font-bold">+2,200%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Projection</p>
                <p className="text-2xl font-bold">35,000</p>
              </div>
            </div>
            */
          }
        </Card>
      </div>
    </main>
  )
}
