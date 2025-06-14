const hre = require("hardhat");

async function main() {
    const EP = await hre.ethers.deployContract("EntryPoint");
    await EP.waitForDeployment();
    console.log(`EP deployed to ${EP.target}`);

    const [signer] = await hre.ethers.getSigners();
    const addr1 = await signer.getAddress();
    console.log("Addr1 ", addr1);

    const Factory = await hre.ethers.deployContract("AccountFactory");
    await Factory.waitForDeployment();
    console.log(`Factory deployed to ${Factory.target}`);

    await EP.depositTo(addr1, {
    value: hre.ethers.parseEther("100"),
  });
  console.log("deposit was successful!");


}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});