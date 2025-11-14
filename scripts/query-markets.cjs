const hre = require("hardhat");

async function main() {
  const contractAddress = "0x2ab08f76e36E88CA359Ed510b2110b520309EB21";
  
  console.log("📊 Querying BeliefMarket contract...");
  console.log("Contract:", contractAddress);
  
  const contract = await hre.ethers.getContractAt(
    "ObscuraBeliefMarket",
    contractAddress
  );
  
  const betIds = await contract.getReplicaBetIds();
  console.log("\n✅ Found", betIds.length, "markets:");
  
  for (let i = 0; i < betIds.length; i++) {
    const betId = betIds[i];
    const bet = await contract.getReplicaBet(betId);
    console.log(`\n[${i + 1}] ${betId}`);
    console.log(`  Title: ${bet[0]}`);
    console.log(`  Vote Stake: ${hre.ethers.formatEther(bet[4])} ETH`);
    console.log(`  Expiry: ${new Date(Number(bet[5]) * 1000).toLocaleDateString()}`);
  }
}

main().catch(console.error);
