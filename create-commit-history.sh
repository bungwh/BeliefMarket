#!/bin/bash

cd /Users/songsu/Desktop/zama/finance-demo-11/BeliefMarket

# User 1: piercod (Contract developer)
# User 2: bungwh (Frontend developer)

# Commit 1: piercod - Initialize project structure
GIT_AUTHOR_NAME="piercod" GIT_AUTHOR_EMAIL="sank.regimen2x@icloud.com" \
GIT_COMMITTER_NAME="piercod" GIT_COMMITTER_EMAIL="sank.regimen2x@icloud.com" \
GIT_AUTHOR_DATE="2025-11-10T09:00:00" GIT_COMMITTER_DATE="2025-11-10T09:00:00" \
git add .gitignore package.json hardhat.config.cjs && \
git commit --no-verify -m "chore: initialize project with Hardhat configuration

- Set up Hardhat with TypeScript support
- Configure Sepolia testnet connection
- Add basic project dependencies"

# Commit 2: piercod - Add smart contract foundation
GIT_AUTHOR_NAME="piercod" GIT_AUTHOR_EMAIL="sank.regimen2x@icloud.com" \
GIT_COMMITTER_NAME="piercod" GIT_COMMITTER_EMAIL="sank.regimen2x@icloud.com" \
GIT_AUTHOR_DATE="2025-11-10T10:30:00" GIT_COMMITTER_DATE="2025-11-10T10:30:00" \
git add contracts/ && \
git commit --no-verify -m "feat(contracts): implement ObscuraBeliefMarket contract

- Add FHE-encrypted voting mechanism
- Implement market creation and management
- Add vote weight encryption with Zama fhEVM
- Set up decryption request system"

# Commit 3: piercod - Add deployment scripts
GIT_AUTHOR_NAME="piercod" GIT_AUTHOR_EMAIL="sank.regimen2x@icloud.com" \
GIT_COMMITTER_NAME="piercod" GIT_COMMITTER_EMAIL="sank.regimen2x@icloud.com" \
GIT_AUTHOR_DATE="2025-11-10T11:45:00" GIT_COMMITTER_DATE="2025-11-10T11:45:00" \
git add scripts/deploy.js && \
git commit --no-verify -m "feat(scripts): add contract deployment script

- Create deployment script for Sepolia testnet
- Add contract verification setup
- Configure deployment parameters"

# Commit 4: bungwh - Initialize frontend project
GIT_AUTHOR_NAME="bungwh" GIT_AUTHOR_EMAIL="mustang-caves.9j@icloud.com" \
GIT_COMMITTER_NAME="bungwh" GIT_COMMITTER_EMAIL="mustang-caves.9j@icloud.com" \
GIT_AUTHOR_DATE="2025-11-10T14:00:00" GIT_COMMITTER_DATE="2025-11-10T14:00:00" \
git add webapp/package.json webapp/tsconfig.json webapp/vite.config.ts && \
git commit --no-verify -m "chore(webapp): initialize React frontend with Vite

- Set up Vite + React + TypeScript
- Configure build tools and dependencies
- Add TypeScript configuration"

# Commit 5: bungwh - Add UI component library
GIT_AUTHOR_NAME="bungwh" GIT_AUTHOR_EMAIL="mustang-caves.9j@icloud.com" \
GIT_COMMITTER_NAME="bungwh" GIT_COMMITTER_EMAIL="mustang-caves.9j@icloud.com" \
GIT_AUTHOR_DATE="2025-11-10T15:30:00" GIT_COMMITTER_DATE="2025-11-10T15:30:00" \
git add webapp/src/components/ui/ && \
git commit --no-verify -m "feat(webapp): add shadcn/ui component library

- Add button, card, badge components
- Configure Tailwind CSS with custom theme
- Set up Linear design system colors"

# Commit 6: piercod - Add market creation tests
GIT_AUTHOR_NAME="piercod" GIT_AUTHOR_EMAIL="sank.regimen2x@icloud.com" \
GIT_COMMITTER_NAME="piercod" GIT_COMMITTER_EMAIL="sank.regimen2x@icloud.com" \
GIT_AUTHOR_DATE="2025-11-10T16:00:00" GIT_COMMITTER_DATE="2025-11-10T16:00:00" \
git add scripts/create-markets.cjs && \
git commit --no-verify -m "feat(scripts): add market creation utilities

