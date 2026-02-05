"use client";

import { FileText, Download, Calendar } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  return (
    <div className="min-h-screen">
      <DashboardHeader />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Reports</h1>
            <p className="text-sm text-zinc-500">Generate and download inspection reports</p>
          </div>
          <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-emerald-500" />
                Weekly Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-500">
                Overview of all inspections from the past week
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                Generate
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-cyan-500" />
                Monthly Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-500">
                Detailed monthly analysis with trends
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                Generate
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-amber-500" />
                Custom Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-500">
                Create a report with custom date range
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                Configure
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-zinc-300" />
            <h3 className="mt-4 text-lg font-semibold text-zinc-900">No reports generated yet</h3>
            <p className="mt-1 text-sm text-zinc-500 text-center max-w-md">
              Generate your first report to track inspection trends and quality metrics over time.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
