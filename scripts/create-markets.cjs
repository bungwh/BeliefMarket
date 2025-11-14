const hre = require("hardhat");
const { parseEther } = require("ethers");

const CONTRACT_ADDRESS = "0x2ab08f76e36E88CA359Ed510b2110b520309EB21";

const markets = [
  {
    betId: "btc-100k-2025",
    title: "Bitcoin will reach $100,000 by end of 2025",
    description: "Will Bitcoin (BTC) price exceed $100,000 USD on any major exchange by December 31, 2025?",
    voteStake: parseEther("0.01"),
    duration: 30 * 24 * 60 * 60 // 30 days
  },
  {
    betId: "eth-merge-success",
    title: "Ethereum 2.0 merge was successful",
    description: "The Ethereum network successfully transitioned to Proof of Stake without major issues",
    voteStake: parseEther("0.005"),
    duration: 15 * 24 * 60 * 60 // 15 days
  },
  {
    betId: "ai-sentience-2024",
    title: "AI will achieve sentience by 2024",
    description: "Will any AI system demonstrate verifiable sentience or consciousness by December 31, 2024?",
    voteStake: parseEther("0.015"),
    duration: 7 * 24 * 60 * 60 // 7 days
  },
  {
    betId: "mars-landing-2026",
    title: "Human Mars landing by 2026",
    description: "Will humans successfully land on Mars by December 31, 2026?",
    voteStake: parseEther("0.02"),
    duration: 25 * 24 * 60 * 60 // 25 days
  },
  {
    betId: "quantum-computing-2025",
    title: "Quantum supremacy proven by 2025",
    description: "Will practical quantum computing achieve clear advantage over classical computing by end of 2025?",
    voteStake: parseEther("0.01"),
    duration: 20 * 24 * 60 * 60 // 20 days
  },
  {
    betId: "vr-mainstream-2025",
    title: "VR becomes mainstream by 2025",
    description: "Will VR headsets reach over 100 million active users by December 2025?",
    voteStake: parseEther("0.008"),
    duration: 14 * 24 * 60 * 60 // 14 days
  },
  {
    betId: "climate-goal-2030",
    title: "Paris Climate goals met by 2030",
    description: "Will global carbon emissions be reduced by 45% from 2010 levels by 2030?",
    voteStake: parseEther("0.012"),
    duration: 28 * 24 * 60 * 60 // 28 days
  },
  {
    betId: "fusion-energy-2028",
    title: "Commercial fusion energy by 2028",
    description: "Will commercial fusion power plants begin operation by December 2028?",
    voteStake: parseEther("0.018"),
    duration: 21 * 24 * 60 * 60 // 21 days
  },
  {
    betId: "autonomous-cars-2025",
    title: "Level 5 autonomous cars by 2025",
    description: "Will fully autonomous (Level 5) vehicles be commercially available by end of 2025?",
    voteStake: parseEther("0.01"),
    duration: 10 * 24 * 60 * 60 // 10 days
  },
  {
    betId: "metaverse-billion-2026",
    title: "Metaverse reaches 1B users by 2026",
    description: "Will the combined metaverse platforms have 1 billion active users by 2026?",
    voteStake: parseEther("0.009"),
    duration: 18 * 24 * 60 * 60 // 18 days
  }
];

async function main() {
  console.log("🚀 Creating test markets for BeliefMarket...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Creating markets with account:", deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  const contract = await hre.ethers.getContractAt("ObscuraBeliefMarket", CONTRACT_ADDRESS);
  const platformStake = await contract.platformStake();
  console.log("💎 Platform stake:", hre.ethers.formatEther(platformStake), "ETH\n");

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < markets.length; i++) {
    const market = markets[i];
    try {
      console.log(`[${i + 1}/${markets.length}] Creating: ${market.title}`);
      console.log(`  - Bet ID: ${market.betId}`);
      console.log(`  - Vote Stake: ${hre.ethers.formatEther(market.voteStake)} ETH`);
      console.log(`  - Duration: ${market.duration / (24 * 60 * 60)} days`);

      const tx = await contract.createReplicaBet(
        market.betId,
        market.title,
        market.description,
        market.voteStake,
        market.duration,
        { value: platformStake }
      );

      console.log(`  ⏳ Tx hash: ${tx.hash}`);
      await tx.wait();
      console.log(`  ✅ Market created successfully!\n`);
      successCount++;
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}\n`);
      failCount++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`📊 Summary: ${successCount} created, ${failCount} failed`);
  console.log("=".repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
