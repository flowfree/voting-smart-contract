const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying contract with the account:', deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString());

  const Voting = await ethers.getContractFactory('Voting');
  const contract = await Voting.deploy();

  console.log('Contract address:', contract.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.log(error);
    process.exit(1);
  });
