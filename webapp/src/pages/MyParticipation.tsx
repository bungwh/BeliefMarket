import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockParticipations = [
  {
    marketId: "1",
    title: "Will Bitcoin price break $100,000 in 2024?",
    vote: "yes",
    status: "active",
    canClaim: false,
    prizeAmount: null,
  },
  {
    marketId: "2",
    title: "Will Ethereum 2.0 complete upgrade in Q2?",
    vote: "no",
    status: "resolved",
    canClaim: true,
    prizeAmount: "0.15 ETH",
    isWinner: true,
  },
  {
    marketId: "3",
    title: "Will Web3 social platform users break 10 million?",
    vote: "yes",
    status: "pending",
    canClaim: false,
    prizeAmount: null,
  },
];

export default function MyParticipation() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">My Participation</h1>
            <p className="text-muted-foreground">
              View markets you participated in and rewards you can claim
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 border-border/50 bg-card/50">
              <p className="text-sm text-muted-foreground mb-1">Markets Participated</p>
              <p className="text-2xl font-bold">{mockParticipations.length}</p>
            </Card>
            <Card className="p-4 border-success/20 bg-success/5">
              <p className="text-sm text-muted-foreground mb-1">Claimable Prizes</p>
              <p className="text-2xl font-bold text-success">0.15 ETH</p>
            </Card>
            <Card className="p-4 border-accent/20 bg-accent/5">
              <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
              <p className="text-2xl font-bold text-accent">33%</p>
            </Card>
          </div>

          {/* Participation List */}
          <div className="space-y-4">
            {mockParticipations.map((participation) => (
              <Card
                key={participation.marketId}
                className="p-6 space-y-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          participation.status === "active"
                            ? "bg-success border-0"
                            : participation.status === "pending"
                            ? "bg-warning border-0"
                            : "bg-muted border-0"
                        }
                      >
                        {participation.status === "active"
                          ? "Active"
                          : participation.status === "pending"
                          ? "Pending Reveal"
                          : "Ended"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        #{participation.marketId}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold">
                      {participation.title}
                    </h3>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {participation.vote === "yes" ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                        <span className="text-sm">
                          My Vote:{" "}
                          <span className="font-semibold ml-1">
                            {participation.vote === "yes" ? "YES" : "NO"}
                          </span>
                        </span>
                      </div>

                      {participation.isWinner && (
                        <Badge className="bg-success">Winner</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {participation.canClaim && (
                      <Button className="gradient-primary glow-primary">
                        <Gift className="mr-2 h-4 w-4" />
                        Claim {participation.prizeAmount}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() =>
                        navigate(`/market/${participation.marketId}`)
                      }
                    >
                      View Details
                    </Button>
                  </div>
                </div>

                {participation.status === "active" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border/50">
                    <Clock className="h-4 w-4" />
                    <span>Waiting for market to end and reveal</span>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {mockParticipations.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                You haven't participated in any markets yet
              </p>
              <Button onClick={() => navigate("/")}>Browse Markets</Button>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
