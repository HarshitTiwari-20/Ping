'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { isConnected, getAddress } from '@stellar/freighter-api';

interface WalletContextType {
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    // Optional: Auto-connect if already allowed
    const checkConnection = async () => {
      const connected = await isConnected();
      if (connected.isConnected) {
        const key = await getAddress();
        if (key.address) setAddress(key.address);
      }
    };
    checkConnection();
  }, []);

  const connect = async () => {
    try {
      const connected = await isConnected();
      if (!connected.isConnected) {
        alert('Please install Freighter wallet browser extension.');
        return;
      }
      const key = await getAddress();
      if (key.address) setAddress(key.address);
      else if (key.error) alert(key.error);
    } catch (e) {
      console.error('Failed to connect wallet', e);
      alert('Wallet connection failed or was rejected.');
    }
  };

  const disconnect = () => {
    setAddress(null);
  };

  return (
    <WalletContext.Provider value={{ address, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
