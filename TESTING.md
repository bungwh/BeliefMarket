# Testing Guide

## Contract Testing
```bash
npx hardhat test
```

## Frontend Testing
Currently manual testing. Future: Jest + React Testing Library

## Integration Testing
Test full flow:
1. Deploy contract
2. Create market
3. Cast vote
4. Settle market
5. Claim reward

## Local Development
Use Hardhat local node for testing without deploying to testnet.
