const hre = require("hardhat");

async function main() {
  const contractAddress = "0xE07C68DF850343B92668a2285A64c9442D7A1016";

  console.log("📋 Checking BeliefMarket contract...");
  console.log(`📍 Address: ${contractAddress}\n`);

  const BeliefMarket = await hre.ethers.getContractAt(
    "BeliefMarket",
    contractAddress
  );

  // List of known market IDs to check
  const marketIds = [
    "ETH_2025",
    "ZAMA_MAINNET",
    "DEFI_TVL",
    "NFT_BOOM",
    "ZK_ROLLUP",
    "MEME_COIN",
    "LAYER2_GAS",
    "DAO_TREASURY",
    "STABLE_DEPEG",
    "CEX_VOLUME"
  ];

  let activeMarkets = 0;

  console.log("🔍 Checking markets...\n");

  for (const marketId of marketIds) {
    try {
      const market = await BeliefMarket.getReplicaBet(marketId);

      if (market.creator !== "0x0000000000000000000000000000000000000000") {
        activeMarkets++;
        const expiryDate = new Date(Number(market.expiryTime) * 1000);

        console.log(`✅ [${activeMarkets}] ${marketId}`);
        console.log(`   Creator: ${market.creator}`);
        console.log(`   Vote Stake: ${hre.ethers.formatEther(market.voteStake)} ETH`);
        console.log(`   Expires: ${expiryDate.toLocaleString()}`);
        console.log(`   Resolved: ${market.isResolved}`);
        console.log("");
      }
    } catch (error) {
      // Market doesn't exist
    }
  }

  console.log(`\n📊 Total Active Markets: ${activeMarkets}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
