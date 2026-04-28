/**
 * Stellar Network Configuration
 * Production-ready contract and network settings
 */

export const STELLAR_CONFIG = {
  CONTRACT_ID: 'CDVA2BPRPJAKVKNNVI75OGB6T35JS5BFFVM5E5IIFNIOQXWLKEDHSHVU',
  RPC_URL: 'https://soroban-testnet.stellar.org:443',
  NETWORK_PASSPHRASE: 'Test SDF Network ; September 2015',
  HORIZON_URL: 'https://horizon-testnet.stellar.org',
  NETWORK: 'testnet' as const,
} as const;

export const getContractConfig = () => STELLAR_CONFIG;
export const getContractId = () => STELLAR_CONFIG.CONTRACT_ID;
export const getRpcUrl = () => STELLAR_CONFIG.RPC_URL;
export const getNetworkPassphrase = () => STELLAR_CONFIG.NETWORK_PASSPHRASE;
