const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Read contract address from deployment file
const deploymentPath = path.join(__dirname, "../deployments/sepolia-deployment.json");
const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
const CONTRACT_ADDRESS = deployment.contractAddress;

async function main() {
  console.log("🔍 Debugging vote transaction...\n");

  const [signer] = await hre.ethers.getSigners();
  console.log("📝 Signer address:", signer.address);

  const balance = await hre.ethers.provider.getBalance(signer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH\n");

  const BeliefMarket = await hre.ethers.getContractAt("BeliefMarket", CONTRACT_ADDRESS);

  // Get the first bet ID
  const betIds = await BeliefMarket.getReplicaBetIds();
  if (betIds.length === 0) {
    console.log("❌ No bets found");
    return;
  }

  const betId = betIds[0];
  console.log("📊 Testing with bet ID:", betId);

  // Get bet details
  const bet = await BeliefMarket.getReplicaBet(betId);
  console.log("\n📋 Bet Details:");
  console.log("  Title:", bet.title);
  console.log("  Vote Stake:", hre.ethers.formatEther(bet.voteStake), "ETH");
  console.log("  Expiry Time:", new Date(Number(bet.expiryTime) * 1000).toLocaleString());
  console.log("  Is Resolved:", bet.isResolved);

  // Check if already voted
  const hasVoted = await BeliefMarket.hasReplicaUserVoted(betId, signer.address);
  console.log("  Has Voted:", hasVoted);

  if (hasVoted) {
    console.log("\n⚠️  Already voted, skipping...");
    return;
  }

  // Test parameters
  const voteType = 1; // YES
  const weight = 75;

  console.log("\n🎯 Test Vote Parameters:");
  console.log("  Vote Type:", voteType === 1 ? "YES" : "NO");
  console.log("  Weight:", weight);
  console.log("  Vote Stake:", hre.ethers.formatEther(bet.voteStake), "ETH");

  // Create dummy encrypted weight (32 bytes)
  const encryptedWeight = hre.ethers.randomBytes(32);
  const inputProof = hre.ethers.randomBytes(256); // Typical proof size

  console.log("\n📦 Encrypted Data:");
  console.log("  Encrypted Weight:", hre.ethers.hexlify(encryptedWeight));
  console.log("  Proof Length:", inputProof.length, "bytes");

  console.log("\n🚀 Sending transaction...");

  try {
    // Estimate gas first
    console.log("⏳ Estimating gas...");
    const gasEstimate = await BeliefMarket.castReplicaVote.estimateGas(
      betId,
      voteType,
      encryptedWeight,
      inputProof,
      { value: bet.voteStake }
    );
    console.log("  Estimated gas:", gasEstimate.toString());

    // Send transaction
    const tx = await BeliefMarket.castReplicaVote(
      betId,
      voteType,
      encryptedWeight,
      inputProof,
      { value: bet.voteStake }
    );

    console.log("  Tx Hash:", tx.hash);
    console.log("⏳ Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("  Block:", receipt.blockNumber);
    console.log("  Gas Used:", receipt.gasUsed.toString());

  } catch (error) {
    console.error("\n❌ Transaction failed:");
    console.error("  Error:", error.message);

    if (error.data) {
      console.error("  Error Data:", error.data);
    }

    // Try to decode the error
    if (error.error && error.error.data) {
      console.error("  Decoded Error:", error.error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