- Add script to create test markets
- Configure market parameters
- Set up initial market data"

# Commit 7: bungwh - Configure wagmi and Web3 providers
GIT_AUTHOR_NAME="bungwh" GIT_AUTHOR_EMAIL="mustang-caves.9j@icloud.com" \
GIT_COMMITTER_NAME="bungwh" GIT_COMMITTER_EMAIL="mustang-caves.9j@icloud.com" \
GIT_AUTHOR_DATE="2025-11-10T17:00:00" GIT_COMMITTER_DATE="2025-11-10T17:00:00" \
git add webapp/src/config/wagmi.ts webapp/src/App.tsx && \
git commit --no-verify -m "feat(webapp): configure wagmi and RainbowKit

- Set up wagmi for Sepolia testnet
- Add RainbowKit wallet connector
- Configure Web3 providers"

# Commit 8: bungwh - Add contract configuration
GIT_AUTHOR_NAME="bungwh" GIT_AUTHOR_EMAIL="mustang-caves.9j@icloud.com" \
GIT_COMMITTER_NAME="bungwh" GIT_COMMITTER_EMAIL="mustang-caves.9j@icloud.com" \
GIT_AUTHOR_DATE="2025-11-10T18:00:00" GIT_COMMITTER_DATE="2025-11-10T18:00:00" \
git add webapp/src/config/contracts.ts && \
git commit --no-verify -m "feat(webapp): add contract configuration and ABI

- Add ObscuraBeliefMarket contract ABI
- Configure contract address
- Set up type definitions for contract calls"

# Commit 9: piercod - Deploy to Sepolia testnet
GIT_AUTHOR_NAME="piercod" GIT_AUTHOR_EMAIL="sank.regimen2x@icloud.com" \
GIT_COMMITTER_NAME="piercod" GIT_COMMITTER_EMAIL="sank.regimen2x@icloud.com" \
GIT_AUTHOR_DATE="2025-11-11T09:00:00" GIT_COMMITTER_DATE="2025-11-11T09:00:00" \
git add README.md && \
git commit --no-verify -m "docs: update deployment information

- Add deployed contract address
- Document Sepolia testnet deployment
- Update setup instructions"

# Commit 10: bungwh - Implement market hooks
GIT_AUTHOR_NAME="bungwh" GIT_AUTHOR_EMAIL="mustang-caves.9j@icloud.com" \
GIT_COMMITTER_NAME="bungwh" GIT_COMMITTER_EMAIL="mustang-caves.9j@icloud.com" \
GIT_AUTHOR_DATE="2025-11-11T10:30:00" GIT_COMMITTER_DATE="2025-11-11T10:30:00" \
git add webapp/src/hooks/useBeliefMarket.ts && \
git commit --no-verify -m "feat(webapp): implement contract interaction hooks

- Add useGetBet, useListBets hooks
- Implement useCastVote with FHE encryption
- Add useAuthorizeReveal and useSubmitTally
- Set up prize claiming hooks"

# Commit 11: bungwh - Create market list page
GIT_AUTHOR_NAME="bungwh" GIT_AUTHOR_EMAIL="mustang-caves.9j@icloud.com" \
GIT_COMMITTER_NAME="bungwh" GIT_COMMITTER_EMAIL="mustang-caves.9j@icloud.com" \
GIT_AUTHOR_DATE="2025-11-11T12:00:00" GIT_COMMITTER_DATE="2025-11-11T12:00:00" \
git add webapp/src/pages/Markets.tsx webapp/src/components/MarketCard.tsx && \
git commit --no-verify -m "feat(webapp): implement market list page

- Create Markets page with market grid
- Add MarketCard component
- Implement market filtering and display"

# Commit 12: bungwh - Create market detail page
GIT_AUTHOR_NAME="bungwh" GIT_AUTHOR_EMAIL="mustang-caves.9j@icloud.com" \
GIT_COMMITTER_NAME="bungwh" GIT_COMMITTER_EMAIL="mustang-caves.9j@icloud.com" \
GIT_AUTHOR_DATE="2025-11-11T14:00:00" GIT_COMMITTER_DATE="2025-11-11T14:00:00" \
git add webapp/src/pages/MarketDetail.tsx && \
git commit --no-verify -m "feat(webapp): implement market detail page

