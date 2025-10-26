# Web3 Confessions

A privacy-preserving confession platform built with Fully Homomorphic Encryption (FHEVM) on Ethereum.

Share encrypted confessions anonymously on-chain with end-to-end encryption. Built using Zama's FHEVM technology for computation on encrypted data.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Solidity](https://img.shields.io/badge/Solidity-^0.8.24-purple)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Features

- **Fully Encrypted**: Client-side encryption using FHEVM before blockchain submission
- **Anonymous**: Pseudonymous wallet-based identity with permanent privacy
- **Encrypted Voting**: Upvote mechanism without revealing vote counts
- **On-Chain**: Deployed on Ethereum Sepolia testnet
- **Modern UI**: Responsive design with glassmorphism effects
- **Cross-Platform**: Compatible with mobile, tablet, and desktop browsers

## Architecture

```
web3-confessions/
├── contracts/              # Smart contracts (Hardhat)
│   ├── contracts/
│   │   └── ConfessionVault.sol
│   ├── test/
│   ├── scripts/
│   └── hardhat.config.ts
│
└── frontend/               # Next.js frontend
    ├── src/
    │   ├── app/           # App Router pages
    │   ├── components/    # React components
    │   ├── lib/           # Utilities & FHEVM wrapper
    │   └── store/         # Zustand state management
    ├── public/
    └── tailwind.config.ts
```

## Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **MetaMask** or compatible Web3 wallet
- **Sepolia testnet ETH** (get from [faucet](https://sepoliafaucet.com/))

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/GadgetLeo/web3-confessions.git
cd web3-confessions
\`\`\`

### 2. Install Dependencies

\`\`\`bash
# Install root dependencies
npm install

# Install contract dependencies
cd contracts
npm install

# Install frontend dependencies
cd ../frontend
npm install
\`\`\`

### 3. Configure Environment Variables

#### Contracts (.env)

\`\`\`bash
cd contracts
cp .env.example .env
\`\`\`

Edit \`.env\`:
\`\`\`env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
\`\`\`

#### Frontend (.env.local)

\`\`\`bash
cd ../frontend
cp .env.example .env.local
\`\`\`

Edit \`.env.local\`:
\`\`\`env
NEXT_PUBLIC_CONFESSION_VAULT_ADDRESS=0x... # Will be set after deployment
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_FHE_PUBLIC_KEY=your_fhe_public_key
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
\`\`\`

### 4. Deploy Smart Contract

\`\`\`bash
cd contracts

# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to Sepolia
npm run deploy:sepolia

# Verify on Etherscan (optional)
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
\`\`\`

The deployment script will automatically update the frontend's \`.env.local\` with the contract address.

### 5. Run Frontend

\`\`\`bash
cd frontend

# Start development server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating a Confession

1. Connect your Web3 wallet (MetaMask)
2. Click **"Create Confession"**
3. Type your confession (10-500 characters)
4. Click **"Confess Anonymously"**
5. Approve the transaction in your wallet
6. Your encrypted confession is now on-chain!

### Upvoting

1. Click the heart icon on any confession
2. Approve the transaction
3. Vote is added to the encrypted counter

### Viewing Confessions

- **Home Feed**: Browse all confessions
- **Detail View**: Click any confession for full view
- **About Page**: Learn how FHE works

## Technology Stack

### Smart Contracts

- **Solidity** ^0.8.24
- **Zama FHEVM** - Fully Homomorphic Encryption
- **Hardhat** - Development environment
- **OpenZeppelin** - Security libraries
- **Sepolia** - Ethereum testnet

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Wagmi + Viem** - Ethereum interactions
- **RainbowKit** - Wallet connection UI
- **Zustand** - State management
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **fhevmjs** - Client-side encryption

## How FHE Works

Fully Homomorphic Encryption (FHE) allows computations on encrypted data without decryption.

1. **Client-Side Encryption**: Your confession is encrypted in your browser
2. **On-Chain Storage**: Encrypted data is stored on the blockchain
3. **Encrypted Computation**: Smart contract performs operations (like adding votes) on encrypted data
4. **Privacy Preserved**: No one ever sees the plaintext—not even validators

```
Plaintext → [Encrypt] → Ciphertext → [On-Chain Computation] → Encrypted Result
                                     ↓
                          No Decryption Needed!
```

## Smart Contract Functions

### Core Functions

- \`submitConfession(bytes encryptedMessage)\` - Submit encrypted confession
- \`upvote(uint256 confessionId, bytes encryptedOne)\` - Upvote with encrypted increment
- \`getConfession(uint256 id)\` - Get confession data (encrypted)
- \`getConfessionCiphertext(uint256 id)\` - Get raw ciphertext

### Admin Functions (Owner Only)

- \`updateRateLimit(uint256 newCooldown)\` - Change submission cooldown
- \`togglePause()\` / \`emergencyPause()\` - Pause/unpause contract

### View Functions

- \`hasUserUpvoted(uint256 id, address voter)\` - Check upvote status
- \`getRemainingCooldown(address user)\` - Get rate limit countdown

## Design System

The UI follows a premium Web3 design language:

- **Colors**: Deep space backgrounds with purple-cyan gradients
- **Glassmorphism**: Frosted glass cards with backdrop blur
- **Typography**: Space Grotesk (headings), Inter (body)
- **Animations**: Smooth Framer Motion transitions
- **Responsive**: Mobile-first, scales to desktop

## Development

### Running Tests

\`\`\`bash
# Smart contract tests
cd contracts
npm test

# Test coverage
npm run coverage
\`\`\`

### Linting & Formatting

\`\`\`bash
# Frontend
cd frontend
npm run lint

# Format code
npx prettier --write .
\`\`\`

### Building for Production

\`\`\`bash
# Frontend
cd frontend
npm run build
npm start
\`\`\`

## Deployment

### Contract Deployment

Contracts are deployed to Sepolia testnet. See [deployment guide](#4-deploy-smart-contract).

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push to \`main\`

## Resources

- [Zama FHEVM Docs](https://docs.zama.ai/fhevm/)
- [FHEVM GitHub](https://github.com/zama-ai/fhevm)
- [Wagmi Documentation](https://wagmi.sh/)
- [Next.js Documentation](https://nextjs.org/docs)
- [RainbowKit Docs](https://www.rainbowkit.com/)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/amazing-feature\`
3. Commit changes: \`git commit -m 'Add amazing feature'\`
4. Push to branch: \`git push origin feature/amazing-feature\`
5. Open a Pull Request

### Code Style

- Follow existing code patterns
- Use TypeScript strict mode
- Add comments for complex logic
- Run tests before submitting PR

## Security

- **No Plaintext Storage**: All sensitive data is encrypted
- **Rate Limiting**: Prevents spam submissions
- **Audited Libraries**: Uses OpenZeppelin standards
- **Input Validation**: Sanitizes all user inputs

**⚠️ Testnet Only**: This is a demonstration on Sepolia testnet. Do not use real funds.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

- [Zama](https://zama.ai) for FHEVM technology
- [OpenZeppelin](https://openzeppelin.com) for security libraries
- [Rainbow](https://rainbow.me) for wallet connection UI
- [Vercel](https://vercel.com) for frontend hosting

## Support

- **Issues**: [GitHub Issues](https://github.com/GadgetLeo/web3-confessions/issues)
- **Discussions**: [GitHub Discussions](https://github.com/GadgetLeo/web3-confessions/discussions)

---

Share your secrets securely.
