import { useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Info, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateBet,
  useMinVoteStake,
  useMinDuration,
  useMaxDuration
} from "@/hooks/useBeliefMarket";
import { formatEther, parseEther } from "viem";

export default function CreateMarket() {
  const { toast } = useToast();
  const { createBet, isPending, isConfirming } = useCreateBet();
  const { data: minVoteStakeValue } = useMinVoteStake();
  const { data: minDurationValue } = useMinDuration();
  const { data: maxDurationValue } = useMaxDuration();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    voterDeposit: ""
  });

  const minVoteStakeEth = useMemo(
    () => (minVoteStakeValue ? formatEther(minVoteStakeValue) : undefined),
    [minVoteStakeValue]
  );

  const minDurationSeconds = useMemo(
    () => (minDurationValue ? Number(minDurationValue) : undefined),
    [minDurationValue]
  );

  const maxDurationSeconds = useMemo(
    () => (maxDurationValue ? Number(maxDurationValue) : undefined),
    [maxDurationValue]
  );

  const platformStakeEth = minVoteStakeEth; // Platform stake equals vote stake

  const submitting = isPending || isConfirming;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const deadlineDate = new Date(formData.deadline);
    if (Number.isNaN(deadlineDate.getTime())) {
      toast({ title: "Invalid deadline", variant: "destructive" });
      return;
    }

    const durationSeconds = Math.floor((deadlineDate.getTime() - Date.now()) / 1000);
    if (durationSeconds <= 0) {
      toast({ title: "Deadline must be in the future", variant: "destructive" });
      return;
    }

    if (minDurationSeconds && durationSeconds < minDurationSeconds) {
      toast({
        title: "Duration too short",
        description: `Minimum duration: ${Math.ceil(minDurationSeconds / 60)} minutes`,
        variant: "destructive"
      });
      return;
    }

    if (maxDurationSeconds && durationSeconds > maxDurationSeconds) {
      const maxDays = Math.floor(maxDurationSeconds / 86400);
      toast({
        title: "Duration too long",
        description: `Maximum duration: ${maxDays} days`,
        variant: "destructive"
      });
      return;
    }

    let voteStake: bigint;
    try {
      voteStake = parseEther(formData.voterDeposit || "0");
    } catch (error) {
      toast({ title: "Invalid vote stake format", variant: "destructive" });
      return;
    }

    if (voteStake <= 0n) {
      toast({ title: "Vote stake must be greater than 0", variant: "destructive" });
      return;
    }

    if (minVoteStakeValue && voteStake < minVoteStakeValue) {
      toast({
        title: "Vote stake too low",
        description: `Minimum stake: ${minVoteStakeEth ?? ""} ETH`,
        variant: "destructive"
      });
      return;
    }

    const betId = `BET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
      toast({ title: "Sending transaction...", description: `Market ID: ${betId}` });
      await createBet(
        betId,
        formData.title.trim(),
        formData.description.trim(),
        voteStake,
        BigInt(durationSeconds)
      );
      setFormData({ title: "", description: "", deadline: "", voterDeposit: "" });
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to create market",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Create New Market</h1>
            <p className="text-muted-foreground">
              Set up your prediction market parameters. Participants will make encrypted votes anonymously.
            </p>
          </div>

          <Card className="border-accent/20 bg-accent/5 p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-accent">About FHE Encrypted Voting</p>
                <p className="text-muted-foreground">
                  All voting data is protected by Fully Homomorphic Encryption (FHE). Results are only decrypted and revealed during the reveal phase.
                </p>
              </div>
            </div>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Market Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Will Bitcoin price break $100,000?"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Explain market rules and judgment criteria..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline *</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Market duration must be between {minDurationSeconds ? Math.ceil(minDurationSeconds / 60) : "-"} minutes
                  and {maxDurationSeconds ? Math.floor(maxDurationSeconds / 86400) : "-"} days
                </p>

                <div className="space-y-2">
                  <Label htmlFor="voterDeposit">Vote Stake (ETH) *</Label>
                  <Input
                    id="voterDeposit"
                    type="number"
                    step="0.001"
                    placeholder={minVoteStakeEth || "0.01"}
                    value={formData.voterDeposit}
                    onChange={(e) =>
                      setFormData({ ...formData, voterDeposit: e.target.value })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Stake amount participants must pay (minimum: {minVoteStakeEth ?? "-"} ETH)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Platform Stake *</Label>
                <Input value={platformStakeEth ?? "Loading..."} disabled readOnly />
                <p className="text-xs text-muted-foreground">
                  Platform stake is set by the contract to ensure creator completes reveal process
                </p>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="font-semibold">Preview</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vote Stake</span>
                  <span className="font-medium">{formData.voterDeposit || "0"} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Stake</span>
                  <span className="font-medium">{platformStakeEth ?? "-"} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Gas</span>
                  <span className="font-medium text-muted">~0.005 ETH</span>
                </div>
              </div>
            </Card>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1 gradient-primary glow-primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Market
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData({ title: "", description: "", deadline: "", voterDeposit: "" })}
                disabled={submitting}
              >
                Reset
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
