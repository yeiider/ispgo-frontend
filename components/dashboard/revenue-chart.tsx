"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const revenueData = [
  { month: "Ene", facturado: 245000, cobrado: 228000 },
  { month: "Feb", facturado: 258000, cobrado: 241000 },
  { month: "Mar", facturado: 262000, cobrado: 248000 },
  { month: "Abr", facturado: 270000, cobrado: 255000 },
  { month: "May", facturado: 275000, cobrado: 262000 },
  { month: "Jun", facturado: 284750, cobrado: 271000 },
]

export function RevenueChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Facturación vs Cobranza</CardTitle>
            <CardDescription>Comparativa mensual (USD)</CardDescription>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "oklch(0.75 0.18 195)" }} />
              <span className="text-muted-foreground">Facturado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "oklch(0.7 0.18 160)" }} />
              <span className="text-muted-foreground">Cobrado</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.005 285)" vertical={false} />
              <XAxis dataKey="month" stroke="oklch(0.55 0 0)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="oklch(0.55 0 0)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.16 0.005 285)",
                  border: "1px solid oklch(0.28 0.005 285)",
                  borderRadius: "8px",
                  color: "oklch(0.985 0 0)",
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
              />
              <Bar dataKey="facturado" fill="oklch(0.75 0.18 195)" radius={[4, 4, 0, 0]} name="Facturado" />
              <Bar dataKey="cobrado" fill="oklch(0.7 0.18 160)" radius={[4, 4, 0, 0]} name="Cobrado" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
