# Implementation Summary: ERC-1155 Ticket System Deployment

## Overview

This document outlines the implementation of an ERC-1155 ticket system deployment process. It uses Privy for developer wallet management and Viem for blockchain interactions. The system allows for contract deployment on behalf of developers, with ownership transferred to the developer's account.

## Key Components

1. **Privy**: Manages developer wallets securely.
2. **Viem**: Handles blockchain interactions and ABI encoding.
3. **ERC-1155 Smart Contract**: Implements the ticket logic.
4. **Deployer Account**: Our account used to deploy contracts and pay for gas fees.

## Architecture

```
[Developer] -> [Our API] -> [Privy] -> [Our Deployer Account] -> [Blockchain]
                    ^
                    |
                [Viem Library]
```

## Implementation Steps

### 1. Smart Contract Development

- Develop an ERC-1155 contract.
- Implement functions for ticket deployment, minting, and management.
- Ensure the constructor accepts an owner address as the first parameter.
- Compile the contract to generate ABI and bytecode.

Example contract structure:

```solidity
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FreeTicket is ERC1155, Ownable {
    constructor(
        address owner,
        string memory uri,
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint256 maxSupply,
        bool transferable,
        bool whitelistOnly
    ) ERC1155(uri) {
        _transferOwnership(owner);
        // Additional initialization logic
    }

    // Other necessary functions...
}
```

### 2. Backend Setup

Install necessary packages:

```bash
npm install viem @privy-io/privy-node
```

Set up key components:

```typescript
import { createPublicClient, http, createWalletClient, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { PrivyClient } from "@privy-io/privy-node";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const privyClient = new PrivyClient(process.env.PRIVY_API_KEY);

const deployerAccount = privateKeyToAccount(process.env.DEPLOYER_PRIVATE_KEY);

const walletClient = createWalletClient({
  account: deployerAccount,
  chain: mainnet,
  transport: http(),
});
```

### 3. Implement Contract Deployment

```typescript
async function deployTicketContract(developerId, config) {
  const developerWallet = await privyClient.getWallet(developerId);

  const gasEstimate = await publicClient.estimateContractGas({
    abi: CONTRACT_ABI,
    bytecode: CONTRACT_BYTECODE,
    args: [
      developerWallet.address,
      config.name,
      config.symbol,
      config.initialSupply,
      config.maxSupply,
      config.transferable,
      config.whitelistOnly,
    ],
    account: deployerAccount.address,
  });

  const hash = await walletClient.deployContract({
    abi: CONTRACT_ABI,
    bytecode: CONTRACT_BYTECODE,
    args: [
      developerWallet.address,
      config.name,
      config.symbol,
      config.initialSupply,
      config.maxSupply,
      config.transferable,
      config.whitelistOnly,
    ],
    gas: gasEstimate,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  const deploymentCost = receipt.gasUsed * receipt.effectiveGasPrice;

  return {
    contractAddress: receipt.contractAddress,
    deploymentCost: deploymentCost,
    transactionHash: hash,
  };
}
```

### 4. API Endpoint

```typescript
app.post(
  "/api/v1/applications/:applicationId/tickets/deploy",
  async (req, res) => {
    try {
      const config = req.body;
      const developerId = getDeveloperIdFromToken(req.headers.authorization);

      const { contractAddress, deploymentCost, transactionHash } =
        await deployTicketContract(developerId, config);

      await saveContractDetails(
        req.params.applicationId,
        developerId,
        contractAddress,
        deploymentCost,
        transactionHash,
        config
      );

      res.json({ success: true, contractAddress, transactionHash });
    } catch (error) {
      console.error("Deployment failed:", error);
      res.status(500).json({ error: "Failed to deploy ticket contract" });
    }
  }
);
```

## Key Points

1. **Deployment Process**: Contracts are deployed using our deployer account, but ownership is set to the developer's address obtained from Privy.
2. **Gas Fees**: Our deployer account covers gas fees. These costs are tracked and associated with each developer.
3. **Cost Tracking**: Deployment costs are calculated and stored for each deployment onchain. This helps us manage costs and ensure transparency.
