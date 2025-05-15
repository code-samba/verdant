"use client"
import { useState, useEffect } from "react"
import { GrowthChart } from "./components/growth-chart"
import { DiameterChart } from "./components/diameter-chart"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select" // caminho típico do shadcn select, ajuste se necessário

export interface RawRow {
  date: string
  group: string
  seed: string
  growth: number
  diameter: number
}

export interface ChartDataPoint {
  date: string
  [key: string]: string | number
}

export default function GrowthDashboard() {
  const [growthData, setGrowthData] = useState<ChartDataPoint[]>([])
  const [diameterData, setDiameterData] = useState<ChartDataPoint[]>([])
  const [selectedChart, setSelectedChart] = useState<"growth" | "diameter">("growth")

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

        const growthGrouped: Record<string, ChartDataPoint> = {}
        const diameterGrouped: Record<string, ChartDataPoint> = {}

        for (const { date, group, seed, growth, diameter } of rows) {
          const key = `${group} - ${seed}`
          if (!growthGrouped[date]) growthGrouped[date] = { date }
          if (!diameterGrouped[date]) diameterGrouped[date] = { date }

          growthGrouped[date][key] = growth
          diameterGrouped[date][key] = diameter
        }

        setGrowthData(Object.values(growthGrouped))
        setDiameterData(Object.values(diameterGrouped))
      } catch (error) {
        console.error("Erro ao carregar a planilha: ", error)
      }
    }

    fetchSheet()
  }, [])

  return (
    <main className="flex p-4 md:p-6 flex-col gap-6 h-[85vh]">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{selectedChart === "growth" ? "Growth by Group and Seed" : "Diameter by Group and Seed"}</h2>
          <p className="text-muted-foreground">{selectedChart === "growth" ? "Each line shows a group-seed combination" : "Visualizing trunk diameter over time"}</p>
        </div>
        <Select
          value={selectedChart}
          onValueChange={(value) => setSelectedChart(value as "growth" | "diameter")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o gráfico" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="growth">Growth</SelectItem>
            <SelectItem value="diameter">Diameter</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {selectedChart === "growth" ? (
        <GrowthChart data={growthData} />
      ) : (
        <DiameterChart data={diameterData} />
      )}
    </main>
  )
}
