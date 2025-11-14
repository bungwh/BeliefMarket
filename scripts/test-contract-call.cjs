const hre = require("hardhat");

async function main() {
  const contractAddress = "0x2ab08f76e36E88CA359Ed510b2110b520309EB21";
  const marketId = "btc-100k-2025";
  
  console.log("Testing contract call...");
  console.log("Contract:", contractAddress);
  console.log("Market ID:", marketId);
  console.log("");
  
  const contract = await hre.ethers.getContractAt(
    "ObscuraBeliefMarket",
    contractAddress
  );
  
  try {
    const bet = await contract.getReplicaBet(marketId);
    console.log("✅ Successfully fetched market data:");
    console.log("  Title:", bet[0]);
    console.log("  Description:", bet[1]);
    console.log("  Vote Stake:", hre.ethers.formatEther(bet[4]), "ETH");
    console.log("  Expiry:", new Date(Number(bet[5]) * 1000).toLocaleString());
    console.log("  Is Resolved:", bet[6]);
  } catch (error) {
    console.error("❌ Error fetching market data:");
    console.error(error.message);
  }
}

main().catch(console.error);
