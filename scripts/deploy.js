const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n🚀 Starting BeliefMarket deployment...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  if (balance < ethers.parseEther("0.1")) {
    console.warn("⚠️  Warning: Low balance. You might need more ETH for deployment.");
  }

  // Deploy BeliefMarket contract
  console.log("📦 Deploying BeliefMarket contract...");
  const BeliefMarket = await ethers.getContractFactory("BeliefMarket");

  const beliefMarket = await BeliefMarket.deploy();
  await beliefMarket.waitForDeployment();

  const contractAddress = await beliefMarket.getAddress();
  console.log("✅ BeliefMarket deployed to:", contractAddress);

  // Get deployment transaction
  const deployTx = beliefMarket.deploymentTransaction();
  console.log("📋 Deployment tx hash:", deployTx.hash);

  // Wait for confirmations
  console.log("\n⏳ Waiting for confirmations...");
  await deployTx.wait(3);
  console.log("✅ Contract confirmed after 3 blocks\n");

  // Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    contractName: "BeliefMarket",
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTxHash: deployTx.hash,
    deploymentTimestamp: new Date().toISOString(),
    blockNumber: deployTx.blockNumber,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
  };

  // Save to JSON file
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, "sepolia-deployment.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentFile);

  // Update frontend config
  console.log("\n📝 Updating frontend configuration...");
  const frontendEnvPath = path.join(__dirname, "../webapp/.env");
  if (fs.existsSync(frontendEnvPath)) {
    let envContent = fs.readFileSync(frontendEnvPath, "utf8");
    if (envContent.includes("VITE_BELIEF_MARKET_ADDRESS=")) {
      envContent = envContent.replace(
        /VITE_BELIEF_MARKET_ADDRESS=.*/g,
        `VITE_BELIEF_MARKET_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nVITE_BELIEF_MARKET_ADDRESS=${contractAddress}\n`;
    }
    fs.writeFileSync(frontendEnvPath, envContent.trim() + "\n");
    console.log("✅ webapp/.env updated with contract address");
  } else {
    console.warn("⚠️  webapp/.env not found. Please update VITE_BELIEF_MARKET_ADDRESS manually.");
  }

  // Display summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 Deployment completed successfully!");
  console.log("=".repeat(60));
  console.log("\n📋 Deployment Summary:");
  console.log("├─ Network:", deploymentInfo.network);
  console.log("├─ Contract:", deploymentInfo.contractName);
  console.log("├─ Address:", deploymentInfo.contractAddress);
  console.log("├─ Deployer:", deploymentInfo.deployer);
  console.log("├─ Tx Hash:", deploymentInfo.deploymentTxHash);
  console.log("└─ Chain ID:", deploymentInfo.chainId);

  console.log("\n🔗 Etherscan:");
  console.log(`   https://sepolia.etherscan.io/address/${contractAddress}`);

  console.log("\n📝 Next Steps:");
  console.log("1. Verify the contract:");
  console.log(`   npx hardhat verify --network sepolia ${contractAddress}`);
  console.log("\n2. Update backend .env with contract address:");
  console.log(`   BELIEF_MARKET_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("\n3. Test the deployment:");
  console.log("   npx hardhat run scripts/verify.js --network sepolia");
  console.log("\n4. Start the frontend:");
  console.log("   cd webapp && npm run dev\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
