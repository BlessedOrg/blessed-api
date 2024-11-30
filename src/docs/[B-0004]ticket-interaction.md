# Ticket Contract Interaction

This document outlines the process of interacting with deployed ERC-1155 ticket contracts using the Gelato relayer to sponsor transaction fees for developers and their end users.

## Prerequisites

- The contract address for each deployed ticket is stored in our database, associated with the respective application and developer.
- We have integrated the Gelato relayer SDK in our backend.
- We are using Viem for encoding function calls.
- Privy is used for managing developer and user wallet addresses.

## Setup

```typescript
import { createPublicClient, http, encodeFunctionData } from "viem";
import { mainnet } from "viem/chains";
import { GelatoRelay } from "@gelatonetwork/relay-sdk";
import { PrivyClient } from "@privy-io/privy-node";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const privyClient = new PrivyClient(process.env.PRIVY_API_KEY);
const relay = new GelatoRelay();

// Assume we have a function to get contract ABI
const CONTRACT_ABI = getContractABI();
```

## Scenario 1: Adjusting Token Supply

### API Endpoint

```typescript
app.post(
  "/api/v1/applications/:applicationId/tickets/:ticketId/supply",
  async (req, res) => {
    try {
      const { applicationId, ticketId } = req.params;
      const { adjustment } = req.body; // Positive for increase, negative for decrease
      const developerId = getDeveloperIdFromToken(req.headers.authorization);

      const result = await adjustTokenSupply(
        applicationId,
        ticketId,
        adjustment,
        developerId
      );

      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Supply adjustment failed:", error);
      res.status(500).json({ error: "Failed to adjust token supply" });
    }
  }
);
```

### Implementation

```typescript
async function adjustTokenSupply(
  applicationId,
  ticketId,
  adjustment,
  developerId
) {
  const contractAddress = await getContractAddress(applicationId, ticketId);
  const developerWallet = await privyClient.getWallet(developerId);

  const functionName = adjustment > 0 ? "increaseSupply" : "decreaseSupply";
  const data = encodeFunctionData({
    abi: CONTRACT_ABI,
    functionName: functionName,
    args: [Math.abs(adjustment)],
  });

  const request = {
    chainId: mainnet.id,
    target: contractAddress,
    data: data,
    user: developerWallet.address,
  };

  const relayResponse = await relay.sponsoredCall(
    request,
    process.env.GELATO_API_KEY
  );

  return {
    taskId: relayResponse.taskId,
    adjustmentAmount: adjustment,
  };
}
```

## Scenario 2: Distributing Tickets to End Users

### API Endpoint

```typescript
app.post(
  "/api/v1/applications/:applicationId/tickets/:ticketId/distribute",
  async (req, res) => {
    try {
      const { applicationId, ticketId } = req.params;
      const { distributions } = req.body; // Array of {email, amount}
      const developerId = getDeveloperIdFromToken(req.headers.authorization);

      const result = await distributeTickets(
        applicationId,
        ticketId,
        distributions,
        developerId
      );

      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Ticket distribution failed:", error);
      res.status(500).json({ error: "Failed to distribute tickets" });
    }
  }
);
```

### Implementation

```typescript
async function distributeTickets(
  applicationId,
  ticketId,
  distributions,
  developerId
) {
  const contractAddress = await getContractAddress(applicationId, ticketId);
  const developerWallet = await privyClient.getWallet(developerId);

  const distributionResults = [];

  for (const dist of distributions) {
    const userWallet = await privyClient.getWalletForEmail(dist.email);

    const data = encodeFunctionData({
      abi: CONTRACT_ABI,
      functionName: "safeTransferFrom",
      args: [
        developerWallet.address,
        userWallet.address,
        ticketId,
        dist.amount,
        "0x",
      ],
    });

    const request = {
      chainId: mainnet.id,
      target: contractAddress,
      data: data,
      user: developerWallet.address,
    };

    const relayResponse = await relay.sponsoredCall(
      request,
      process.env.GELATO_API_KEY
    );

    distributionResults.push({
      email: dist.email,
      amount: dist.amount,
      taskId: relayResponse.taskId,
    });
  }

  return { distributions: distributionResults };
}
```

## Scenario 3: Managing Whitelist

### API Endpoint

```typescript
app.post(
  "/api/v1/applications/:applicationId/tickets/:ticketId/whitelist",
  async (req, res) => {
    try {
      const { applicationId, ticketId } = req.params;
      const { addEmails, removeEmails } = req.body;
      const developerId = getDeveloperIdFromToken(req.headers.authorization);

      const result = await manageWhitelist(
        applicationId,
        ticketId,
        addEmails,
        removeEmails,
        developerId
      );

      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Whitelist management failed:", error);
      res.status(500).json({ error: "Failed to manage whitelist" });
    }
  }
);
```

### Implementation

```typescript
async function manageWhitelist(
  applicationId,
  ticketId,
  addEmails,
  removeEmails,
  developerId
) {
  const contractAddress = await getContractAddress(applicationId, ticketId);
  const developerWallet = await privyClient.getWallet(developerId);

  const results = {
    added: [],
    removed: [],
    failed: [],
  };

  // Process additions
  for (const email of addEmails) {
    try {
      const userWallet = await privyClient.getWalletForEmail(email);

      const data = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: "addToWhitelist",
        args: [userWallet.address],
      });

      const request = {
        chainId: mainnet.id,
        target: contractAddress,
        data: data,
        user: developerWallet.address,
      };

      const relayResponse = await relay.sponsoredCall(
        request,
        process.env.GELATO_API_KEY
      );
      results.added.push({ email, taskId: relayResponse.taskId });
    } catch (error) {
      console.error(`Failed to add ${email} to whitelist:`, error);
      results.failed.push({ email, action: "add", reason: error.message });
    }
  }

  // Process removals
  for (const email of removeEmails) {
    try {
      const userWallet = await privyClient.getWalletForEmail(email);

      const data = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: "removeFromWhitelist",
        args: [userWallet.address],
      });

      const request = {
        chainId: mainnet.id,
        target: contractAddress,
        data: data,
        user: developerWallet.address,
      };

      const relayResponse = await relay.sponsoredCall(
        request,
        process.env.GELATO_API_KEY
      );
      results.removed.push({ email, taskId: relayResponse.taskId });
    } catch (error) {
      console.error(`Failed to remove ${email} from whitelist:`, error);
      results.failed.push({ email, action: "remove", reason: error.message });
    }
  }

  return results;
}
```
