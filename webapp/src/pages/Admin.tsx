import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  DollarSign,
  Activity,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export default function Admin() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Platform Admin</h1>
              <p className="text-muted-foreground">
                Monitor platform status and financial data
              </p>
            </div>
            <Badge className="bg-success">System Normal</Badge>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 space-y-2 border-accent/20 bg-accent/5">
              <div className="flex items-center justify-between">
                <DollarSign className="h-8 w-8 text-accent" />
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <p className="text-sm text-muted-foreground">Total Platform Balance</p>
              <p className="text-2xl font-bold">12.45 ETH</p>
            </Card>

            <Card className="p-6 space-y-2">
              <Activity className="h-8 w-8 text-primary" />
              <p className="text-sm text-muted-foreground">Active Markets</p>
              <p className="text-2xl font-bold">24</p>
            </Card>

            <Card className="p-6 space-y-2">
              <Settings className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">1,234</p>
            </Card>

            <Card className="p-6 space-y-2 border-warning/20 bg-warning/5">
              <AlertTriangle className="h-8 w-8 text-warning" />
              <p className="text-sm text-muted-foreground">Pending Requests</p>
              <p className="text-2xl font-bold">3</p>
            </Card>
          </div>

          {/* Platform Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-accent" />
                Financial Overview
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Fee Revenue</span>
                  <span className="font-semibold">8.32 ETH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Locked Stakes</span>
                  <span className="font-semibold">4.13 ETH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Prize Pool</span>
                  <span className="font-semibold text-accent">156.8 ETH</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                System Status
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Contract Version</span>
                  <Badge variant="outline">v1.0.0</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Network</span>
                  <Badge className="bg-primary">Ethereum Mainnet</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Gas Price</span>
                  <span className="font-mono text-sm">25 Gwei</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <div className="space-y-3">
              {[
                {
                  action: "Market Created",
                  market: "NFT Market Trading Volume Prediction",
                  time: "2 minutes ago",
                },
                {
                  action: "Vote Submitted",
                  market: "Bitcoin Price Breakthrough Prediction",
                  time: "5 minutes ago",
                },
                {
                  action: "Reveal Completed",
                  market: "Ethereum Upgrade Timing Prediction",
                  time: "12 minutes ago",
                },
                {
                  action: "Prize Claimed",
                  market: "DeFi Total Value Locked Prediction",
                  time: "18 minutes ago",
                },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.market}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Platform Settings */}
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Platform Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Fee Settings
              </Button>
              <Button variant="outline" className="justify-start">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Emergency Pause
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
