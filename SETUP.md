# Development Setup

## Prerequisites
- Node.js 18+ and npm
- MetaMask browser extension
- Sepolia testnet ETH

## Installation
```bash
# Install dependencies
npm install
cd webapp && npm install && cd ..

# Configure environment
cp .env.example .env
# Edit .env with your values

# Compile contracts
npx hardhat compile

# Run frontend
cd webapp && npm run dev
```

## Configuration
- Update contract address in webapp/src/config/contracts.ts
- Set WalletConnect project ID
- Configure RPC endpoints
