const hre = require("hardhat");

const EP_address = "0x5fbdb2315678afecb367f032d93f642f64180aa3"
const AF_address = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512"

AF_NONCE =2;

async function main() {
    const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");
    const EntryPoint = await hre.ethers.getContractAt("EntryPoint", EP_address);

    // const sender = await hre.ethers.getCreateAddress({
    //     from : AF_address, 
    //     nonce: AF_NONCE});
    // console.log("Sender", sender);

    const [signer] = await hre.ethers.getSigners();
    const addr1 = await signer.getAddress();
    console.log("Addr1 ", addr1);

    const Account = await hre.ethers.getContractFactory("Account");
    
    const initCode = AF_address + AccountFactory.interface.encodeFunctionData("createAccount", [addr1]).slice(2);
    console.log("init code", initCode);

    let sender
    try {
        await EntryPoint.getSenderAddress(initCode);
    } catch (error) {
        console.log(error.data);
        sender = "0x" + error.data.data.slice(-40);   
    }

    console.log(sender);



    const nonce = await EntryPoint.getNonce(sender, 0);
    const callData = Account.interface.encodeFunctionData("counter");
    console.log("nonce", nonce);
    console.log("calldata", callData);

    userOp = {
        sender, // this is the smart wallet
        nonce,
        initCode,
        callData: Account.interface.encodeFunctionData("counter"),
        callGasLimit:400_000,
        verificationGasLimit: 400_000,
        preVerificationGas: 100_000,
        maxFeePerGas: hre.ethers.parseEther("30","gwei"),
        maxPriorityFeePerGas: hre.ethers.parseEther("30","gwei"),
        paymasterAndData: "0x",
        signature: "0x",
    }
    console.log("userop", userOp);

    // generate signature
    
    

    const txHash = await EntryPoint.handleOps([userOp], addr1);
    // console.log("tx hash", txHash);

    // const userOpHash = await EntryPoint.getUserOpHash(userOp);
    // console.log("user op hash", userOpHash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});