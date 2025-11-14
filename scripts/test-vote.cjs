const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  console.log("Testing vote with signer:", signer.address);
  
  const contractAddress = "0xc71998a61cA233f22c6Cd38Cd9a655d9309c3f61";
  const contract = await hre.ethers.getContractAt("ObscuraBeliefMarket", contractAddress);
  
  // Get bet info
  const betId = "btc-100k-2025";
  const bet = await contract.getReplicaBet(betId);
  console.log("\nBet info:");
  console.log("- Title:", bet[0]);
  console.log("- Vote Stake:", hre.ethers.formatEther(bet[4]), "ETH");
  console.log("- Expiry:", new Date(Number(bet[5]) * 1000).toISOString());
  console.log("- Is Resolved:", bet[6]);
  
  // Check if already voted
  const hasVoted = await contract.hasReplicaUserVoted(betId, signer.address);
  console.log("\n- Has voted:", hasVoted);
  
  if (hasVoted) {
    console.log("✅ User has already voted. Test complete.");
    return;
  }
  
  console.log("\n❌ Cannot test actual vote without FHE SDK in Node.js");
  console.log("The issue must be in the frontend FHE encryption or parameter passing.");
}

main().catch(console.error);
