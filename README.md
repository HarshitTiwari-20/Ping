# Ping - Decentralized Live Voting App

Ping is a real-time, decentralized voting application built on the **Stellar network** using **Soroban** smart contracts and a **Next.js** frontend.

<img src="https://github.com/HarshitTiwari-20/Ubuntu-ss-bkup/blob/main/Screenshot%20from%202026-03-31%2023-46-46.png" alt="Project">
<img src="https://github.com/HarshitTiwari-20/Ubuntu-ss-bkup/blob/main/Screenshot%20from%202026-03-31%2023-46-38.png" alt="Project">



## Project Structure

This repository is divided into two main components:
- **`smart_contract/`**: The Rust-based Soroban smart contract backend.
- **`ping/`**: The Next.js React frontend with premium glassmorphism UI.

### Frontend (`ping/`)

```
ping/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (fonts, providers)
│   ├── page.tsx                # Home page — room creation & listing
│   ├── globals.css             # Global styles
│   ├── favicon.ico
│   └── room/
│       └── [id]/
│           └── page.tsx        # Dynamic voting room page
│
├── components/
│   ├── WalletProvider.tsx      # Freighter wallet context & hooks
│   ├── WalletConnect.tsx       # Connect / disconnect button component
│   └── config.ts               # Network & contract configuration
│
├── public/                     # Static assets
├── next.config.ts
├── tsconfig.json
├── package.json
└── pnpm-lock.yaml
```

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

<img src="https://github.com/HarshitTiwari-20/Ubuntu-ss-bkup/blob/main/Screenshot%20from%202026-03-26%2023-46-00.png" alt="Contract">


<img src="https://github.com/HarshitTiwari-20/Ubuntu-ss-bkup/blob/main/Screenshot%20from%202026-03-26%2023-45-54.png" alt="Contract">


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
