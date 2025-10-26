import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Deploys the ConfessionVault contract to the configured network
 * Saves the deployed address to frontend environment file
 */
async function main() {
  console.log("Starting deployment...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy ConfessionVault
  console.log("Deploying ConfessionVault...");
  const ConfessionVault = await ethers.getContractFactory("ConfessionVault");
  const vault = await ConfessionVault.deploy();

  await vault.waitForDeployment();
  const address = await vault.getAddress();

  console.log("ConfessionVault deployed to:", address);
  console.log("Transaction hash:", vault.deploymentTransaction()?.hash);

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    contractAddress: address,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    blockNumber: vault.deploymentTransaction()?.blockNumber,
  };

  // Save to file
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentsDir, "latest.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Update frontend env file
  const frontendEnvPath = path.join(__dirname, "../../frontend/.env.local");
  let envContent = "";

  if (fs.existsSync(frontendEnvPath)) {
    envContent = fs.readFileSync(frontendEnvPath, "utf-8");
  }

  // Update or add contract address
  const addressLine = `NEXT_PUBLIC_CONFESSION_VAULT_ADDRESS=${address}`;
  if (envContent.includes("NEXT_PUBLIC_CONFESSION_VAULT_ADDRESS=")) {
    envContent = envContent.replace(
      /NEXT_PUBLIC_CONFESSION_VAULT_ADDRESS=.*/,
      addressLine
    );
  } else {
    envContent += `\n${addressLine}\n`;
  }

  fs.writeFileSync(frontendEnvPath, envContent);
  console.log("\nDeployment info saved to:", path.join(deploymentsDir, "latest.json"));
  console.log("Frontend .env.local updated with contract address");

  console.log("\n✅ Deployment complete!");
  console.log("\nNext steps:");
  console.log("1. Verify contract on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${address}`);
  console.log("2. Update frontend with contract ABI from artifacts/");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
