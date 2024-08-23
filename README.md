This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

# API Documentation

## Onboarding

### POST /api/auth/onboarding

This endpoint requires an email in the request body and sends a verification code to the provided email.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

- **200 OK**: Verification code sent successfully.
- **400 Bad Request**: Invalid email format.

### POST /api/auth/onboarding/verify

This endpoint requires a verification code from the previous request. <br/>
- Creates a Starknet Argent account.
- Sending initial funds to the created account by [gasless or normal transaction in case gasless failed] from operator(App wallet) account.
- Deploys the created account.
- Creates Vault Item for the created account with credentials.

**Request Body:**

```json
{
  "code": "verification_code"
}
```

**Response body:**

```json
{
  "accessToken": string,
  "refreshToken": string,
  "user": {
    "email": string,
    "isDeployed": boolean,
    "walletAddress": string,
    "vaultKey": string,
  }
}
```

**Response:**

- **200 OK**: Account created and session data returned.
- **400 Bad Request**: Invalid verification code.
- **500 Internal Server Error**: Failed to create user.

## Onboard your users

### POST /api/auth/[developerId]/onboarding

This endpoint requires an email in the request body and sends a verification code to the provided email.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

- **200 OK**: Verification code sent successfully.
- **400 Bad Request**: Invalid email format.

### POST /api/auth/[developerId]/onboarding/verify

This endpoint requires a verification code from the previous request. <br/>
- Creates a Starknet Argent account.
- Sending initial funds to the created account by [gasless or normal transaction in case gasless failed] from operator(App wallet) account.
- Deploys the created account.
- Creates Vault Item for the created account with credentials.
- Connects the created account with the developer account.

**Request Body:**

```json
{
  "code": "verification_code"
}
```

**Response body:**

```json
{
  "accessToken": string,
  "refreshToken": string,
  "user": {
    "email": string,
    "isDeployed": boolean,
    "walletAddress": string,
    "vaultKey": string,
  }
}
```

**Response status:**

- **200 OK**: Account created and session data returned.
- **400 Bad Request**: Invalid verification code.
- **500 Internal Server Error**: Failed to create user.

## Create ERC20 Token

### POST /api/public/token/create - Developer only

This endpoint requires a supply amount, token name, and symbol in the request body. <br/>
It creates an ERC20 token and returns the token address with token details.

**Request Body:**

```json
{
  "supplyAmount": 210000000,
  "name": "YourTokenName",
  "symbol": "Symbol"
}
```

**Required Headers:**
```json
{
  "headers": {
    "Authorization": "Bearer [developerAccessToken]"
  }
}
```

**Response:**

- **200 OK**: Erc20 token created successfully.
- **400 Bad Request**: Invalid or missing token details.

## Get ERC20 Token available functions

### GET /api/public/token/functions

This endpoint returns the available functions for an ERC20 token.

**Example Response:**

```json
{
  "readFunctions": [
    {
      "name": "total_supply",
      "inputs": []
    }
  ],
  "writeFunctions": [
    {
      "name": "transfer",
      "inputs": [
        {
          "name": "to",
          "type": "address"
        },
        {
          "name": "value",
          "type": "number"
        }
      ]
    }
  ]
}
```

**Response:**

- **200 OK**: ERC20 token functions returned successfully.

## Interact with ERC20 Token

### POST /api/public/token/[contractAddress]/[functionName]

This endpoint requires a contract address, function name, and function inputs in the request body. It interacts with the ERC20 token contract and returns the transaction hash or function result.

**Request Body example:**

```json
{
  "recipient": "0x1234567890abcdef1234567890abcdef12345678",
  "amount": 100
}
```

**Response:**

- **200 OK**: ERC20 token function executed successfully.
- **400 Bad Request**: Invalid or missing function inputs.