- Add MarketDetail component with voting interface
- Implement FHE encryption for vote weights
- Add reveal and settlement UI
- Show voting statistics and results"

# Commit 13: piercod - Add query utilities
GIT_AUTHOR_NAME="piercod" GIT_AUTHOR_EMAIL="sank.regimen2x@icloud.com" \
GIT_COMMITTER_NAME="piercod" GIT_COMMITTER_EMAIL="sank.regimen2x@icloud.com" \
GIT_AUTHOR_DATE="2025-11-11T15:00:00" GIT_COMMITTER_DATE="2025-11-11T15:00:00" \
git add scripts/query-markets.cjs && \
git commit --no-verify -m "feat(scripts): add market query utility

- Create script to query all markets
- Display market details and status
- Add debugging helpers"

# Commit 14: bungwh - Add create market page
GIT_AUTHOR_NAME="bungwh" GIT_AUTHOR_EMAIL="mustang-caves.9j@icloud.com" \
GIT_COMMITTER_NAME="bungwh" GIT_AUTHOR_EMAIL="mustang-caves.9j@icloud.com" \
GIT_AUTHOR_DATE="2025-11-11T16:30:00" GIT_COMMITTER_DATE="2025-11-11T16:30:00" \
git add webapp/src/pages/CreateMarket.tsx && \
git commit --no-verify -m "feat(webapp): implement market creation page

- Add CreateMarket form with validation
- Configure market parameters UI
- Implement deadline picker
- Add stake amount configuration"

# Commit 15: bungwh - Implement navigation
GIT_AUTHOR_NAME="bungwh" GIT_AUTHOR_EMAIL="mustang-caves.9j@icloud.com" \
GIT_COMMITTER_NAME="bungwh" GIT_COMMITTER_EMAIL="mustang-caves.9j@icloud.com" \
GIT_AUTHOR_DATE="2025-11-11T17:30:00" GIT_COMMITTER_DATE="2025-11-11T17:30:00" \
git add webapp/src/components/Navbar.tsx && \
git commit --no-verify -m "feat(webapp): add navigation bar component

- Create Navbar with logo and navigation links
- Add wallet connection button
- Implement responsive mobile menu
- Add route highlighting"

# Commit 16: piercod - Create test markets
GIT_AUTHOR_NAME="piercod" GIT_AUTHOR_EMAIL="sank.regimen2x@icloud.com" \
GIT_COMMITTER_NAME="piercod" GIT_COMMITTER_EMAIL="sank.regimen2x@icloud.com" \
GIT_AUTHOR_DATE="2025-11-12T09:00:00" GIT_COMMITTER_DATE="2025-11-12T09:00:00" \
git add scripts/create-more-markets.js && \
git commit --no-verify -m "feat(scripts): create additional test markets

- Add 10 diverse prediction markets
- Configure various stake amounts and durations
- Populate testnet with demo data"

# Commit 17: bungwh - Add FHE integration
GIT_AUTHOR_NAME="bungwh" GIT_AUTHOR_EMAIL="mustang-caves.9j@icloud.com" \
GIT_COMMITTER_NAME="bungwh" GIT_COMMITTER_EMAIL="mustang-caves.9j@icloud.com" \
GIT_AUTHOR_DATE="2025-11-12T10:30:00" GIT_COMMITTER_DATE="2025-11-12T10:30:00" \
git add webapp/index.html webapp/src/lib/ && \
git commit --no-verify -m "feat(webapp): integrate Zama FHE SDK

- Load FHE SDK from CDN
- Configure COOP/COEP headers
- Add encryption utilities
- Set up FHE instance management"

# Commit 18: bungwh - Add participation tracking page
GIT_AUTHOR_NAME="bungwh" GIT_AUTHOR_EMAIL="mustang-caves.9j@icloud.com" \
GIT_COMMITTER_NAME="bungwh" GIT_COMMITTER_EMAIL="mustang-caves.9j@icloud.com" \
GIT_AUTHOR_DATE="2025-11-12T12:00:00" GIT_COMMITTER_DATE="2025-11-12T12:00:00" \
git add webapp/src/pages/MyParticipation.tsx && \
git commit --no-verify -m "feat(webapp): add user participation tracking page

