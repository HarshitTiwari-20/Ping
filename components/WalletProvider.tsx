'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';


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
      try {
        const { isConnected, getAddress } = await import('@stellar/freighter-api');
        
        // Wrap in timeout since isConnected can hang if extension is missing
        const connected: any = await Promise.race([
          isConnected(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000))
        ]).catch(() => ({ isConnected: false }));
        
        if (connected.isConnected) {
          const key = await getAddress();
          if (key.address) setAddress(key.address);
        }
      } catch (err) {
        console.error("Auto-connect failed", err);
      }
    };
    checkConnection();
  }, []);

  const connect = async () => {
    console.log("Connect button clicked, attempting to import freighter-api...");
    try {
      const { isConnected, requestAccess } = await import('@stellar/freighter-api');
      console.log("dynamically imported freighter API, checking connection...");
      
      const connected: any = await Promise.race([
        isConnected(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000))
      ]).catch(() => ({ isConnected: false }));

      if (!connected.isConnected) {
        alert('Please install Freighter wallet browser extension.');
        return;
      }
      
      const accessResponse = await requestAccess();
      if (accessResponse.address) {
        setAddress(accessResponse.address);
      } else if (accessResponse.error) {
        alert(accessResponse.error);
      }
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
