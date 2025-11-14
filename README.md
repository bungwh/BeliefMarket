# 🎯 BeliefMarket - Privacy-Preserving Prediction Market

> **Fully Homomorphic Encryption (FHE) Powered Prediction Market**
> Built with Zama fhEVM 0.8.0 + React + TypeScript

![License](https://img.shields.io/badge/license-BSD--3--Clause-blue.svg)
![Solidity](https://img.shields.io/badge/Solidity-^0.8.24-orange.svg)
![fhEVM](https://img.shields.io/badge/fhEVM-0.8.0-green.svg)
![React](https://img.shields.io/badge/React-18.3.1-blue.svg)

---

## 🌟 Features

### Privacy-First Architecture
- ✅ **Encrypted Voting**: All votes encrypted with FHE before submission
- ✅ **Hidden Weights**: Vote weights remain encrypted on-chain
- ✅ **Secure Reveal**: Decryption via Zama Gateway with threshold signatures
- ✅ **Fair Distribution**: Winner-takes-all prize pool mechanism

### User Experience
- ✅ **Connect Wallet**: RainbowKit integration (MetaMask, WalletConnect, etc.)
- ✅ **Real-time Encryption**: FHE SDK loaded via CDN for instant encryption
- ✅ **Transaction Tracking**: Visual feedback for all blockchain interactions
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile

### Technical Stack
- 🔐 **Smart Contracts**: Solidity 0.8.24 + Zama fhEVM
- ⚛️ **Frontend**: React 18 + TypeScript + Vite
- 🎨 **UI**: Tailwind CSS + Radix UI + Ant Design components
- 🌐 **Web3**: wagmi + viem + ethers.js
- 🔑 **FHE**: @zama-fhe/relayer-sdk 0.2.0

---

## 📦 Project Structure

```
BeliefMarket/
├── contracts/
│   └── BeliefMarket.sol         # FHE-enabled prediction market contract
├── scripts/
│   ├── deploy.js                # Deployment script
│   └── verify.js                # Contract verification script
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── constants/           # Contract ABI & addresses
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/
│   │   │   └── fhe.ts          # FHE SDK integration
│   │   └── App.tsx             # Main application
│   └── public/                 # Static assets
├── hardhat.config.js           # Hardhat configuration
├── package.json                # Backend dependencies
├── .env.example                # Environment template
├── DEPLOYMENT.md               # Detailed deployment guide
└── README.md                   # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **Git**
- **MetaMask** or compatible wallet
- **Sepolia ETH** (get from [faucet](https://sepoliafaucet.com/))

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd BeliefMarket

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your keys
# SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
# PRIVATE_KEY=your_private_key_here
```

⚠️ **Never commit `.env` to Git!**

### Compile Contracts

```bash
npm run compile
```

Expected output:
```
✓ Compiled 1 Solidity file successfully
```

### Deploy to Sepolia (Optional)

```bash
# Deploy contract
npm run deploy

# Verify deployment
npm run verify
```

The deployment script will:
1. Deploy `ObscuraBeliefMarket` contract
2. Wait for 3 block confirmations
3. Save deployment info to `deployments/sepolia-deployment.json`
4. Automatically update `frontend/src/constants/contracts.ts`

### Start Frontend

```bash
# Development mode
npm run frontend:dev

# Or build for production
npm run frontend:build
```

Open http://localhost:5173 in your browser.

---

## 💡 How It Works

### 1. **Create Market**
Platform owner creates a new prediction market with:
- Unique market ID
- Vote stake amount (minimum: 0.005 ETH)
- Duration (5 minutes - 30 days)
- Platform fee (0.02 ETH)

### 2. **Cast Vote**
Users participate by:
1. Connecting wallet
2. Choosing vote direction (Yes/No)
3. Clicking "Encrypt with FHE" to generate encrypted weight
4. Submitting encrypted vote + stake to contract

**Privacy Guarantee**: Vote weights stay encrypted on-chain

### 3. **Request Reveal**
After market expires:
- Creator calls `requestReplicaTallyReveal()`
- Contract requests decryption from Zama Gateway
- Gateway returns decrypted vote counts

### 4. **Claim Prize**
Winning voters can:
- Call `claimReplicaPrize()` to receive rewards
- Prize = (user's stake / total winning stakes) × prize pool

---

## 🔐 FHE Integration

### Frontend Encryption

```typescript
import { initializeFHE, encryptVoteWeight } from '@/lib/fhe';

// Initialize FHE SDK (once)
await initializeFHE();

// Encrypt vote weight
const { encryptedWeight, proof } = await encryptVoteWeight(
  weight,        // bigint: vote weight
  contractAddr,  // string: contract address
  userAddr       // string: user address
);
```

### Smart Contract Decryption

```solidity
import { FHE, euint64 } from "@fhevm/solidity/lib/FHE.sol";

// Accept encrypted input
euint64 weight = FHE.fromExternal(encryptedWeight, inputProof);

// Perform FHE operations
bet.yesVotes = FHE.add(bet.yesVotes, weight);

// Request decryption
uint256 requestId = FHE.requestDecryption(cts, callback);
```

---

## 📚 Contract API

### Read Functions

```solidity
// Get market info
function getReplicaBet(string betId) external view returns (
    address creator,
    uint256 platformStake,
    uint256 voteStake,
    uint256 expiryTime,
    bool isResolved,
    uint64 revealedYes,
    uint64 revealedNo,
    uint256 prizePool,
    bool yesWon
);

// Check if user voted
function hasVoted(string betId, address user) external view returns (bool);

// Get reveal status
function getReplicaRevealStatus(string betId) external view returns (
    bool isResolved,
    bool pending,
    uint64 revealedYes,
    uint64 revealedNo,
    uint256 decryptionRequestId
);
```

### Write Functions

```solidity
// Create new market
function createReplicaBet(
    string betId,
    uint256 voteStake,
    uint256 duration
) external payable;

// Cast encrypted vote
function castReplicaVote(
    string betId,
    uint8 voteType,              // 0=No, 1=Yes
    bytes32 encryptedWeight,
    bytes inputProof
) external payable;

// Request decryption (creator only)
function requestReplicaTallyReveal(string betId) external;

// Claim prize (winners only)
function claimReplicaPrize(string betId) external;
```

---

## 🧪 Testing

### Manual Testing

1. **Connect Wallet** → Click "Connect Wallet" button
2. **Select Market** → Choose an active market
3. **Cast Vote**:
   - Enter stake amount
   - Select Yes/No
   - Click "Encrypt with FHE"
   - Click "Submit Ciphertext"
4. **Wait for Confirmation** → Transaction appears on Etherscan
5. **Check Status** → Verify vote in "My Vote" section

### Automated Testing (TODO)

```bash
# Run contract tests
npm test

# Run with coverage
npm run test:coverage
```

---

## 🛠️ Development

### Available Commands

```bash
# Backend
npm run compile          # Compile contracts
npm run deploy           # Deploy to Sepolia
npm run verify           # Verify deployment
npm test                 # Run tests

# Frontend
npm run frontend:dev     # Start dev server
npm run frontend:build   # Build for production
npm run frontend:preview # Preview production build
```

### Environment Variables

```bash
# Backend (.env)
SEPOLIA_RPC_URL=<your-rpc-url>
PRIVATE_KEY=<your-private-key>
ETHERSCAN_API_KEY=<your-api-key>

# Frontend (.env.local)
VITE_WALLET_CONNECT_PROJECT_ID=<your-project-id>
```

---

## 📖 Documentation

- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Zama Docs**: https://docs.zama.ai/
- **fhEVM Guide**: https://docs.zama.ai/protocol
- **Wagmi Docs**: https://wagmi.sh/

---

## 🔗 Useful Links

- **Sepolia Faucet**: https://sepoliafaucet.com/
- **Sepolia Explorer**: https://sepolia.etherscan.io/
- **Zama Discord**: https://discord.gg/zama
- **RainbowKit**: https://www.rainbowkit.com/

---

## ⚠️ Important Notes

1. **Testnet Only**: This is for Sepolia testnet. DO NOT use on mainnet without audit.
2. **Private Keys**: Never commit private keys. Always use environment variables.
3. **Gas Costs**: FHE operations are expensive. Test thoroughly on testnet first.
4. **Gateway Delays**: Decryption can take 2-5 minutes depending on Gateway load.
5. **Browser Support**: Works best on Chrome/Brave with MetaMask installed.

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

BSD-3-Clause-Clear License

---

## 🙏 Acknowledgments

- **Zama** for FHE technology
- **RainbowKit** for wallet UX
- **Radix UI** for accessible components

---

**Built with ❤️ using Zama fhEVM**

*For questions or support, open an issue on GitHub.*

## Additional Documentation
- [Setup Guide](SETUP.md)
- [API Reference](API.md)
- [Testing Guide](TESTING.md)
- [Security](SECURITY.md)
- [Troubleshooting](TROUBLESHOOTING.md)
- [Roadmap](ROADMAP.md)
- [FAQ](FAQ.md)
- [Contributing](CONTRIBUTING.md)
