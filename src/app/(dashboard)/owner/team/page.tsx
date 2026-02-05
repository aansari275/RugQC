"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Mail, Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getUsers } from "@/lib/firebase";
import type { User } from "@/types";

export default function TeamPage() {
  const { orgId, subscription } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      if (!orgId) return;
      try {
        const data = await getUsers(orgId);
        setUsers(data);
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, [orgId]);

  const usersLimit = subscription?.usersLimit || 1;
  const canAddMore = users.length < usersLimit;

  return (
    <div className="min-h-screen">
      <DashboardHeader />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Team</h1>
            <p className="text-sm text-zinc-500">
              {users.length} of {usersLimit} team member{usersLimit !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-emerald-500 to-cyan-500"
            disabled={!canAddMore}
          >
            <Plus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </div>

        {!canAddMore && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <p className="text-sm text-amber-800">
                You&apos;ve reached your team limit. <a href="/owner/settings" className="font-semibold underline">Upgrade your plan</a> to add more members.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-zinc-300 mx-auto" />
                <p className="mt-2 text-sm text-zinc-500">No team members yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-zinc-200"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-cyan-500 text-white">
                          {user.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-zinc-900">{user.name}</p>
                        <p className="text-sm text-zinc-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.role === "owner" ? "default" : "secondary"}>
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
