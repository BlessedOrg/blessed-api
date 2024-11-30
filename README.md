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

This document outlines the API endpoints for our application.

## Base URL

All API requests should be prefixed with: `/api/v1`

## Authentication

Most endpoints require authentication. Include the access token in the Authorization header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Endpoints

### Developers

#### Login

- **Path**: `/developers/login`
- **Method**: POST
- **Description**: Initiates the login process for a developer by sending an OTP to their email.
- **Body**:
  ```json
  {
    "email": "developer@example.com"
  }
  ```
- **Response**: Confirmation that OTP has been sent.

#### Verify

- **Path**: `/developers/verify`
- **Method**: POST
- **Description**: Verifies the OTP sent to the developer's email and completes the login process.
- **Body**:
  ```json
  {
    "otp": "123456"
  }
  ```
- **Response**: Access token and wallet address upon successful verification.

#### Get Wallet

- **Path**: `/developers/wallet`
- **Method**: GET
- **Description**: Retrieves the wallet address associated with the authenticated developer.
- **Authentication**: Required
- **Response**: Developer's wallet address.

### Applications

#### Create Application

- **Path**: `/applications`
- **Method**: POST
- **Description**: Creates a new application for the authenticated developer.
- **Authentication**: Required
- **Body**:
  ```json
  {
    "name": "My New App"
  }
  ```
- **Response**: Details of the created application.

#### List Applications

- **Path**: `/applications`
- **Method**: GET
- **Description**: Retrieves a list of all applications owned by the authenticated developer.
- **Authentication**: Required
- **Response**: List of applications.

#### Get Application Details

- **Path**: `/applications/{applicationId}`
- **Method**: GET
- **Description**: Retrieves details of a specific application.
- **Authentication**: Required
- **Response**: Application details.

### Tickets

#### Deploy Ticket

- **Path**: `/applications/{applicationId}/tickets/deploy`
- **Method**: POST
- **Description**: Deploys a new ticket type for the specified application.
- **Authentication**: Required
- **Body**:
  ```json
  {
    "name": "VIP Ticket",
    "initialSupply": 100
  }
  ```
- **Response**: Details of the deployed ticket type.

#### List Tickets

- **Path**: `/applications/{applicationId}/tickets`
- **Method**: GET
- **Description**: Retrieves a list of all ticket types for the specified application.
- **Authentication**: Required
- **Response**: List of ticket types.

#### Update Ticket Supply

- **Path**: `/applications/{applicationId}/tickets/{ticketId}/supply`
- **Method**: PUT
- **Description**: Updates the supply of a specific ticket type.
- **Authentication**: Required
- **Body**:
  ```json
  {
    "newSupply": 150
  }
  ```
- **Response**: Updated ticket details.

#### Distribute Tickets

- **Path**: `/applications/{applicationId}/tickets/{ticketId}/distribute`
- **Method**: POST
- **Description**: Distributes tickets to specified users.
- **Authentication**: Required
- **Body**:
  ```json
  {
    "distributions": [
      { "email": "user1@example.com", "amount": 2 },
      { "email": "user2@example.com", "amount": 1 }
    ]
  }
  ```
- **Response**: Confirmation of ticket distribution.

### Users

#### Onboard Users

- **Path**: `/applications/{applicationId}/users`
- **Method**: POST
- **Description**: Onboards new users for the specified application.
- **Authentication**: Required
- **Body**:
  ```json
  {
    "users": [
      { "email": "user1@example.com" },
      { "email": "user2@example.com" }
    ]
  }
  ```
- **Response**: List of onboarded users with their wallet addresses.

## Error Responses

All endpoints may return the following error responses:

- `400 Bad Request`: When the request is malformed or missing required fields.
- `401 Unauthorized`: When authentication fails or is missing.
- `403 Forbidden`: When the authenticated user doesn't have permission for the requested action.
- `404 Not Found`: When the requested resource is not found.
- `500 Internal Server Error`: When an unexpected error occurs on the server.

Error responses will include a JSON body with an `error` field describing the issue.
