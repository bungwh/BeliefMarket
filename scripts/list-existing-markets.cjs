const hre = require("hardhat");

async function main() {
  const contractAddress = "0xE07C68DF850343B92668a2285A64c9442D7A1016";
  
  console.log("📋 Listing existing markets on contract...");
  console.log(`📍 Address: ${contractAddress}\n`);

  const BeliefMarket = await hre.ethers.getContractAt(
    "BeliefMarket",
    contractAddress
  );

  // Common market IDs to check
  const possibleIds = [
    "market-1", "market-2", "market-3", "market-4", "market-5",
    "test-1", "test-2", "test-3", "test-4", "test-5",
    "BTC_100K", "ETH_5K", "ZAMA_LAUNCH", "DEFI_TVL", "NFT_SURGE",
    "crypto-prediction-1", "prediction-1", "demo-1"
  ];

  const foundMarkets = [];

  for (const id of possibleIds) {
    try {
      const market = await BeliefMarket.getReplicaBet(id);
      if (market.creator !== "0x0000000000000000000000000000000000000000") {
        foundMarkets.push({
          id,
          creator: market.creator,
          voteStake: market.voteStake,
          expiryTime: market.expiryTime,
          isResolved: market.isResolved,
          prizePool: market.prizePool
        });
      }
    } catch (error) {
      // Market doesn't exist, continue
    }
  }

  if (foundMarkets.length === 0) {
    console.log("❌ No markets found with common IDs");
    console.log("\n💡 Try checking Etherscan events for the actual market IDs:");
    console.log(`   https://sepolia.etherscan.io/address/${contractAddress}#events`);
  } else {
    console.log(`✅ Found ${foundMarkets.length} markets:\n`);
    
    foundMarkets.forEach((market, index) => {
      const expiryDate = new Date(Number(market.expiryTime) * 1000);
      console.log(`[${index + 1}] Market ID: ${market.id}`);
      console.log(`    Creator: ${market.creator}`);
      console.log(`    Vote Stake: ${hre.ethers.formatEther(market.voteStake)} ETH`);
      console.log(`    Prize Pool: ${hre.ethers.formatEther(market.prizePool)} ETH`);
      console.log(`    Expires: ${expiryDate.toLocaleString()}`);
      console.log(`    Resolved: ${market.isResolved}`);
      console.log("");
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
