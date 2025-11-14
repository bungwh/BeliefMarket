const hre = require("hardhat");

async function main() {
  const contractAddress = "0xE07C68DF850343B92668a2285A64c9442D7A1016";

  console.log("🎯 Creating test prediction markets...\n");
  console.log(`📍 Contract: ${contractAddress}`);

  const [signer] = await hre.ethers.getSigners();
  console.log(`👤 Creator: ${signer.address}`);

  const balance = await hre.ethers.provider.getBalance(signer.address);
  console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  const BeliefMarket = await hre.ethers.getContractAt(
    "BeliefMarket",
    contractAddress
  );

  const PLATFORM_STAKE = hre.ethers.parseEther("0.02");
  const day = 24 * 60 * 60;

  const markets = [
    {
      id: "ETH_2025",
      title: "Will ETH reach $5000 in 2025?",
      description: "Predict if Ethereum will hit the $5000 price point during 2025",
      voteStake: hre.ethers.parseEther("0.005"),
      duration: 30 * day
    },
    {
      id: "ZAMA_MAINNET",
      title: "Zama fhEVM on Ethereum mainnet?",
      description: "Will Zama launch fhEVM on Ethereum mainnet this year?",
      voteStake: hre.ethers.parseEther("0.007"),
      duration: 30 * day
    },
    {
      id: "DEFI_TVL",
      title: "DeFi TVL exceeds $200B in 30 days?",
      description: "Will total DeFi TVL surpass $200 billion within 30 days?",
      voteStake: hre.ethers.parseEther("0.006"),
      duration: 30 * day
    },
    {
      id: "NFT_BOOM",
      title: "NFT sales volume > $500M this month?",
      description: "Will monthly NFT sales volume exceed $500 million?",
      voteStake: hre.ethers.parseEther("0.005"),
      duration: 20 * day
    },
    {
      id: "ZK_ROLLUP",
      title: "New ZK-rollup launches in 2 weeks?",
      description: "Will a major new ZK-rollup project launch within 14 days?",
      voteStake: hre.ethers.parseEther("0.007"),
      duration: 14 * day
    },
    {
      id: "MEME_COIN",
      title: "New meme coin reaches $1B market cap?",
      description: "Will a new meme coin achieve $1 billion market cap?",
      voteStake: hre.ethers.parseEther("0.005"),
      duration: 21 * day
    },
    {
      id: "LAYER2_GAS",
      title: "Layer 2 gas fees drop below $0.01?",
      description: "Will average Layer 2 transaction fees drop below 1 cent?",
      voteStake: hre.ethers.parseEther("0.006"),
      duration: 30 * day
    },
    {
      id: "DAO_TREASURY",
      title: "Major DAO treasury exceeds $10B?",
      description: "Will any DAO treasury value surpass $10 billion?",
      voteStake: hre.ethers.parseEther("0.008"),
      duration: 25 * day
    },
    {
      id: "STABLE_DEPEG",
      title: "No major stablecoin de-peg in 2 weeks?",
      description: "Will all major stablecoins maintain their peg for 14 days?",
      voteStake: hre.ethers.parseEther("0.005"),
      duration: 14 * day
    },
    {
      id: "CEX_VOLUME",
      title: "DEX volume surpasses CEX volume?",
      description: "Will decentralized exchange volume exceed centralized exchange volume?",
      voteStake: hre.ethers.parseEther("0.007"),
      duration: 30 * day
    }
  ];

  console.log(`📊 Creating ${markets.length} markets...\n`);

  let successCount = 0;

  for (let i = 0; i < markets.length; i++) {
    const market = markets[i];
    console.log(`[${i + 1}/${markets.length}] Creating market: ${market.title}`);
    console.log(`├─ ID: ${market.id}`);
    console.log(`├─ Vote Stake: ${hre.ethers.formatEther(market.voteStake)} ETH`);
    console.log(`├─ Duration: ${market.duration / day} days`);

    try {
      const tx = await BeliefMarket.createReplicaBet(
        market.id,
        market.title,
        market.description,
        market.voteStake,
        market.duration,
        { value: PLATFORM_STAKE }
      );

      console.log(`├─ Tx Hash: ${tx.hash}`);
      console.log(`└─ Waiting for confirmation...`);

      const receipt = await tx.wait(2);
      console.log(`✅ Market created in block ${receipt.blockNumber}\n`);
      successCount++;
    } catch (error) {
      console.log(`❌ Failed: ${error.message}\n`);
    }
  }

  console.log("============================================================");
  console.log("🎉 Market creation completed!");
  console.log("============================================================\n");
  console.log(`📊 Summary:`);
  console.log(`├─ Total Markets Attempted: ${markets.length}`);
  console.log(`├─ Successfully Created: ${successCount}`);
  console.log(`└─ Failed: ${markets.length - successCount}\n`);

  console.log(`🔗 View on Etherscan:`);
  console.log(`   https://sepolia.etherscan.io/address/${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