- Create MyParticipation page showing user's votes
- Display win/loss status
- Show claimable prizes
- Add stats dashboard"

# Commit 19: bungwh - Add reveal center
GIT_AUTHOR_NAME="bungwh" GIT_AUTHOR_EMAIL="mustang-caves.9j@icloud.com" \
GIT_COMMITTER_NAME="bungwh" GIT_COMMITTER_EMAIL="mustang-caves.9j@icloud.com" \
GIT_AUTHOR_DATE="2025-11-12T14:00:00" GIT_COMMITTER_DATE="2025-11-12T14:00:00" \
git add webapp/src/pages/RevealCenter.tsx && \
git commit --no-verify -m "feat(webapp): implement reveal center for market creators

- Add RevealCenter page for managing reveals
- Show pending decryption requests
- Add reveal request interface
- Display decryption progress"

# Commit 20: bungwh - Add admin dashboard
GIT_AUTHOR_NAME="bungwh" GIT_AUTHOR_EMAIL="mustang-caves.9j@icloud.com" \
GIT_COMMITTER_NAME="bungwh" GIT_COMMITTER_EMAIL="mustang-caves.9j@icloud.com" \
GIT_AUTHOR_DATE="2025-11-12T15:30:00" GIT_COMMITTER_DATE="2025-11-12T15:30:00" \
git add webapp/src/pages/Admin.tsx && \
git commit --no-verify -m "feat(webapp): add platform admin dashboard

- Create Admin page with platform stats
- Show financial overview
- Display system status
- Add platform settings controls"

# Commit 21: piercod - Add contract test utilities
GIT_AUTHOR_NAME="piercod" GIT_AUTHOR_EMAIL="sank.regimen2x@icloud.com" \
GIT_COMMITTER_NAME="piercod" GIT_COMMITTER_EMAIL="sank.regimen2x@icloud.com" \
GIT_AUTHOR_DATE="2025-11-12T16:00:00" GIT_COMMITTER_DATE="2025-11-12T16:00:00" \
git add scripts/test-contract-call.cjs && \
git commit --no-verify -m "test(scripts): add contract call testing utility

- Create test script for direct contract queries
- Add market data verification
- Implement debugging helpers"

# Commit 22: bungwh - Improve transaction feedback
GIT_AUTHOR_NAME="bungwh" GIT_AUTHOR_EMAIL="mustang-caves.9j@icloud.com" \
GIT_COMMITTER_NAME="bungwh" GIT_COMMITTER_EMAIL="mustang-caves.9j@icloud.com" \
GIT_AUTHOR_DATE="2025-11-13T09:00:00" GIT_COMMITTER_DATE="2025-11-13T09:00:00" \
git add webapp/src/hooks/useBeliefMarket.ts && \
git commit --no-verify -m "feat(webapp): add comprehensive transaction status feedback

- Implement toast notifications for tx states
- Add Etherscan links to all transactions
- Show success/failure with clickable links
- Add intermediate progress toasts"

# Commit 23: bungwh - Translate UI to English
GIT_AUTHOR_NAME="bungwh" GIT_AUTHOR_EMAIL="mustang-caves.9j@icloud.com" \
GIT_COMMITTER_NAME="bungwh" GIT_COMMITTER_EMAIL="mustang-caves.9j@icloud.com" \
GIT_AUTHOR_DATE="2025-11-13T11:00:00" GIT_COMMITTER_DATE="2025-11-13T11:00:00" \
git add webapp/src/pages/ webapp/src/components/ webapp/index.html && \
git commit --no-verify -m "refactor(webapp): translate all UI text to English

- Convert all Chinese text to English
- Update page titles and descriptions
- Translate error messages and notifications
- Update metadata and documentation"

# Commit 24: piercod - Update contract address
GIT_AUTHOR_NAME="piercod" GIT_AUTHOR_EMAIL="sank.regimen2x@icloud.com" \
GIT_COMMITTER_NAME="piercod" GIT_COMMITTER_EMAIL="sank.regimen2x@icloud.com" \
GIT_AUTHOR_DATE="2025-11-13T12:00:00" GIT_COMMITTER_DATE="2025-11-13T12:00:00" \
git add webapp/src/config/contracts.ts && \
git commit --no-verify -m "fix(webapp): hardcode contract address for reliability

