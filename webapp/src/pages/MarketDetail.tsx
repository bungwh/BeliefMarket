import { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  Users,
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  Lock,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useGetBet,
  useHasVoted,
  useHasClaimed,
  useCastVote,
  useClaimPrize,
  useClaimRefund,
  useUserVoteInfo,
  useDecryptHandles,
  useAuthorizeReveal,
  useSubmitTally
} from "@/hooks/useBeliefMarket";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { encryptVoteWeight, initializeFHE, isFheReady, publicDecryptHandles } from "@/lib/fhe";

export default function MarketDetail() {
  const { id } = useParams();
  const betId = id ?? "";
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const [selectedOption, setSelectedOption] = useState<0 | 1 | null>(null);
  const [voteWeight, setVoteWeight] = useState<number>(50);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [fheInitializing, setFheInitializing] = useState(false);
  const [fheError, setFheError] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const initializingRef = useRef(false); // Track initialization without causing re-renders

  const { data: betData, isLoading: betLoading } = useGetBet(betId);
  const { data: hasVoted } = useHasVoted(betId, address);
  const { data: hasClaimed } = useHasClaimed(betId, address);
  const { data: userVoteInfo } = useUserVoteInfo(betId, address);
  const { data: decryptHandles } = useDecryptHandles(betId);
  const { castVote, isPending: votingPending, isConfirming: votingConfirming } = useCastVote();
  const { claimPrize, isPending: prizePending } = useClaimPrize();
  const { claimRefund, isPending: refundPending } = useClaimRefund();
  const {
    requestReveal: authorizeReveal,
    isPending: revealTxPending,
    isConfirming: revealConfirming
  } = useAuthorizeReveal();
  const {
    submitTally,
    isPending: submitPending,
    isConfirming: submitConfirming
  } = useSubmitTally();

  useEffect(() => {
    const initFHE = async () => {
      // Prevent multiple simultaneous initializations
      if (initializingRef.current || isFheReady()) {
        return;
      }

      try {
        initializingRef.current = true;
        setFheInitializing(true);
        setFheError(null);
        await new Promise((resolve) => setTimeout(resolve, 500));
        await initializeFHE();
      } catch (err) {
        console.error("[MarketDetail] FHE initialization failed:", err);
        setFheError(err instanceof Error ? err.message : "Failed to initialize encryption system");
        initializingRef.current = false; // Reset on error to allow retry
      } finally {
        setFheInitializing(false);
      }
    };

    if (isConnected) {
      initFHE();
    }
  }, [isConnected]); // Removed fheInitializing from dependencies to prevent infinite loop

  const details = useMemo(() => {
    if (!betData) return null;
    const [
      title,
      description,
      creator,
      platformStakeValue,
      voteStake,
      expiryTime,
      isResolved,
      revealedYes,
      revealedNo,
      prizePool,
      yesWon,
      revealPending
    ] = betData as [
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
    ];

    return {
      title,
      description,
      creator,
      platformStakeValue,
      voteStake,
      expiryTime: Number(expiryTime),
      isResolved,
      revealedYes: Number(revealedYes),
      revealedNo: Number(revealedNo),
      prizePool,
      yesWon,
      revealPending
    };
  }, [betData]);

  const ZERO_HANDLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const handlesTuple = decryptHandles as readonly [`0x${string}`, `0x${string}`, boolean] | undefined;
  const yesHandle = handlesTuple?.[0];
  const noHandle = handlesTuple?.[1];

  const isLoading = betLoading || !details;
  const now = Math.floor(Date.now() / 1000);
  const alreadyClaimed = Boolean(hasClaimed);
  const userVoteExists = Boolean(userVoteInfo?.[0]);
  const userVoteType = userVoteExists ? Number(userVoteInfo?.[1]) : null;
  const isTie = Boolean(details && details.isResolved && details.revealedYes === details.revealedNo);
  const userIsWinner = Boolean(
    details &&
      details.isResolved &&
      !isTie &&
      userVoteExists &&
      ((details.yesWon && userVoteType === 1) || (!details.yesWon && userVoteType === 0))
  );

  const canVote = Boolean(
    details &&
      address &&
      !details.isResolved &&
      !details.revealPending &&
      now < details.expiryTime &&
      !hasVoted
  );

  const canAuthorizeReveal = Boolean(
    details &&
      !details.isResolved &&
      !details.revealPending &&
      now >= details.expiryTime
  );

  const handlesReady =
    Boolean(yesHandle && yesHandle !== ZERO_HANDLE && noHandle && noHandle !== ZERO_HANDLE) &&
    Boolean(details && details.revealPending);

  const canSubmitTally = Boolean(handlesReady && !details?.isResolved);

  const canClaimPrize = userIsWinner && !alreadyClaimed;
  const canClaimRefund = Boolean(details && isTie && userVoteExists && !alreadyClaimed);
  const revealBusy = revealTxPending || revealConfirming;
  const submitBusy = submitPending || submitConfirming || isDecrypting;

  const status = useMemo(() => {
    if (!details) return { badge: "Loading...", color: "bg-muted" };
    if (details.isResolved) return { badge: "Revealed", color: "bg-muted" };
    if (details.revealPending) return { badge: "Pending Decryption", color: "bg-warning" };
    if (now >= details.expiryTime) return { badge: "Pending Reveal", color: "bg-warning" };
    return { badge: "Active", color: "bg-success" };
  }, [details, now]);

  const shortenHandle = (value?: string) => {
    if (!value || value === ZERO_HANDLE) return "--";
    return `${value.slice(0, 8)}…${value.slice(-6)}`;
  };

  const handleAuthorizeReveal = async () => {
    if (!betId) return;
    try {
      toast({ title: "Sending transaction...", description: "Requesting public decryption" });
      await authorizeReveal(betId);
    } catch (error) {
      console.error(error);
      toast({
        title: "Request failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });
    }
  };

  const handleSubmitTally = async () => {
    if (!betId || !yesHandle || !noHandle) return;
    if (!isConnected) {
      toast({ title: "Please connect wallet first", variant: "destructive" });
      return;
    }

    try {
      setDecryptError(null);
      setIsDecrypting(true);
      toast({ title: "Decrypting...", description: "Retrieving plaintexts" });
      const handles: `0x${string}`[] = [yesHandle, noHandle];
      const { values, abiEncoded, proof } = await publicDecryptHandles(handles);
      setIsDecrypting(false);

      toast({ title: "Sending transaction...", description: `YES: ${values[0] ?? 0} / NO: ${values[1] ?? 0}` });
      await submitTally(betId, abiEncoded, proof);
    } catch (error) {
      console.error("[MarketDetail] public decrypt failed:", error);
      setIsDecrypting(false);
      const message = error instanceof Error ? error.message : String(error);
      setDecryptError(message);
      toast({ title: "Decryption failed", description: message, variant: "destructive" });
    }
  };

  const handleVote = async () => {
    if (!betId || !details || !address) return;
    if (!isConnected) {
      toast({ title: "Please connect wallet first", variant: "destructive" });
      return;
    }
    if (selectedOption === null) {
      toast({ title: "Please select a voting option", variant: "destructive" });
      return;
    }
    if (voteWeight < 1 || voteWeight > 100) {
      toast({ title: "Vote weight must be between 1-100", variant: "destructive" });
      return;
    }

    try {
      if (!isFheReady()) {
        toast({ title: "Initializing FHE...", description: "Preparing encryption environment" });
        await initializeFHE();
      }

      setIsEncrypting(true);
      toast({ title: "Encrypting vote...", description: `Weight: ${voteWeight}` });
      const { encryptedWeight, inputProof } = await encryptVoteWeight(voteWeight, address);
      setIsEncrypting(false);

      toast({ title: "Sending transaction...", description: `Voting for ${selectedOption === 1 ? "YES" : "NO"}` });
      await castVote(betId, selectedOption, details.voteStake, encryptedWeight, inputProof);
    } catch (error) {
      console.error("[MarketDetail] ❌ Vote failed:", error);
      setIsEncrypting(false);
      toast({
        title: "Operation failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });
    }
  };

  const handleClaimPrize = async () => {
    if (!betId) return;
    try {
      toast({ title: "Sending transaction...", description: "Claiming prize" });
      await claimPrize(betId);
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to claim prize", description: String(error), variant: "destructive" });
    }
  };

  const handleClaimRefund = async () => {
    if (!betId) return;
    try {
      toast({ title: "Sending transaction...", description: "Claiming refund" });
      await claimRefund(betId);
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to claim refund", description: String(error), variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-3">
          <Loader2 className="h-8 w-8 animate-spin" />
          Loading Market Details...
        </div>
      </div>
    );
  }

  const deadline = new Date(details.expiryTime * 1000).toLocaleString();
  const prizePoolEth = formatEther(details.prizePool);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={status.color}>{status.badge}</Badge>
                    <span className="text-xs text-muted-foreground">#{betId}</span>
                  </div>
                  <h1 className="text-2xl font-bold">{details.title || `Prediction #${betId}`}</h1>
                </div>
              </div>
              <p className="text-muted-foreground">{details.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/50">
                <div>
                  <p className="text-xs text-muted-foreground">Creator</p>
                  <p className="text-sm font-mono break-all">{details.creator}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">VoteStake</p>
                  <p className="text-sm font-semibold">{formatEther(details.voteStake)} ETH</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Platform Stake</p>
                  <p className="text-sm font-semibold">{formatEther(details.platformStakeValue)} ETH</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Deadline</p>
                  <p className="text-sm font-semibold">{deadline}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-6">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Select Position</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedOption(1)}
                  disabled={!canVote}
                  className={`rounded-xl border-2 p-6 transition-all ${
                    selectedOption === 1
                      ? "border-success bg-success/10"
                      : "border-border hover:border-success/50"
                  }`}
                >
                  <CheckCircle2
                    className={`h-8 w-8 mb-2 ${
                      selectedOption === 1 ? "text-success" : "text-muted-foreground"
                    }`}
                  />
                  <p className="font-semibold">YES</p>
                  <p className="text-sm text-muted-foreground">Believe event will happen</p>
                </button>
                <button
                  onClick={() => setSelectedOption(0)}
                  disabled={!canVote}
                  className={`rounded-xl border-2 p-6 transition-all ${
                    selectedOption === 0
                      ? "border-destructive bg-destructive/10"
                      : "border-border hover:border-destructive/50"
                  }`}
                >
                  <XCircle
                    className={`h-8 w-8 mb-2 ${
                      selectedOption === 0 ? "text-destructive" : "text-muted-foreground"
                    }`}
                  />
                  <p className="font-semibold">NO</p>
                  <p className="text-sm text-muted-foreground">Believe event will not happen</p>
                </button>
              </div>

              {canVote && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    <Label htmlFor="vote-weight" className="text-sm font-medium">
                      Confidence Weight (1-100) - FHE Encrypted
                    </Label>
                  </div>
                  <div className="space-y-2">
                    <Input
                      id="vote-weight"
                      type="number"
                      min="1"
                      max="100"
                      value={voteWeight}
                      onChange={(e) =>
                        setVoteWeight(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))
                      }
                      className="text-center text-lg font-bold"
                      disabled={!canVote || fheInitializing}
                    />
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={voteWeight}
                      onChange={(e) => setVoteWeight(parseInt(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                      disabled={!canVote || fheInitializing}
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Higher value indicates greater confidence. Vote weight is protected by FHE encryption for privacy.
                    </p>
                  </div>
                  {fheError && (
                    <div className="text-xs text-destructive p-2 bg-destructive/10 rounded border border-destructive/20">
                      ⚠️ FHE initialization failed: {fheError}
                    </div>
                  )}
                  {fheInitializing && (
                    <div className="text-xs text-primary p-2 bg-primary/10 rounded border border-primary/20">
                      <Loader2 className="h-3 w-3 inline-block animate-spin mr-1" />
                      Initializing FHE environment...
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={handleVote}
                disabled={!canVote || votingPending || votingConfirming || isEncrypting || fheInitializing}
                className="w-full"
              >
                {fheInitializing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Initializing FHE...
                  </>
                ) : isEncrypting ? (
                  <>
                    <Lock className="mr-2 h-5 w-5 animate-pulse" />
                    Encrypting weight...
                  </>
                ) : votingPending || votingConfirming ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting vote...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Submit Encrypted Vote
                  </>
                )}
              </Button>
            </Card>

            {details.isResolved && (
              <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Results</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Vote weights are encrypted by FHE. Final results are automatically determined by total weight after decryption.
                    </p>
                    <p className="text-lg">
                      Final Result:{" "}
                      <span
                        className={`font-bold ${
                          isTie ? "text-warning" : details.yesWon ? "text-success" : "text-destructive"
                        }`}
                      >
                        {isTie ? "Tie" : details.yesWon ? "YES Wins" : "NO Wins"}
                      </span>
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/40">
                      <div>
                        <p className="text-xs text-muted-foreground">Revealed YES Weight</p>
                        <p className="text-lg font-semibold">{details.revealedYes.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Revealed NO Weight</p>
                        <p className="text-lg font-semibold">{details.revealedNo.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Button
                      onClick={handleClaimPrize}
                      disabled={!canClaimPrize || prizePending}
                      className="w-full"
                    >
                      {prizePending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Claiming Prize...
                        </>
                      ) : (
                        "Claiming prize"
                      )}
                    </Button>
                    <Button
                      onClick={handleClaimRefund}
                      disabled={!canClaimRefund || refundPending}
                      variant="outline"
                      className="w-full"
                    >
                      {refundPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Refunding...
                        </>
                      ) : (
                        "Request Refund"
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Market Overview</h2>
              </div>
              <div className="grid gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Prize Pool</p>
                  <p className="text-2xl font-bold text-accent">{prizePoolEth} ETH</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-medium">{status.badge}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Voting Ends</p>
                  <p className="text-sm">{deadline}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Reveal Progress</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Status:{" "}
                  {details.isResolved
                    ? "Revealed"
                    : details.revealPending
                    ? "Waiting for client to submit decryption results"
                    : now >= details.expiryTime
                    ? "Can initiate public decryption"
                    : "Active"}
                </p>
                {details.revealPending && (
                  <div className="space-y-1 font-mono text-xs break-all">
                    <p>YES Handle: {shortenHandle(yesHandle)}</p>
                    <p>NO Handle: {shortenHandle(noHandle)}</p>
                    {!handlesReady && <p className="text-muted-foreground">Waiting for relayer to capture public handle...</p>}
                  </div>
                )}
                {decryptError && (
                  <div className="text-xs text-destructive border border-destructive/30 rounded px-2 py-1">
                    ⚠️ {decryptError}
                  </div>
                )}
              </div>
              {!details.isResolved && (
                details.revealPending ? (
                  <Button
                    onClick={handleSubmitTally}
                    disabled={!canSubmitTally || submitBusy}
                    className="w-full"
                    variant="default"
                  >
                    {submitBusy ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Decrypting and Submitting...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Execute Public Decryption
                      </>
                    )}
                  </Button>
                ) : (
                  now >= details.expiryTime && (
                    <Button
                      onClick={handleAuthorizeReveal}
                      disabled={!canAuthorizeReveal || revealBusy}
                      className="w-full"
                    >
                      {revealBusy ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-5 w-5" />
                          Request Public Decryption
                        </>
                      )}
                    </Button>
                  )
                )
              )}
              {details.isResolved && (
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-xs">
                  Decryption Complete: YES {details.revealedYes.toLocaleString()} / NO{" "}
                  {details.revealedNo.toLocaleString()}
                </div>
              )}
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Information</h2>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>• Creator: {details.creator}</li>
                <li>• Platform Stake: {formatEther(details.platformStakeValue)} ETH</li>
                <li>• Vote Ciphertext: FHE Privacy Protection Enabled</li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
