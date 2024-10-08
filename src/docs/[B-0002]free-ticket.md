# Free Tickets API

This document outlines the process of creating and managing free tickets through our API, including the underlying smart contract deployment and indexing processes.

## Creating Free Tickets

### Endpoint: POST /api/v1/applications/{applicationId}/tickets/deploy

**Headers:**

```
Authorization: Bearer {developer_access_token}
```

**Request Body:**

```json
{
  "name": "VIP Access Pass",
  "description": "Exclusive access to our event",
  "initialSupply": 100,
  "maxSupply": 1000,
  "transferable": true,
  "whitelistOnly": true
}
```

**Response:**

```json
{
  "ticketId": "ticket_123456",
  "name": "VIP Access Pass",
  "description": "Exclusive access to our event",
  "contractAddress": "0x1234567890123456789012345678901234567890",
  "initialSupply": 100,
  "maxSupply": 1000,
  "transferable": true,
  "whitelistOnly": true
}
```

## Behind the Scenes

1. **Pre-generated Smart Contracts**

   - We maintain a set of pre-generated Solidity smart contracts for ticket management.
   - These contracts are designed to be configurable based on the API request parameters.
   - The contracts implement the ERC-1155 standard for multi-token support.

2. **Smart Contract Deployment**

   - When a developer calls the ticket creation API, we select an appropriate pre-generated contract.
   - We configure the contract with the parameters provided in the API request (name, description, initialSupply, maxSupply, etc.).
   - The contract is deployed to the blockchain using a gas-efficient deployment process.

3. **Backend Indexing**

   - Our backend system monitors the blockchain for new contract deployments.
   - Once the ticket contract is deployed, we index its address and associate it with the developer's application.
   - This indexing allows us to provide additional API endpoints for ticket management, such as increasing supply or checking ticket balances.

4. **Whitelist Management**

   - The backend maintains a mapping of user emails to their corresponding wallet addresses.
   - When the whitelist is updated with email addresses, our backend translates these to wallet addresses before interacting with the smart contract.
   - The smart contract's whitelist is managed with wallet addresses, but developers only need to work with email addresses.

5. **Transfer Restrictions**
   - If `whitelistOnly` is set to true, the smart contract enforces that tickets can only be transferred to addresses on the whitelist.
   - This ensures that only verified users of the application can receive tickets.

## Additional API Endpoints

### Increase Ticket Supply

**Endpoint:** PUT /api/v1/applications/{applicationId}/tickets/{ticketId}/supply

**Request Body:**

```json
{
  "additionalSupply": 50
}
```

**Response:**

```json
{
  "ticketId": "ticket_123456",
  "newTotalSupply": 150,
  "maxSupply": 1000
}
```

### Update Whitelist

**Endpoint:** PUT /api/v1/applications/{applicationId}/tickets/{ticketId}/whitelist

**Request Body:**

```json
{
  "addEmails": ["user1@example.com", "user2@example.com"],
  "removeEmails": ["user3@example.com"]
}
```

**Response:**

```json
{
  "ticketId": "ticket_123456",
  "whitelistCount": 105
}
```

### Distribute Tickets

**Endpoint:** POST /api/v1/applications/{applicationId}/tickets/{ticketId}/distribute

**Headers:**

```
Authorization: Bearer {developer_access_token}
```

**Request Body:**

```json
{
  "distributions": [
    { "email": "user1@example.com", "amount": 2 },
    { "email": "user2@example.com", "amount": 1 },
    { "email": "user3@example.com", "amount": 3 }
  ]
}
```

**Response:**

```json
{
  "ticketId": "ticket_123456",
  "distributionsCompleted": 3,
  "totalDistributed": 6,
  "failedDistributions": []
}
```

**Process:**

1. The API verifies that the developer has sufficient tickets to distribute.
2. For each email in the distribution list:
   - The system looks up the corresponding wallet address.
   - If the address is whitelisted (when required), the ticket is transferred to the user's wallet.
   - If the transfer is successful, the distribution is recorded.
3. If any distributions fail (e.g., email not found, not whitelisted, or transfer fails), they are recorded in `failedDistributions`.

This endpoint allows developers to easily distribute tickets to their end users without requiring the users to mint the tickets themselves. It handles the complexity of wallet address lookup and ticket transfer behind the scenes.
