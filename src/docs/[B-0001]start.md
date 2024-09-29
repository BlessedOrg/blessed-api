# API Sequences with Privy Integration

This document outlines the API sequences for key processes in our application, with a focus on Privy pre-generated wallet integration:

1. Developer Login and Verification
2. Application Creation
3. Developer's Users Wallet Creation

## Privy Pre-generated Wallet Integration

Before diving into the sequences, let's outline the setup for Privy pre-generated wallets:

1. Initialize the Privy client in your server:

   ```javascript
   import { PrivyClient } from "@privy-io/privy-node";
   const privy = new PrivyClient(PRIVY_API_KEY);
   ```

2. Pre-generate a batch of wallets:

   ```javascript
   const wallets = await privy.createWallets({
     count: 100, // Adjust based on your needs
     chainId: 1, // Ethereum mainnet
   });
   ```

3. Store these pre-generated wallets securely in your database for later use.

## 1. Developer Login and Verification

### Step 1: Initiate Login

- **Endpoint**: POST /api/v1/developers/login
- **Request Body**:
  ```json
  {
    "email": "developer@example.com"
  }
  ```
- **Process**:
  1. Check if the developer exists in the database
  2. If not, create a new developer record
  3. Generate a one-time password (OTP)
  4. Store the OTP and its expiration time in the database
  5. Send the OTP to the developer's email
- **Response**:
  ```json
  {
    "message": "OTP sent to your email"
  }
  ```

### Step 2: Verify OTP

- **Endpoint**: POST /api/v1/developers/verify
- **Request Body**:
  ```json
  {
    "otp": "123456"
  }
  ```
- **Process**:

  1. Validate the OTP against the stored value
  2. If valid and not expired:
     a. Generate an access token using 1Password
     b. Create or retrieve the developer's Privy wallet:

     ```javascript
     let developer = await prisma.developer.findUnique({ where: { email } });
     if (!developer.walletAddress) {
       // Fetch a pre-generated wallet from your database
       const preGeneratedWallet = await fetchPreGeneratedWallet();

       // Associate the wallet with the developer using Privy
       const user = await privy.createUser({
         email: developer.email,
         wallet: {
           address: preGeneratedWallet.address,
           chainId: preGeneratedWallet.chainId,
         },
       });

       // Update developer record with wallet address
       developer = await prisma.developer.update({
         where: { id: developer.id },
         data: { walletAddress: user.wallet.address },
       });
     }
     ```

     c. Store the access token and wallet address in the database

  3. If invalid or expired, return an error

- **Response (Success)**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "walletAddress": "0x1234567890123456789012345678901234567890"
  }
  ```
- **Response (Error)**:
  ```json
  {
    "error": "Invalid or expired OTP"
  }
  ```

## 2. Application Creation

After a developer has logged in and been verified, they need to create an application before they can onboard users.

### Create Application

- **Endpoint**: POST /api/v1/applications
- **Headers**:
  ```
  Authorization: Bearer {developer_access_token}
  ```
- **Request Body**:
  ```json
  {
    "name": "My Awesome App"
  }
  ```
- **Process**:
  1. Validate the developer's access token
  2. Create a new application in the database:
     ```javascript
     const application = await prisma.application.create({
       data: {
         name: req.body.name,
         developer: { connect: { id: developerId } },
       },
     });
     ```
- **Response**:
  ```json
  {
    "id": "app_123456",
    "name": "My Awesome App",
    "createdAt": "2023-09-29T12:00:00Z"
  }
  ```

## 3. Developer's Users Wallet Creation

Now that the developer has created an application, they can onboard users to it.

### Step 1: Onboard Users

- **Endpoint**: POST /api/v1/applications/{applicationId}/users
- **Headers**:
  ```
  Authorization: Bearer {developer_access_token}
  ```
- **Request Body**:
  ```json
  {
    "users": [
      { "email": "user1@example.com" },
      { "email": "user2@example.com" }
    ]
  }
  ```
- **Process**:

  1. Validate the developer's access token
  2. Verify that the application exists and belongs to the developer
  3. For each user email:

     ```javascript
     const onboardUser = async (email) => {
       let user = await prisma.user.findUnique({ where: { email } });
       if (!user) {
         // Fetch a pre-generated wallet from your database
         const preGeneratedWallet = await fetchPreGeneratedWallet();

         // Create a new user with Privy
         const privyUser = await privy.createUser({
           email,
           wallet: {
             address: preGeneratedWallet.address,
             chainId: preGeneratedWallet.chainId,
           },
         });

         // Create user record in your database
         user = await prisma.user.create({
           data: {
             email,
             walletAddress: privyUser.wallet.address,
             applications: { connect: { id: applicationId } },
           },
         });
       } else {
         // If user exists, just associate with the application
         await prisma.user.update({
           where: { id: user.id },
           data: {
             applications: { connect: { id: applicationId } },
           },
         });
       }
       return user;
     };

     const onboardedUsers = await Promise.all(
       users.map((user) => onboardUser(user.email))
     );
     ```

- **Response**:
  ```json
  {
    "users": [
      {
        "email": "user1@example.com",
        "walletAddress": "0xabcdef1234567890abcdef1234567890abcdef12"
      },
      {
        "email": "user2@example.com",
        "walletAddress": "0x0987654321fedcba0987654321fedcba09876543"
      }
    ]
  }
  ```

### Step 2: Retrieve Application Users (Optional)

- **Endpoint**: GET /api/v1/applications/{applicationId}/users
- **Headers**:
  ```
  Authorization: Bearer {developer_access_token}
  ```
- **Process**:
  1. Validate the developer's access token
  2. Verify that the application exists and belongs to the developer
  3. Retrieve all users associated with the application
- **Response**:
  ```json
  {
    "users": [
      {
        "email": "user1@example.com",
        "walletAddress": "0xabcdef1234567890abcdef1234567890abcdef12"
      },
      {
        "email": "user2@example.com",
        "walletAddress": "0x0987654321fedcba0987654321fedcba09876543"
      }
    ]
  }
  ```
