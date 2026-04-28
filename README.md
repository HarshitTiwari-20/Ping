# Ping - Decentralized Live Voting App

Ping is a real-time, decentralized voting application built on the **Stellar network** using **Soroban** smart contracts and a **Next.js** frontend.

<img src="https://raw.githubusercontent.com/HarshitTiwari-20/Ubuntu-ss-bkup/refs/heads/main/Screenshot%20from%202026-03-31%2023-46-46.png?token=GHSAT0AAAAAADPD7EQYMC6DIXVKBUONNS4W2PRBJEQ" alt="Project">
<img src="https://raw.githubusercontent.com/HarshitTiwari-20/Ubuntu-ss-bkup/refs/heads/main/Screenshot%20from%202026-03-31%2023-46-38.png?token=GHSAT0AAAAAADPD7EQYOIYFC6Q7JVTOXDUY2PRBJ2Q" alt="Project">



## Project Structure

This repository is divided into two main components:
- **`smart_contract/`**: The Rust-based Soroban smart contract backend.
- **`ping/`**: The Next.js React frontend with premium glassmorphism UI.

### Frontend (`ping/`) - Production-Ready Structure

```
ping/
├── lib/                        # Centralized utilities and wallet adapters
│   ├── index.ts               # Main lib export
│   ├── config.ts              # Stellar network configuration
│   ├── utils.ts               # Common utility functions
│   └── wallets/               # Wallet adapter implementations
│       ├── index.ts           # Wallet exports
│       └── stellar-helper.ts  # Production Stellar wallet integration
│
├── app/                        # Next.js 16 App Router
│   ├── layout.tsx             # Root layout (fonts, providers, metadata)
│   ├── page.tsx               # Home page (room creation & listing)
│   ├── globals.css            # Global Tailwind styles
│   ├── favicon.ico            # App icon
│   └── room/
│       └── [id]/
│           └── page.tsx       # Dynamic voting room page
│
├── components/                # Reusable React components
│   ├── WalletProvider.tsx     # Wallet context & authentication hooks
│   ├── WalletConnect.tsx      # Connect/disconnect button (mobile responsive)
│   └── config.ts              # Legacy config (re-exports from lib)
│
├── public/                    # Static assets
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.mjs         # PostCSS configuration
├── eslint.config.mjs          # ESLint configuration
├── package.json               # Dependencies and scripts
└── pnpm-lock.yaml            # Dependency lock file
```

### Wallet Adapter Architecture

The `lib/wallets/` directory contains production-level wallet integrations:

- **`stellar-helper.ts`**: Enterprise-grade Stellar wallet helper
  - Multi-wallet support via `@creit.tech/stellar-wallets-kit`
  - Persistent wallet state with localStorage
  - Transaction signing and verification
  - Connection lifecycle management
  - Environment detection (browser/SSR safe)

- **`index.ts`**: Clean public API exports

### Frontend Features

The frontend provides a production-ready voting experience:

- **Wallet Integration**: Freighter wallet support with persistent storage
- **Real-time Updates**: Live vote tallying with 5-second polling intervals
- **Mobile Responsive**: Fully optimized UI for mobile, tablet, and desktop
- **Type Safe**: Full TypeScript support with strict type checking
- **Glassmorphism UI**: Premium visual design with backdrop blur effects
- **Error Handling**: Graceful error messages and loading states
- **Transaction Management**: Secure transaction signing and verification
- **Live Metrics**: Instant vote count and percentage updates

### Mobile Responsive Design

The application is fully optimized for all device sizes:

- **Responsive Breakpoints**: Uses Tailwind's `sm:` and `md:` breakpoints
- **Touch Friendly**: Scaled buttons and spacing for mobile (32px-40px vs desktop)
- **Adaptive Typography**: Font sizes scale responsively (text-xs/sm on mobile)
- **Adaptive Layout**: Hidden decorative elements on small screens
- **Flexible Components**: Column layouts on mobile, row layouts on desktop

### Environment & Setup

Create a `.env.local` file:

```bash
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ID=CDVA2BPRPJAKVKNNVI75OGB6T35JS5BFFVM5E5IIFNIOQXWLKEDHSHVU
```

### Installation & Running

```bash
# Install dependencies
pnpm install

# Run development server with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting and type checks
pnpm lint
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Smart Contract (`smart_contract/`)

```
smart_contract/
├── src/
│   ├── lib.rs                  # Core contract logic (vote, tally, events)
│   └── test.rs                 # Unit & integration tests
│
├── Cargo.toml                  # Rust manifest & Soroban dependencies
├── Cargo.lock
└── target/                     # Compiled artifacts (wasm32 release binary)
```

---

## 🚀 Smart Contract (`smart_contract/`)
Contract Address: ```https://stellar.expert/explorer/testnet/tx/d18ff0ae9337458ebbc739b367f02cbfcc1aa62447a5956a598756d065aa2d82```

<img src="https://raw.githubusercontent.com/HarshitTiwari-20/Ubuntu-ss-bkup/refs/heads/main/Screenshot%20from%202026-03-26%2023-46-00.png?token=GHSAT0AAAAAADPD7EQYJBPYBNFBD73PR7PC2PRBPAQ" alt="Contract">


<img src="https://raw.githubusercontent.com/HarshitTiwari-20/Ubuntu-ss-bkup/refs/heads/main/Screenshot%20from%202026-04-29%2000-05-53.png?token=GHSAT0AAAAAADPD7EQYGUKNBQEF6XEMMRTU2PRBRDA" alt="Contract">


The smart contract ensures transparent, tamper-proof voting on the Stellar Testnet. 

### Features
- Records votes for specific options.
- Verifies wallet signatures to ensure one vote per user.
- Emits events upon successful votes.

### Setup and Deployment
To compile and test the contract locally, make sure you have the Rust toolchain and Stellar CLI installed.

```bash
cd smart_contract

# Run the contract tests
cargo test

# Build the WebAssembly binary
rustup target add wasm32-unknown-unknown
cargo build --target wasm32-unknown-unknown --release

# Deploy to Testnet (requires a funded identity, e.g., 'alice')
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/ping_contract.wasm \
  --source alice \
  --network testnet
```

*Note: The current version is already deployed to the Stellar Testnet at `CCNFHBAEEVHRE345CNTN6JEAS6RD53RB6HGLWID2PD3V4S4RNCBWCERZ`.*

---

## 🎨 Frontend (`ping/`)

The frontend is a beautifully styled, responsive Next.js application that integrates seamlessly with the **Freighter** wallet for authentication and transaction signing.

### Features
- Connect/Disconnect Freighter Wallet.
- Real-time fetching of votes directly from the Soroban smart contract.
- Interactive transaction signing via Freighter.
- Comprehensive loading states and error handling.

### Running the App

1. Navigate to the frontend directory:
   ```bash
   cd ping
   ```
2. Install dependencies using your preferred package manager (pnpm is configured):
   ```bash
   pnpm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```
4. Open your browser to `http://localhost:3000`.

### Voting Flow
1. Install the [Freighter browser extension](https://www.freighter.app) and set it to the **Testnet**.
2. Click **Connect Wallet** on the app.
3. Select an option from the poll to vote.
4. Sign the transaction when prompted by Freighter.
5. The UI will automatically update the vote count once the transaction confirms!
