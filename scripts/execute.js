const hre = require("hardhat");

const EP_address = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
const AF_address = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

async function main() {
    const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");
    const EntryPoint = await hre.ethers.getContractAt("EntryPoint", EP_address);
    const Account = await hre.ethers.getContractFactory("Account");

    const [signer] = await hre.ethers.getSigners();
    const addr1 = await signer.getAddress();
    console.log("Addr1 ", addr1);

    // Calculate the correct sender address using CREATE2 (matching contract logic)
    // const salt = hre.ethers.keccak256(hre.ethers.solidityPacked(["address"], [addr1]));
    // const creationCode = Account.bytecode;
    // const constructorArgs = hre.ethers.AbiCoder.defaultAbiCoder().encode(["address"], [addr1]);
    // const bytecode = creationCode + constructorArgs.slice(2);
    // const bytecodeHash = hre.ethers.keccak256(bytecode);
    
    // const sender = hre.ethers.getCreate2Address(AF_address, salt, bytecodeHash);
    // console.log("Sender", sender);

    // Create initCode
    const initCode = AF_address + AccountFactory.interface.encodeFunctionData("createAccount", [addr1]).slice(2);
    console.log("init code", initCode);

    // Get nonce
    const nonce = await EntryPoint.getNonce(sender, 0);
    const callData = Account.interface.encodeFunctionData("counter");
    console.log("nonce", nonce);
    console.log("calldata", callData);

    // Create user operation
    const userOp = {
        sender,
        nonce,
        initCode,
        callData,
        callGasLimit: 200_000,
        verificationGasLimit: 200_000,
        preVerificationGas: 50_000,
        maxFeePerGas: hre.ethers.parseUnits("20", "gwei"),
        maxPriorityFeePerGas: hre.ethers.parseUnits("2", "gwei"),
        paymasterAndData: "0x",
        signature: '0x',
    };

    // Get user operation hash for signing
    const userOpHash = await EntryPoint.getUserOpHash(userOp);
    console.log("user op hash", userOpHash);

    // Sign the user operation hash
    const signature = await signer.signMessage(hre.ethers.getBytes(userOpHash));
    console.log("signature", signature);

    // Update userOp with signature
    userOp.signature = signature;
    console.log("userop", userOp);

    try {
        const txHash = await EntryPoint.handleOps([userOp], addr1);
        console.log("tx hash", txHash);
    } catch (error) {
        console.error("Transaction failed:", error.message);
        
        // Try to get more details about the failure
        if (error.data) {
            console.log("Error data:", error.data);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});