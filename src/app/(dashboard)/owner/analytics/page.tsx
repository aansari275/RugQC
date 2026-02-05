"use client";

import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen">
      <DashboardHeader />

      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900">Analytics</h1>
          <p className="text-sm text-zinc-500">Track quality trends and performance metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500">Pass Rate</p>
                  <p className="mt-1 text-3xl font-bold text-zinc-900">--</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500">Avg. Defects</p>
                  <p className="mt-1 text-3xl font-bold text-zinc-900">--</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <Minus className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500">Rejection Rate</p>
                  <p className="mt-1 text-3xl font-bold text-zinc-900">--</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500">Total Inspections</p>
                  <p className="mt-1 text-3xl font-bold text-zinc-900">0</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100">
                  <BarChart3 className="h-5 w-5 text-cyan-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts placeholder */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Inspections Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center rounded-lg bg-zinc-50">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-zinc-300 mx-auto" />
                  <p className="mt-2 text-sm text-zinc-500">
                    Charts will appear once you have inspection data
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Defect Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center rounded-lg bg-zinc-50">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-zinc-300 mx-auto" />
                  <p className="mt-2 text-sm text-zinc-500">
                    Charts will appear once you have inspection data
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
