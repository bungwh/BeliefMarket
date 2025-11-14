const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const deploymentFile = path.join(__dirname, "../deployments/sepolia-deployment.json");
  if (!fs.existsSync(deploymentFile)) {
    throw new Error("Deployment file not found. Deploy contract first.");
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  const beliefMarket = await ethers.getContractAt("BeliefMarket", contractAddress);
  const platformStake = await beliefMarket.platformStake();
  const minVoteStake = await beliefMarket.MIN_VOTE_STAKE();

  console.log("Using contract:", contractAddress);
  console.log("Platform stake:", ethers.formatEther(platformStake), "ETH");
  console.log("Min vote stake:", ethers.formatEther(minVoteStake), "ETH");

  const voteStake = minVoteStake; // use minimum
  const day = 24 * 60 * 60;

  const markets = [
    {
      id: `TEST-BTC-${Date.now()}`,
      title: "比特币是否会突破 120000 美元？",
      description: "关注 2025 年第一季度 BTC 价格表现。",
      duration: BigInt(day * 7)
    },
    {
      id: `TEST-ETH-${Date.now() + 1}`,
      title: "以太坊是否会在下次升级前突破 5000 美元？",
      description: "追踪上海之后的 L2 繁荣对 ETH 价格的影响。",
      duration: BigInt(day * 10)
    },
    {
      id: `TEST-AI-${Date.now() + 2}`,
      title: "AI 主题代币总市值是否会超过 30B？",
      description: "覆盖 FET、AGIX 等主要 AI 代币表现。",
      duration: BigInt(day * 5)
    }
  ];

  for (const market of markets) {
    console.log(`\nCreating market ${market.id}...`);
    const tx = await beliefMarket.createReplicaBet(
      market.id,
      market.title,
      market.description,
      voteStake,
      market.duration,
      { value: platformStake }
    );
    const receipt = await tx.wait(2);
    console.log(`✅ Created ${market.id} (tx: ${receipt.hash})`);
  }

  console.log("\nAll test markets created.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
