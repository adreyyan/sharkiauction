const hre = require("hardhat");

async function main() {
  console.log("🔨 Deploying Private Auction Contract...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy PrivateAuction
  const PrivateAuction = await hre.ethers.getContractFactory("PrivateAuction");
  console.log("\n📝 Deploying PrivateAuction...");
  
  const auction = await PrivateAuction.deploy();
  await auction.waitForDeployment();
  
  const address = await auction.getAddress();
  console.log("✅ PrivateAuction deployed to:", address);
  console.log("\n📋 Contract Details:");
  console.log("   Network:", hre.network.name);
  console.log("   Address:", address);
  console.log("   Explorer:", `https://sepolia.etherscan.io/address/${address}`);
  
  // Verify contract (optional)
  if (hre.network.name === "sepolia") {
    console.log("\n⏳ Waiting for block confirmations...");
    await auction.deploymentTransaction().wait(5);
    
    console.log("✅ Deployment complete!");
    console.log("\n📝 To verify on Etherscan, run:");
    console.log(`   npx hardhat verify --network sepolia ${address}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

