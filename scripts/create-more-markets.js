const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n🎯 Creating additional test prediction markets...\n");

  // Load deployment info
  const deploymentFile = path.join(
    __dirname,
    "../deployments/sepolia-deployment.json"
  );

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

  const platformStake = await contract.platformStake();

  // Define additional test markets (all within 30 days max duration)
  const markets = [
    {
      betId: "DEFI_TVL",
      title: "DeFi TVL exceeds $200B in 30 days?",
      description: "Will the total value locked in DeFi protocols exceed $200 billion within 30 days?",
      voteStake: ethers.parseEther("0.006"),
      duration: 30 * 24 * 60 * 60, // 30 days
    },
    {
      betId: "NFT_BOOM",
      title: "NFT sales volume > $500M this month?",
      description: "Will monthly NFT sales volume exceed $500 million before market expiry?",
      voteStake: ethers.parseEther("0.005"),
      duration: 20 * 24 * 60 * 60, // 20 days
    },
    {
      betId: "ZK_ROLLUP",
      title: "New ZK-rollup launches in 2 weeks?",
      description: "Will a major new ZK-rollup solution launch on Ethereum mainnet within 2 weeks?",
      voteStake: ethers.parseEther("0.007"),
      duration: 14 * 24 * 60 * 60, // 14 days
    },
    {
      betId: "MEME_COIN",
      title: "New meme coin reaches $1B market cap?",
      description: "Will a newly launched meme coin reach $1 billion market cap within 3 weeks?",
      voteStake: ethers.parseEther("0.005"),
      duration: 21 * 24 * 60 * 60, // 21 days
    },
    {
      betId: "LAYER2_GAS",
      title: "Layer 2 gas fees drop below $0.01?",
      description: "Will average transaction fees on major Layer 2 solutions drop below $0.01 within a month?",
      voteStake: ethers.parseEther("0.006"),
      duration: 30 * 24 * 60 * 60, // 30 days
    },
    {
      betId: "DAO_TREASURY",
      title: "Major DAO treasury exceeds $10B?",
      description: "Will any DAO treasury reach $10 billion in assets within 25 days?",
      voteStake: ethers.parseEther("0.008"),
      duration: 25 * 24 * 60 * 60, // 25 days
    },
    {
      betId: "STABLE_DEPEG",
      title: "No major stablecoin de-peg in 2 weeks?",
      description: "Will all major stablecoins maintain their peg (within 2%) for the next 2 weeks?",
      voteStake: ethers.parseEther("0.005"),
      duration: 14 * 24 * 60 * 60, // 14 days
    },
    {
      betId: "CEX_VOLUME",
      title: "DEX volume surpasses CEX volume?",
      description: "Will decentralized exchange daily volume exceed centralized exchange volume within a month?",
      voteStake: ethers.parseEther("0.007"),
      duration: 30 * 24 * 60 * 60, // 30 days
    },
  ];

  console.log("📊 Creating", markets.length, "additional markets...\n");

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
      console.log("❌ Failed:", error.message.split('\n')[0]);
      failCount++;
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 Market creation completed!");
  console.log("=".repeat(60));
  console.log("\n📊 Summary:");
  console.log("├─ Total Markets Attempted:", markets.length);
  console.log("├─ Successfully Created:", successCount);
  console.log("└─ Failed:", failCount);

  // Get all bet IDs from contract
  console.log("\n📋 Fetching all markets from contract...");
  const allBetIds = await contract.getReplicaBetIds();
  console.log("📊 Total markets on-chain:", allBetIds.length);

  console.log("\n📝 All Market IDs:");
  for (let i = 0; i < allBetIds.length; i++) {
    const betInfo = await contract.getReplicaBet(allBetIds[i]);
    console.log(`├─ [${i + 1}] ${allBetIds[i]}`);
    console.log(`│   ├─ Title: ${betInfo.title}`);
    console.log(`│   ├─ Vote Stake: ${ethers.formatEther(betInfo.voteStake)} ETH`);
    console.log(`│   └─ Expires: ${new Date(Number(betInfo.expiryTime) * 1000).toLocaleString()}`);
  }

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
