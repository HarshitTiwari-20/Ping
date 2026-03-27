'use client';

import { useWallet } from './WalletProvider';

export default function WalletConnect() {
  const { address, connect, disconnect } = useWallet();

  if (address) {
    return (
      <div className="flex items-center gap-4">
        <div className="px-4 py-2 bg-purple-900/50 text-white rounded-lg backdrop-blur-md border border-purple-500/30 font-medium">
          {address.slice(0, 5)}...{address.slice(-4)}
        </div>
        <button
          onClick={disconnect}
          className="px-4 py-2 bg-red-600/80 hover:bg-red-500 hover:text-white transition-all text-white rounded-lg shadow-lg font-semibold"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="px-6 py-2 bg-purple-600 hover:bg-purple-500 transition-all text-white rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.5)] font-semibold"
    >
      Connect Wallet
    </button>
  );
}
