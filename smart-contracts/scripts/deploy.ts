import { ethers, run, network } from "hardhat";

async function main() {
  console.log("🚀 Deploying MockMocaNFT contract...");

  // Get the contract factory
  const MockMocaNFT = await ethers.getContractFactory("MockMocaNFT");
  
  // Deploy the contract
  const mocaNFT = await MockMocaNFT.deploy();
  await mocaNFT.waitForDeployment();

  const address = await mocaNFT.getAddress();
  
  console.log("✅ MockMocaNFT deployed to:", address);
  console.log("\n📋 Save this address for backend/frontend configuration:");
  console.log("NFT_CONTRACT_ADDRESS=" + address);
  
  // Get deployer info
  const [deployer] = await ethers.getSigners();
  console.log("\n📝 Deployed by:", deployer.address);
  
  // Show network info
  const networkInfo = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "(chainId:", networkInfo.chainId.toString() + ")");
  
  // Verify on Etherscan (if not local network)
  if (network.config.chainId !== 31337 && process.env.ETHERSCAN_API_KEY) {
    console.log("\n⏳ Waiting 30 seconds before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    try {
      console.log("🔍 Verifying contract on Etherscan...");
      await run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified!");
    } catch (error: any) {
      console.log("⚠️  Verification failed:", error.message);
    }
  }
  
  console.log("\n🎉 Deployment complete!");
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

