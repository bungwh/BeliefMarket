import { useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { MarketCard } from "@/components/MarketCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, Loader2 } from "lucide-react";
import { useListBets } from "@/hooks/useBeliefMarket";
import { useReadContracts } from "wagmi";
import { BELIEF_MARKET_ABI, BELIEF_MARKET_ADDRESS } from "@/config/contracts";
import { formatEther } from "viem";

type MarketStatus = "active" | "pending" | "resolved";

interface MarketSummary {
  id: string;
  title: string;
  description: string;
  deadline: string;
  prizePool: string;
  prizePoolValue: number;
  status: MarketStatus;
  totalVotes: number;
}

export default function Markets() {
  const [filter, setFilter] = useState<MarketStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: betIds, isLoading: idsLoading } = useListBets();

  const contracts = useMemo(
    () =>
      (betIds ?? []).map((betId) => ({
        address: BELIEF_MARKET_ADDRESS,
        abi: BELIEF_MARKET_ABI,
        functionName: "getReplicaBet" as const,
        args: [betId]
      })),
    [betIds]
  );

  const { data: betResults, isLoading: betsLoading } = useReadContracts({
    contracts,
    query: { enabled: contracts.length > 0 }
  });

  const markets: MarketSummary[] = useMemo(() => {
    if (!betIds || !betResults) return [];
    return betIds
      .map((betId, index) => {
        const result = betResults[index]?.result as
          | readonly [
              string,
              string,
              string,
              bigint,
              bigint,
              bigint,
              boolean,
              bigint,
              bigint,
              bigint,
              boolean,
              boolean
            ]
          | undefined;

        if (!result) return null;

        const [
          title,
          description,
          creator,
          platformStakeValue,
          voteStake,
          expiryTime,
          isResolved,
          yesWon,
          revealedYes,
          revealedNo,
          prizePool,
          revealPending
        ] = result;

        let status: MarketStatus = "active";
        const now = Math.floor(Date.now() / 1000);
        if (isResolved) {
          status = "resolved";
        } else if (revealPending || Number(expiryTime) <= now) {
          status = "pending";
        } else {
          status = "active";
        }

        const totalVotes = Number(revealedYes) + Number(revealedNo);

        return {
          id: betId,
          title: title || `Prediction #${betId}`,
          description: description || "ThisThis market was created on-chain, waiting for more details。",
          deadline: new Date(Number(expiryTime) * 1000).toLocaleString(),
          prizePool: `${formatEther(prizePool)} ETH`,
          prizePoolValue: Number(formatEther(prizePool)),
          status,
          totalVotes: isResolved ? totalVotes : 0
        };
      })
      .filter((item): item is MarketSummary => Boolean(item));
  }, [betIds, betResults]);

  const filteredMarkets = markets.filter((market) => {
    const matchesFilter =
      filter === "all" || market.status === filter;
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      market.title.toLowerCase().includes(term) ||
      market.description.toLowerCase().includes(term) ||
      market.id.toLowerCase().includes(term);
    return matchesFilter && matchesSearch;
  });

  const isLoading = idsLoading || betsLoading;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Prediction Markets</h1>
                <p className="text-muted-foreground">
                  Select YES / NO and stake the same amount in fair prediction markets
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="pending">Pending Reveal</TabsTrigger>
                <TabsTrigger value="resolved">Ended</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="SearchMarket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4">
              <p className="text-sm text-muted-foreground mb-1">Active Markets</p>
              <p className="text-2xl font-bold text-success">
                {markets.filter((m) => m.status === "active").length}
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Prize Pool</p>
              <p className="text-2xl font-bold text-accent">
                {markets.reduce((acc, market) => acc + market.prizePoolValue, 0).toFixed(2)} ETH
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4">
              <p className="text-sm text-muted-foreground mb-1">Participants</p>
              <p className="text-2xl font-bold">{markets.length}</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4">
              <p className="text-sm text-muted-foreground mb-1">Ended</p>
              <p className="text-2xl font-bold text-muted">
                {markets.filter((m) => m.status === "resolved").length}
              </p>
            </div>
          </div>

          {/* Markets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMarkets.map((market) => (
              <MarketCard key={market.id} {...market} />
            ))}
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              Loading markets...
            </div>
          )}

          {!isLoading && filteredMarkets.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No matching markets found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
