"use client";

import { useState } from "react";
import { Settings, Building2, CreditCard, Bell, Shield, Loader2, Database, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const { organization, subscription, user, orgId } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleSeedData = async () => {
    if (!orgId || !user?.id) {
      setSeedResult({ success: false, message: "Not authenticated" });
      return;
    }

    setIsSeeding(true);
    setSeedResult(null);

    try {
      const response = await fetch("/api/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          userId: user.id,
          userName: user?.name || user?.email?.split("@")[0] || "Demo Inspector",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSeedResult({
          success: true,
          message: `Created ${data.inspectionsCreated} demo inspections with ${data.buyers} buyers, ${data.articleCodes} article codes, and ${data.locations} locations.`,
        });
      } else {
        setSeedResult({
          success: false,
          message: data.error || "Failed to seed data",
        });
      }
    } catch (error) {
      setSeedResult({
        success: false,
        message: "Network error. Please try again.",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen">
      <DashboardHeader />

      <div className="p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900">Settings</h1>
          <p className="text-sm text-zinc-500">Manage your organization and preferences</p>
        </div>

        {/* Organization Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization
            </CardTitle>
            <CardDescription>Your company information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                defaultValue={organization?.name || ""}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={organization?.email || user?.email || ""}
                className="mt-1"
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500"
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription
            </CardTitle>
            <CardDescription>Your current plan and usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-zinc-900 capitalize">
                    {subscription?.tier || "Starter"} Plan
                  </h3>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <p className="text-sm text-zinc-600 mt-1">
                  {subscription?.inspectionsUsed || 0} / {subscription?.inspectionsLimit || 15} inspections used this month
                </p>
              </div>
              <Button variant="outline">Upgrade Plan</Button>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-zinc-500">Team Members</p>
                <p className="font-medium">{subscription?.usersCount || 1} / {subscription?.usersLimit || 1}</p>
              </div>
              <div>
                <p className="text-zinc-500">Billing Cycle</p>
                <p className="font-medium capitalize">{subscription?.billingCycle || "Monthly"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure email notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-zinc-900">Failed Inspections</p>
                  <p className="text-sm text-zinc-500">Get notified when an inspection fails AQL</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-emerald-500" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-zinc-900">Daily Summary</p>
                  <p className="text-sm text-zinc-500">Receive a daily summary of all inspections</p>
                </div>
                <input type="checkbox" className="h-4 w-4 accent-emerald-500" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-zinc-900">Weekly Report</p>
                  <p className="text-sm text-zinc-500">Receive weekly analytics report</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Account security settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">Change Password</Button>
          </CardContent>
        </Card>

        {/* Demo Data */}
        <Card className="border-dashed border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-cyan-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-emerald-600" />
              Demo Data
            </CardTitle>
            <CardDescription>
              Load sample data to explore and showcase the app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600 mb-4">
              This will create 10 sample inspections with various statuses (draft, submitted, reviewed),
              8 sample buyers, 10 article codes, and 8 inspection locations. Perfect for demos and testing.
            </p>

            {seedResult && (
              <div
                className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${
                  seedResult.success
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {seedResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                )}
                <span className="text-sm">{seedResult.message}</span>
              </div>
            )}

            <Button
              onClick={handleSeedData}
              disabled={isSeeding}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading Demo Data...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Load Demo Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
