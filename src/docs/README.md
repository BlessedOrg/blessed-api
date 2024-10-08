# Blessed API Source Code

This directory contains the source code for the Blessed API, which manages developer onboarding, application creation, ticket deployment, and user management.

## Key Technologies

1. **1Password**: Used for generating and managing access tokens for developers. These tokens are used to interact with smart contracts (deployment/update/distribution) through our APIs.

2. **Privy**: Utilized for embedded wallet creation for both developers and their end users. This allows for a seamless blockchain experience without requiring users to manage their own wallets.

3. **Relayer (ERC-2771)**: Implemented to enable gasless transactions, reducing barriers to entry for users unfamiliar with blockchain technology.

## Architectural Overview

### Entity Relationships

1. Developers

   - A developer can have multiple applications
   - Developers do not have a direct relationship with users
   - Developer wallet accounts are created through Privy

2. Applications

   - An application belongs to a single developer
   - An application can have multiple types of tickets
   - An application can have multiple users

3. Tickets

   - A ticket type belongs to a single application
   - Multiple tickets of the same type can be distributed to users

4. Users
   - Users are associated with applications, not directly with developers
   - A user can have multiple tickets from various applications
   - User wallet accounts are created through Privy

### Flow

1. Developer Onboarding

   - Developers sign up and are authenticated
   - Privy creates an embedded wallet for the developer
   - 1Password generates an access token for the developer

2. Application Creation

   - Authenticated developers can create multiple applications

3. Ticket Deployment

   - Developers can deploy multiple ticket types for each application
   - Smart contract interaction is handled through our APIs

4. User Management

   - Developers can onboard users to their applications
   - Privy creates embedded wallets for users

5. Ticket Distribution
   - Developers can distribute tickets to users within their applications
   - Gasless transactions are facilitated through the Relayer (ERC-2771)

## Directory Structure

- `api/`: Contains API route handlers
- `lib/`: Houses core functionality (database, blockchain interactions, etc.)
- `models/`: Defines data models
- `utils/`: Utility functions and helpers

## Data Models

1. Developer

   - Fields: id, email, walletAddress, accessToken
   - Relationships: hasMany Applications

2. Application

   - Fields: id, name, developerId
   - Relationships: belongsTo Developer, hasMany TicketTypes, hasMany Users

3. TicketType

   - Fields: id, name, supply, applicationId, smartContractAddress
   - Relationships: belongsTo Application

4. User

   - Fields: id, email, walletAddress
   - Relationships: belongsToMany Applications

5. Ticket
   - Fields: id, ticketTypeId, userId
   - Relationships: belongsTo TicketType, belongsTo User
