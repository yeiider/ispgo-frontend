"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const bandwidthData = [
  { time: "00:00", download: 420, upload: 180 },
  { time: "02:00", download: 280, upload: 120 },
  { time: "04:00", download: 180, upload: 80 },
  { time: "06:00", download: 320, upload: 140 },
  { time: "08:00", download: 580, upload: 280 },
  { time: "10:00", download: 720, upload: 350 },
  { time: "12:00", download: 680, upload: 320 },
  { time: "14:00", download: 750, upload: 380 },
  { time: "16:00", download: 820, upload: 420 },
  { time: "18:00", download: 920, upload: 480 },
  { time: "20:00", download: 980, upload: 520 },
  { time: "22:00", download: 780, upload: 380 },
]

export function BandwidthChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Tráfico de Red</CardTitle>
            <CardDescription>Ancho de banda en tiempo real (Gbps)</CardDescription>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "oklch(0.75 0.18 195)" }} />
              <span className="text-muted-foreground">Download</span>
              <span className="font-mono font-medium">847 Gbps</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "oklch(0.7 0.18 160)" }} />
              <span className="text-muted-foreground">Upload</span>
              <span className="font-mono font-medium">420 Gbps</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={bandwidthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.75 0.18 195)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.75 0.18 195)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.7 0.18 160)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.7 0.18 160)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.005 285)" />
              <XAxis dataKey="time" stroke="oklch(0.55 0 0)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.55 0 0)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.16 0.005 285)",
                  border: "1px solid oklch(0.28 0.005 285)",
                  borderRadius: "8px",
                  color: "oklch(0.985 0 0)",
                }}
              />
              <Area
                type="monotone"
                dataKey="download"
                stroke="oklch(0.75 0.18 195)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#downloadGradient)"
                name="Download (Gbps)"
              />
              <Area
                type="monotone"
                dataKey="upload"
                stroke="oklch(0.7 0.18 160)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#uploadGradient)"
                name="Upload (Gbps)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
