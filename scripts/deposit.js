const hre = require("hardhat");

const EP_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
// const PM_ADDRESS = "0xB54b8F3bb679a746E6b75805c9019EFF14AFE043";

async function main() {
  const entryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);

  const [signer] = await hre.ethers.getSigners();
    const addr1 = await signer.getAddress();


  await entryPoint.depositTo(addr1, {
    value: hre.ethers.parseEther("2"),
  });
  console.log("deposit was successful!");

  // get user balance on entry point
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});