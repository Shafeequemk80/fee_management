"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wallet, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashData();
  }, []);

  const fetchDashData = async () => {
    try {
      const res = await fetch("/api/reports?type=dashboard_summary");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back, Admin! Here's your madrassa summary.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Total Active Students</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats?.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Enrolled and active</p>
          </CardContent>
        </Card>

        <Card className="bg-green-500/10 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Collected This Month</CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">₹{stats?.collectedThisMonth || 0}</div>
            <p className="text-xs text-green-600/80 mt-1">Total revenue generated</p>
          </CardContent>
        </Card>

        <Card className="bg-red-500/10 border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Pending Dues (Month)</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">₹{stats?.pendingThisMonth || 0}</div>
            <p className="text-xs text-red-600/80 mt-1">Needs to be collected</p>
          </CardContent>
        </Card>

        <Card className="bg-teal-500/10 border-teal-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-700">Fee Status (Month)</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-teal-700">
              <span className="text-teal-600">{stats?.paidCount || 0} Paid</span>
              <span className="text-muted-foreground font-normal mx-2">/</span>
              <span className="text-red-600">{stats?.unpaidCount || 0} Unpaid</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-muted">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center border-dashed border-2 rounded m-4 bg-muted/20">
            <p className="text-muted-foreground text-sm">Visual charts comming soon...</p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 border-muted">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <a href="/admin/fees" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              <div className="font-semibold text-primary">Generate Monthly Fees</div>
              <p className="text-sm text-muted-foreground mt-1">Create bills for the new month instantly.</p>
            </a>
            <a href="/admin/reports" className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              <div className="font-semibold text-primary">Send Bulk Reminders</div>
              <p className="text-sm text-muted-foreground mt-1">Notify all pending students via WhatsApp.</p>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
