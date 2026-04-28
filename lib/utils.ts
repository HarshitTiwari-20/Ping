/**
 * Utility functions for Stellar operations
 */

import * as StellarSdk from "@stellar/stellar-sdk";
import { rpc } from "@stellar/stellar-sdk";
import { STELLAR_CONFIG } from "./config";

export function createServer(): rpc.Server {
  return new rpc.Server(STELLAR_CONFIG.RPC_URL);
}

export async function getAccountDetails(address: string): Promise<StellarSdk.Account> {
  const server = createServer();
  return server.getAccount(address);
}

export function isValidStellarAddress(address: string): boolean {
  try {
    return StellarSdk.StrKey.isValidEd25519PublicKey(address);
  } catch {
    return false;
  }
}

export function formatAddress(address: string, chars: number = 4): string {
  if (!address || address.length < chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
