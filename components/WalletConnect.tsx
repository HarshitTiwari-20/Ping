'use client';

import { useWallet } from './WalletProvider';
import { formatAddress } from '@/lib/utils';
import { useState } from 'react';

export default function WalletConnect() {
  const { address, connect, disconnect, isLoading, error } = useWallet();
  const [showError, setShowError] = useState(false);

  if (address) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
        <div className="px-3 sm:px-4 py-2 bg-purple-900/50 text-white rounded-lg backdrop-blur-md border border-purple-500/30 font-medium text-xs sm:text-sm">
          {formatAddress(address)}
        </div>
        <button
          onClick={disconnect}
          className="px-3 sm:px-4 py-2 bg-red-600/80 hover:bg-red-500 hover:text-white transition-all text-white rounded-lg shadow-lg font-semibold text-xs sm:text-sm whitespace-nowrap"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => {
          connect().catch(() => setShowError(true));
        }}
        disabled={isLoading}
        className="px-4 sm:px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.5)] font-semibold text-xs sm:text-sm whitespace-nowrap"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Connecting...
          </span>
        ) : (
          'Connect Wallet'
        )}
      </button>
      {showError && error && (
        <div className="text-xs text-red-300 bg-red-900/20 px-3 py-1 rounded border border-red-500/30">
          {error}
        </div>
      )}
    </div>
  );
}
