import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RefreshCw, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockPendingMarkets = [
  {
    id: "3",
    title: "Will Web3 social platform users break 10 million?",
    deadline: "2024-11-15",
    status: "expired",
    revealPending: false,
    decryptionRequestId: null,
  },
  {
    id: "5",
    title: "Will DeFi total value locked exceed $200 billion?",
    deadline: "2024-10-20",
    status: "revealing",
    revealPending: true,
    decryptionRequestId: "req_abc123",
    requestTime: "2024-10-21 10:00:00",
  },
];

export default function RevealCenter() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Reveal Center</h1>
            <p className="text-muted-foreground">
              Manage the reveal process for markets you created
            </p>
          </div>

          {/* Info Card */}
          <Card className="border-accent/20 bg-accent/5 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-accent">About the Reveal Process</p>
                <p className="text-muted-foreground">
                  After a market expires, the creator needs to request a reveal to decrypt vote results. The reveal request triggers
                  the FHE decryption process, which usually takes a few minutes. If the reveal fails, you can request again.
                </p>
              </div>
            </div>
          </Card>

          {/* Pending Markets */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Pending Reveal Markets</h2>

            {mockPendingMarkets.map((market) => (
              <Card
                key={market.id}
                className="p-6 space-y-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          market.status === "revealing"
                            ? "bg-warning border-0"
                            : "bg-destructive border-0"
                        }
                      >
                        {market.status === "revealing"
                          ? "Revealing"
                          : "Expired"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        #{market.id}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold">{market.title}</h3>

                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">
                        Deadline: {market.deadline}
                      </p>
                      {market.revealPending && (
                        <>
                          <p className="text-muted-foreground">
                            Request ID:{" "}
                            <span className="font-mono ml-1">
                              {market.decryptionRequestId}
                            </span>
                          </p>
                          <p className="text-muted-foreground">
                            Request Time: {market.requestTime}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {market.status === "expired" && !market.revealPending && (
                      <Button className="gradient-primary">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Request Reveal
                      </Button>
                    )}

                    {market.revealPending && (
                      <>
                        <Button variant="outline" disabled>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Revealing...
                        </Button>
                        <Button variant="outline" size="sm">
                          Request Again
                        </Button>
                      </>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => navigate(`/market/${market.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>

                {market.revealPending && (
                  <div className="rounded-lg border border-warning/20 bg-warning/5 p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <RefreshCw className="h-4 w-4 text-warning animate-spin" />
                      <span className="text-muted-foreground">
                        Decrypting vote data, estimated 3-5 minutes...
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            ))}

            {mockPendingMarkets.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No pending reveal markets
                </p>
                <Button onClick={() => navigate("/create")}>
                  Create New Market
                </Button>
              </Card>
            )}
          </div>

          {/* Emergency Actions */}
          <Card className="p-6 space-y-4 border-destructive/20">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-destructive">
                  Emergency Actions
                </h3>
                <p className="text-sm text-muted-foreground">
                  If the reveal process has issues or you need to cancel the market, you can execute a cancel and refund operation.
                  This will refund all participants' stakes.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
