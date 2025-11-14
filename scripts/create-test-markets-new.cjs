const hre = require("hardhat");
const { parseEther } = require("ethers");
const fs = require("fs");
const path = require("path");

// Read contract address from deployment file
const deploymentPath = path.join(__dirname, "../deployments/sepolia-deployment.json");
const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
const CONTRACT_ADDRESS = deployment.contractAddress;

const markets = [
  {
    betId: `btc-120k-${Date.now()}`,
    title: "Bitcoin will reach $120,000 by mid-2026",
    description: "Will Bitcoin (BTC) price exceed $120,000 USD on any major exchange by June 30, 2026?",
    voteStake: parseEther("0.01"),
    duration: 7 * 24 * 60 * 60 // 7 days
  },
  {
    betId: `eth-5k-${Date.now()}`,
    title: "Ethereum will reach $5,000 in 2025",
    description: "Will Ethereum (ETH) price exceed $5,000 USD on any major exchange by December 31, 2025?",
    voteStake: parseEther("0.008"),
    duration: 10 * 24 * 60 * 60 // 10 days
  },
  {
    betId: `fhe-mainstream-${Date.now()}`,
    title: "FHE will become mainstream by 2026",
    description: "Will Fully Homomorphic Encryption be used in production by major tech companies by 2026?",
    voteStake: parseEther("0.005"),
    duration: 14 * 24 * 60 * 60 // 14 days
  },
  {
    betId: `ai-gpt5-${Date.now()}`,
    title: "GPT-5 will be released by end of 2025",
    description: "Will OpenAI release GPT-5 or equivalent model by December 31, 2025?",
    voteStake: parseEther("0.012"),
    duration: 7 * 24 * 60 * 60 // 7 days
  },
  {
    betId: `crypto-etf-${Date.now()}`,
    title: "More crypto ETFs approved in 2025",
    description: "Will at least 5 new cryptocurrency ETFs be approved in the US by end of 2025?",
    voteStake: parseEther("0.01"),
    duration: 10 * 24 * 60 * 60 // 10 days
  }
];

async function main() {
  console.log("🚀 Creating test markets for BeliefMarket...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Creating markets with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  console.log("📋 Using contract address:", CONTRACT_ADDRESS, "\n");

  const BeliefMarket = await hre.ethers.getContractAt("BeliefMarket", CONTRACT_ADDRESS);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < markets.length; i++) {
    const market = markets[i];
    console.log(`[${i + 1}/${markets.length}] Creating: ${market.title}`);
    console.log(`  - Bet ID: ${market.betId}`);
    console.log(`  - Vote Stake: ${hre.ethers.formatEther(market.voteStake)} ETH`);
    console.log(`  - Duration: ${market.duration / (24 * 60 * 60)} days`);

    try {
      const tx = await BeliefMarket.createReplicaBet(
        market.betId,
        market.title,
        market.description,
        market.voteStake,
        market.duration
      );

      console.log(`  ⏳ Tx hash: ${tx.hash}`);
      await tx.wait();
      console.log(`  ✅ Created successfully\n`);
      successCount++;
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}\n`);
      failCount++;
    }
  }

  console.log("\n==================================================");
  console.log(`📊 Summary: ${successCount} created, ${failCount} failed`);
  console.log("==================================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
