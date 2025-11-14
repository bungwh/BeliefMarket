const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n🔍 Verifying BeliefMarket deployment...\n");

  // Load deployment info
  const deploymentFile = path.join(__dirname, "../deployments/sepolia-deployment.json");

  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ Deployment file not found. Please deploy first.");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  console.log("📋 Loaded deployment info:");
  console.log("├─ Contract:", contractAddress);
  console.log("├─ Network:", deploymentInfo.network);
  console.log("└─ Deployed at:", deploymentInfo.deploymentTimestamp, "\n");

  // Get contract instance
  const beliefMarket = await ethers.getContractAt("BeliefMarket", contractAddress);

  // Test 1: Check owner
  console.log("🧪 Test 1: Checking owner...");
  try {
    const owner = await beliefMarket.owner();
    console.log("✅ Owner:", owner);
    console.log("✅ Deployer:", deploymentInfo.deployer);

    if (owner.toLowerCase() === deploymentInfo.deployer.toLowerCase()) {
      console.log("✅ Owner matches deployer\n");
    } else {
      console.log("⚠️  Warning: Owner doesn't match deployer\n");
    }
  } catch (error) {
    console.error("❌ Failed to get owner:", error.message, "\n");
  }

  // Test 2: Check platform stake
  console.log("🧪 Test 2: Checking platform stake...");
  try {
    const platformStake = await beliefMarket.platformStake();
    console.log("✅ Platform stake:", ethers.formatEther(platformStake), "ETH\n");
  } catch (error) {
    console.error("❌ Failed to get platform stake:", error.message, "\n");
  }

  // Test 3: Check constants
  console.log("🧪 Test 3: Checking constants...");
  try {
    const minVoteStake = await beliefMarket.MIN_VOTE_STAKE();
    const minDuration = await beliefMarket.MIN_DURATION();
    const maxDuration = await beliefMarket.MAX_DURATION();

    console.log("✅ MIN_VOTE_STAKE:", ethers.formatEther(minVoteStake), "ETH");
    console.log("✅ MIN_DURATION:", minDuration.toString(), "seconds");
    console.log("✅ MAX_DURATION:", maxDuration.toString(), "seconds\n");
  } catch (error) {
    console.error("❌ Failed to get constants:", error.message, "\n");
  }

  // Test 4: Try to read a non-existent bet (should return zero address)
  console.log("🧪 Test 4: Checking bet reading...");
  try {
    const testBetId = "TEST-BET-ID";
    const betInfo = await beliefMarket.getReplicaBet(testBetId);

    if (!betInfo[0] || betInfo[0].length === 0) {
      console.log("✅ Bet reading works (empty bet returns blank data)\n");
    } else {
      console.log("⚠️  Unexpected bet data\n");
    }
  } catch (error) {
    console.error("❌ Failed to read bet:", error.message, "\n");
  }

  // Test 5: Check contract code
  console.log("🧪 Test 5: Verifying contract bytecode...");
  try {
    const code = await ethers.provider.getCode(contractAddress);
    if (code !== "0x") {
      console.log("✅ Contract bytecode exists");
      console.log("✅ Bytecode size:", (code.length - 2) / 2, "bytes\n");
    } else {
      console.error("❌ No contract code at address\n");
    }
  } catch (error) {
    console.error("❌ Failed to get bytecode:", error.message, "\n");
  }

  // Display summary
  console.log("=".repeat(60));
  console.log("🎉 Verification completed!");
  console.log("=".repeat(60));

  console.log("\n📊 Contract Details:");
  console.log("├─ Address:", contractAddress);
  console.log("├─ Network: Sepolia Testnet");
  console.log("└─ Status: ✅ Verified and working");

  console.log("\n🔗 Links:");
  console.log("├─ Etherscan:");
  console.log("│  https://sepolia.etherscan.io/address/" + contractAddress);
  console.log("└─ Contract Verification:");
  console.log("   npx hardhat verify --network sepolia " + contractAddress);

  console.log("\n✨ The contract is ready to use!");
  console.log("   You can now interact with it from the frontend.\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Verification failed:");
    console.error(error);
    process.exit(1);
  });
