import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("🚀 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  
  // Deploy MockMocaNFT (ERC721)
  console.log("\n📝 Deploying MockMocaNFT...");
  const MockMocaNFT = await ethers.getContractFactory("MockMocaNFT");
  const mockMocaNFT = await MockMocaNFT.deploy();
  await mockMocaNFT.waitForDeployment();
  const nftAddress = await mockMocaNFT.getAddress();
  
  console.log("✅ MockMocaNFT deployed to:", nftAddress);
  
  // Deploy MocaStaking
  console.log("\n📝 Deploying MocaStaking...");
  const MocaStaking = await ethers.getContractFactory("MocaStaking");
  const mocaStaking = await MocaStaking.deploy(nftAddress);
  await mocaStaking.waitForDeployment();
  const stakingAddress = await mocaStaking.getAddress();
  
  console.log("✅ MocaStaking deployed to:", stakingAddress);
  
  // Verify contracts on Etherscan
  console.log("\n🔍 Verifying contracts on Etherscan...");
  try {
    // Verify MockMocaNFT
    console.log("Verifying MockMocaNFT...");
    await hre.run("verify:verify", {
      address: nftAddress,
      constructorArguments: [],
    });
    console.log("✅ MockMocaNFT verified!");
  } catch (error) {
    console.log("⚠️  MockMocaNFT verification failed:", error);
  }
  
  try {
    // Verify MocaStaking
    console.log("Verifying MocaStaking...");
    await hre.run("verify:verify", {
      address: stakingAddress,
      constructorArguments: [nftAddress],
    });
    console.log("✅ MocaStaking verified!");
  } catch (error) {
    console.log("⚠️  MocaStaking verification failed:", error);
  }
  
  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network:", await ethers.provider.getNetwork().then(n => n.name));
  console.log("Chain ID:", await ethers.provider.getNetwork().then(n => n.chainId));
  console.log("\n📍 Contract Addresses:");
  console.log("  MockMocaNFT:", nftAddress);
  console.log("  MocaStaking:", stakingAddress);
  console.log("\n🔗 Etherscan Links:");
  console.log("  NFT:", `https://sepolia.etherscan.io/address/${nftAddress}`);
  console.log("  Staking:", `https://sepolia.etherscan.io/address/${stakingAddress}`);
  console.log("\n⚙️  Configuration for Backend/Frontend:");
  console.log(`NFT_CONTRACT_ADDRESS=${nftAddress}`);
  console.log(`STAKING_CONTRACT_ADDRESS=${stakingAddress}`);
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
