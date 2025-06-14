const hre = require("hardhat");

const EP_address = "0x5fbdb2315678afecb367f032d93f642f64180aa3"
const AF_address = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512"

async function main() {
  const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");
  const EntryPoint = await hre.ethers.getContractAt("EntryPoint", EP_address);
  const Account = await hre.ethers.getContractFactory("Account");

  const [signer] = await hre.ethers.getSigners();
  const addr1 = await signer.getAddress();

  const initCode = AF_address + AccountFactory.interface.encodeFunctionData("createAccount", [addr1]).slice(2);

  let sender;
  try {
    await EntryPoint.getSenderAddress(initCode);
  } catch (error) {
    sender = "0x" + error.data.data.slice(-40);
  }

  console.log("📦 Smart Wallet Address:", sender);
  console.log("💰 EntryPoint balance:", await EntryPoint.balanceOf(sender));

  const userOp = {
    sender,
    nonce: await EntryPoint.getNonce(sender, 0),
    initCode:'0x',
    callData: Account.interface.encodeFunctionData("counter"),
    callGasLimit: 400_000,
    verificationGasLimit: 400_000,
    preVerificationGas: 100_000,
    maxFeePerGas: hre.ethers.parseUnits("30", "gwei"),
    maxPriorityFeePerGas: hre.ethers.parseUnits("30", "gwei"),
    paymasterAndData: "0x",
    signature: "0x",
  };

  const userOpHash = await EntryPoint.getUserOpHash(userOp);
  const signature = await signer.signMessage(hre.ethers.getBytes(userOpHash));
  userOp.signature = signature;

  const tx = await EntryPoint.handleOps([userOp], addr1);
  console.log("✅ handleOps tx hash:", tx.hash);

  const deployed = await hre.ethers.getContractAt("Account", sender);
  const count = await deployed.count();
  console.log("🔁 Updated count:", count.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
