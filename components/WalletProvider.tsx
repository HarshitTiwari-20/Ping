'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface WalletContextType {
  address: string | null;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}



const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-connect on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { isConnected, getAddress } = await import('@stellar/freighter-api');
        
        const connected: { isConnected: boolean } = await Promise.race([
          isConnected(),
          new Promise<{ isConnected: boolean }>((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000))
        ]).catch(() => ({ isConnected: false }));
        
        if (connected.isConnected) {
          const key = await getAddress();
          if (key.address) {
            setAddress(key.address);
            setError(null);
          }
        }
      } catch (err) {
        console.debug("Auto-connect not available:", err);
      }
    };
    checkConnection();
  }, []);

  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { isConnected, requestAccess } = await import('@stellar/freighter-api');
      
      const connected: { isConnected: boolean } = await Promise.race([
        isConnected(),
        new Promise<{ isConnected: boolean }>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
      ]).catch(() => ({ isConnected: false }));

      if (!connected.isConnected) {
        setError('Freighter wallet extension not found. Please install it.');
        return;
      }
      
      const accessResponse = await requestAccess();
      if (accessResponse.address) {
        setAddress(accessResponse.address);
        setError(null);
      } else if (accessResponse.error) {
        setError(accessResponse.error);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Wallet connection failed';
      console.error('Failed to connect wallet:', e);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setError(null);
  }, []);

  return (
    <WalletContext.Provider value={{ address, isLoading, error, connect, disconnect }}>
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
