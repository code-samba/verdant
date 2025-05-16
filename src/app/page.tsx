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
} from "@/components/ui/select"

export interface ChartDataPoint {
  date: string
  [key: string]: string | number
}

type ChartType = "growth" | "diameter"
type Species = "jatoba" | "guapuruvu"

const CSV_URLS: Record<Species, string> = {
  jatoba: "https://docs.google.com/spreadsheets/d/1cTUvxmVhGdnonx9MHnrjekhSkeu2coLyentpYTOWXGQ/gviz/tq?tqx=out:csv&gid=0",
  guapuruvu: "https://docs.google.com/spreadsheets/d/1cTUvxmVhGdnonx9MHnrjekhSkeu2coLyentpYTOWXGQ/gviz/tq?tqx=out:csv&gid=409529600",
}

export default function GrowthDashboard() {
  const [selectedChart, setSelectedChart] = useState<ChartType>("growth")
  const [selectedSpecies, setSelectedSpecies] = useState<Species>("jatoba")
  const [growthData, setGrowthData] = useState<ChartDataPoint[]>([])
  const [diameterData, setDiameterData] = useState<ChartDataPoint[]>([])

  useEffect(() => {
    async function fetchSheet(url: string) {
      try {
        const res = await fetch(url)
        const csv = await res.text()
        const lines = csv.trim().split("\n")

        const header = lines[0].split(",").map(cell => cell.trim().replace(/^"|"$/g, ""))
        const dateIndex = header.findIndex(cell => cell.toLowerCase() === "data")

        const heightColumns: { group: string; index: number }[] = []
        const diameterColumns: { group: string; index: number }[] = []

        for (let i = dateIndex + 1; i < header.length; i += 2) {
          const group = header[i]
          heightColumns.push({ group, index: i })
          diameterColumns.push({ group, index: i + 1 })
        }

        const parsedGrowth: ChartDataPoint[] = []
        const parsedDiameter: ChartDataPoint[] = []

        // Função para converter string dd/mm/aaaa em Date
        const parseDate = (str: string) => {
          const [day, month, year] = str.split("/").map(Number)
          return new Date(year, month - 1, day)
        }

        let lastIncludedDate: Date | null = null

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(",").map(cell => cell.trim().replace(/^"|"$/g, ""))
          const dateStr = row[dateIndex]
          const currentDate = parseDate(dateStr)

          if (
            !lastIncludedDate ||
            currentDate.getTime() - lastIncludedDate.getTime() >= 5 * 24 * 60 * 60 * 1000
          ) {
            lastIncludedDate = currentDate

            const growthRow: ChartDataPoint = { date: dateStr }
            const diameterRow: ChartDataPoint = { date: dateStr }

            for (const { group, index } of heightColumns) {
              growthRow[group] = parseFloat(row[index]) || 0
            }

            for (const { group, index } of diameterColumns) {
              diameterRow[group] = parseFloat(row[index]) || 0
            }

            parsedGrowth.push(growthRow)
            parsedDiameter.push(diameterRow)
          }
        }

        setGrowthData(parsedGrowth)
        setDiameterData(parsedDiameter)
      } catch (error) {
        console.error("Error loading spreadsheet:", error)
      }
    }

    fetchSheet(CSV_URLS[selectedSpecies])
  }, [selectedSpecies])

  return (
    <main className="flex p-4 md:p-6 flex-col gap-6 h-[80vh] 2xl:h-[85vh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {selectedChart === "growth" ? "Height by Group" : "Diameter by Group"}
          </h2>
          <p className="text-muted-foreground">
            Species: <strong>{selectedSpecies === "jatoba" ? "Jatoba" : "Guapuruvu"}</strong>
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={selectedSpecies} onValueChange={(v) => setSelectedSpecies(v as Species)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select species" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jatoba">Jatoba</SelectItem>
              <SelectItem value="guapuruvu">Guapuruvu</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedChart} onValueChange={(v) => setSelectedChart(v as ChartType)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select chart" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="growth">Height</SelectItem>
              <SelectItem value="diameter">Diameter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedChart === "growth" ? (
        <GrowthChart data={growthData} species={selectedSpecies} />
      ) : (
        <DiameterChart data={diameterData} species={selectedSpecies} />
      )}
    </main>
  )
}
