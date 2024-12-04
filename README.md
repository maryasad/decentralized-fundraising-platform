# Ethereum Crowdfunding Smart Contract

A decentralized crowdfunding platform built on Ethereum that allows users to create and contribute to fundraising campaigns.

## Features

- Create fundraising campaigns with customizable goals and deadlines
- Accept contributions in ETH
- Automatic fund distribution to campaign creators upon successful completion
- Automatic refunds if campaign goals are not met
- Full test coverage
- Gas-optimized code

## Smart Contract Functions

- `createCampaign`: Create a new fundraising campaign
- `contribute`: Contribute ETH to an existing campaign
- `claimFunds`: Campaign creators can claim funds if goal is reached
- `getRefund`: Contributors can get refunds if campaign fails
- `getCampaign`: View campaign details
- `getContribution`: Check contribution amount for an address

## Technology Stack

- Solidity ^0.8.0
- Hardhat
- Ethers.js
- Chai for testing
- TypeScript

## Getting Started

### Prerequisites

- Node.js >= 14.0.0
- npm >= 6.0.0

### Installation

1. Clone the repository
```bash
git clone [your-repo-url]
cd crowd-funding-contract
```

2. Install dependencies
```bash
npm install
```

3. Create .env file
```bash
cp .env.example .env
# Add your configuration
```

4. Compile contracts
```bash
npx hardhat compile
```

5. Run tests
```bash
npx hardhat test
```

### Deployment

To deploy to Goerli testnet:
```bash
npx hardhat run scripts/deploy.js --network goerli
```

## Testing

The test suite includes comprehensive tests for all contract functions:
- Campaign creation
- Making contributions
- Claiming funds
- Getting refunds

Run tests with:
```bash
npx hardhat test
```

## Security

- Reentrancy protection
- Integer overflow protection (Solidity ^0.8.0)
- Proper access control
- Deadline enforcement

## License

MIT

## Author

Maryam Asady
