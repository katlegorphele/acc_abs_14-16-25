// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@account-abstraction/contracts/core/EntryPoint.sol";
import "@account-abstraction/contracts/interfaces/IAccount.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "hardhat/console.sol";


contract Account is IAccount {
    uint256 public count; // to debug 
    address public owner;
    string greeting; // just a debug

    constructor(address _owner) {
        owner = _owner;
        greeting = 'Hi from solidity';
    }



    // Verifies that a user operation is valid and allowed by checking:
    // - The user's signature (to ensure the request is genuinely from them).
    // - The nonce (to prevent the same operation from being processed more than once aka replay attack).
    // If everything is valid, it returns a success code, 0.
    // If not, it either returns a specific error code, 1 or reverts the transaction.

    function validateUserOp(UserOperation calldata userOp, bytes32 userOpHash, uint256)
    external view returns (uint256 validationData) {

        address recovered = ECDSA.recover(ECDSA.toEthSignedMessageHash(userOpHash), userOp.signature);
        console.log(recovered);
        return owner == recovered ? 0 : 1;
    }

    function counter() external {
        count++;
    }

    function sendGreeting() view external returns (string memory) {
        return greeting;
    }
}

contract AccountFactory {
    function createAccount(address owner) external returns (address) {
        bytes32 salt = bytes32(uint256(uint160(owner)));
        bytes memory creationCode = type(Account).creationCode;
        bytes memory bytecode = abi.encodePacked(creationCode, abi.encode(owner));

        address addr = Create2.computeAddress(salt, keccak256(bytecode));
        uint256 codeSize = addr.code.length;
        if (codeSize > 0) {
            return addr;
        }

        return deploy(salt, bytecode);
    }
    function deploy(bytes32 salt, bytes memory bytecode) internal returns (address addr) {
        // require(address(this).balance >= amount, "Create2: insufficient balance");
        require(bytecode.length != 0, "Create2: bytecode length is zero");
        assembly {
            addr := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }
        require(addr != address(0), "Create2: Failed on deploy");
    }
}