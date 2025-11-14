const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const marketId = process.env.MARKET_ID || process.argv[2];
  if (!marketId) {
    throw new Error("Please provide MARKET_ID via env or as the first CLI argument.");
  }

  const deploymentPath = path.join(__dirname, "../deployments/sepolia-deployment.json");
  if (!fs.existsSync(deploymentPath)) {
    throw new Error("Deployment file not found. Deploy the contract first.");
  }

  const { contractAddress } = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const beliefMarket = await ethers.getContractAt("BeliefMarket", contractAddress);

  console.log(`\n🔐 Preparing public decryption for market: ${marketId}`);
  const tx = await beliefMarket.authorizeReplicaReveal(marketId);
  console.log("⏳ Transaction submitted:", tx.hash);
  await tx.wait(2);

  const [yesHandle, noHandle, pending] = await beliefMarket.getReplicaDecryptHandles(marketId);
  console.log("\n✅ Handles marked decryptable:");
  console.log("   YES handle:", yesHandle);
  console.log("   NO handle :", noHandle);
  console.log("   Pending   :", pending);
  console.log(
    "\nℹ️  Use the frontend或 relayer SDK publicDecrypt(handles) 获取明文和 proof，再调用 submitReplicaTally 完成揭晓。"
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
