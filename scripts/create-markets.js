const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n🎯 Creating test prediction markets...\n");

  // Load deployment info
  const deploymentFile = path.join(
    __dirname,
    "../deployments/sepolia-deployment.json"
  );

  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ Deployment file not found. Please deploy the contract first.");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  console.log("📋 Contract Address:", contractAddress);

  // Get contract instance
  const ObscuraBeliefMarket = await ethers.getContractFactory("ObscuraBeliefMarket");
  const contract = ObscuraBeliefMarket.attach(contractAddress);

  // Get signer
  const [creator] = await ethers.getSigners();
  console.log("👤 Creator:", creator.address);

  const balance = await ethers.provider.getBalance(creator.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH\n");

  // Get platform stake requirement
  const platformStake = await contract.platformStake();
  console.log("💵 Platform Stake Required:", ethers.formatEther(platformStake), "ETH\n");

  // Define test markets
  const markets = [
    {
      betId: "ETH_2025",
      title: "Will ETH reach $5000 in 2025?",
      description: "Ethereum price prediction for 2025. YES if ETH hits $5000 or above at any point during 2025, NO otherwise.",
      voteStake: ethers.parseEther("0.005"),
      duration: 30 * 24 * 60 * 60, // 30 days
    },
    {
      betId: "BTC_HALVING",
      title: "BTC price > $100k after halving?",
      description: "Will Bitcoin reach $100,000 within 6 months after the 2024 halving event?",
      voteStake: ethers.parseEther("0.01"),
      duration: 60 * 24 * 60 * 60, // 60 days
    },
    {
      betId: "AI_GPT5",
      title: "GPT-5 released in 2025?",
      description: "Will OpenAI officially release GPT-5 (or successor model) by December 31, 2025?",
      voteStake: ethers.parseEther("0.005"),
      duration: 90 * 24 * 60 * 60, // 90 days
    },
    {
      betId: "FHE_ADOPTION",
      title: "10+ major dApps use FHE by 2026?",
      description: "Will at least 10 major decentralized applications integrate Fully Homomorphic Encryption by end of 2026?",
      voteStake: ethers.parseEther("0.008"),
      duration: 45 * 24 * 60 * 60, // 45 days
    },
    {
      betId: "ZAMA_MAINNET",
      title: "Zama fhEVM on Ethereum mainnet?",
      description: "Will Zama's fhEVM be deployed on Ethereum mainnet before June 2025?",
      voteStake: ethers.parseEther("0.007"),
      duration: 30 * 24 * 60 * 60, // 30 days
    },
  ];

  console.log("📊 Creating", markets.length, "test markets...\n");

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < markets.length; i++) {
    const market = markets[i];
    console.log(`\n[${i + 1}/${markets.length}] Creating market: ${market.title}`);
    console.log("├─ Bet ID:", market.betId);
    console.log("├─ Vote Stake:", ethers.formatEther(market.voteStake), "ETH");
    console.log("├─ Duration:", market.duration / (24 * 60 * 60), "days");

    try {
      const tx = await contract.createReplicaBet(
        market.betId,
        market.title,
        market.description,
        market.voteStake,
        market.duration,
        { value: platformStake }
      );

      console.log("├─ Tx Hash:", tx.hash);
      console.log("└─ Waiting for confirmation...");

      const receipt = await tx.wait();
      console.log("✅ Market created in block", receipt.blockNumber);
      successCount++;
    } catch (error) {
      console.log("❌ Failed:", error.message);
      failCount++;
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 Market creation completed!");
  console.log("=".repeat(60));
  console.log("\n📊 Summary:");
  console.log("├─ Total Markets:", markets.length);
  console.log("├─ Successfully Created:", successCount);
  console.log("└─ Failed:", failCount);

  // Get all bet IDs from contract
  console.log("\n📋 Fetching all markets from contract...");
  const allBetIds = await contract.getReplicaBetIds();
  console.log("📊 Total markets on-chain:", allBetIds.length);
  console.log("📝 Bet IDs:", allBetIds);

  console.log("\n🔗 View on Etherscan:");
  console.log(`   https://sepolia.etherscan.io/address/${contractAddress}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Script failed:");
    console.error(error);
    process.exit(1);
  });