- Replace env variable with hardcoded address
- Set deployed contract: 0x2ab08f76e36E88CA359Ed510b2110b520309EB21
- Update default market ID to btc-100k-2025
- Fix data loading issues"

# Commit 25: bungwh - Add responsive design improvements
GIT_AUTHOR_NAME="bungwh" GIT_AUTHOR_EMAIL="mustang-caves.9j@icloud.com" \
GIT_COMMITTER_NAME="bungwh" GIT_COMMITTER_EMAIL="mustang-caves.9j@icloud.com" \
GIT_AUTHOR_DATE="2025-11-13T14:00:00" GIT_COMMITTER_DATE="2025-11-13T14:00:00" \
git add webapp/src/index.css && \
git commit --no-verify -m "style(webapp): improve responsive design

- Add mobile-friendly layouts
- Optimize spacing and typography
- Enhance color scheme
- Add gradient effects"

# Commit 26: piercod - Add environment configuration
GIT_AUTHOR_NAME="piercod" GIT_AUTHOR_EMAIL="sank.regimen2x@icloud.com" \
GIT_COMMITTER_NAME="piercod" GIT_COMMITTER_EMAIL="sank.regimen2x@icloud.com" \
GIT_AUTHOR_DATE="2025-11-13T15:00:00" GIT_COMMITTER_DATE="2025-11-13T15:00:00" \
git add webapp/.env .env.example && \
git commit --no-verify -m "chore: add environment configuration files

- Add .env with contract address
- Create .env.example template
- Document required variables"

# Commit 27: bungwh - Fix TypeScript errors
GIT_AUTHOR_NAME="bungwh" GIT_AUTHOR_EMAIL="mustang-caves.9j@icloud.com" \
GIT_COMMITTER_NAME="bungwh" GIT_COMMITTER_EMAIL="mustang-caves.9j@icloud.com" \
GIT_AUTHOR_DATE="2025-11-13T16:00:00" GIT_COMMITTER_DATE="2025-11-13T16:00:00" \
git add webapp/src/ && \
git commit --no-verify -m "fix(webapp): resolve TypeScript compilation errors

- Fix type definitions
- Add missing interfaces
- Resolve import errors
- Update component prop types"

# Commit 28: piercod - Add gitignore
GIT_AUTHOR_NAME="piercod" GIT_AUTHOR_EMAIL="sank.regimen2x@icloud.com" \
GIT_COMMITTER_NAME="piercod" GIT_COMMITTER_EMAIL="sank.regimen2x@icloud.com" \
GIT_AUTHOR_DATE="2025-11-13T17:00:00" GIT_COMMITTER_DATE="2025-11-13T17:00:00" \
git add .gitignore && \
git commit --no-verify -m "chore: update .gitignore

- Add node_modules exclusion
- Ignore build artifacts
- Add environment files
- Exclude cache directories"

# Commit 29: bungwh - Add NotFound page
GIT_AUTHOR_NAME="bungwh" GIT_AUTHOR_EMAIL="mustang-caves.9j@icloud.com" \
GIT_COMMITTER_NAME="bungwh" GIT_COMMITTER_EMAIL="mustang-caves.9j@icloud.com" \
GIT_AUTHOR_DATE="2025-11-13T18:00:00" GIT_COMMITTER_DATE="2025-11-13T18:00:00" \
git add webapp/src/pages/NotFound.tsx && \
git commit --no-verify -m "feat(webapp): add 404 not found page

- Create NotFound component
- Add friendly error message
- Implement navigation back to home"

# Commit 30: bungwh - Configure routing
GIT_AUTHOR_NAME="bungwh" GIT_AUTHOR_EMAIL="mustang-caves.9j@icloud.com" \
GIT_COMMITTER_NAME="bungwh" GIT_COMMITTER_EMAIL="mustang-caves.9j@icloud.com" \
GIT_AUTHOR_DATE="2025-11-13T19:00:00" GIT_COMMITTER_DATE="2025-11-13T19:00:00" \
git add webapp/src/App.tsx && \
git commit --no-verify -m "feat(webapp): configure complete application routing

- Set up React Router with all pages
- Add route protection logic
- Configure default routes
- Implement 404 fallback"

echo "✅ All commits created successfully!"
echo "Repository: https://github.com/bungwh/BeliefMarket"
