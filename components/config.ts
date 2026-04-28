// Re-export from lib config for backward compatibility
export { STELLAR_CONFIG as default } from '@/lib/config';
export { STELLAR_CONFIG, getContractConfig, getContractId, getRpcUrl, getNetworkPassphrase } from '@/lib/config';

// Legacy exports for compatibility
export const CONTRACT_ID = 'CDVA2BPRPJAKVKNNVI75OGB6T35JS5BFFVM5E5IIFNIOQXWLKEDHSHVU';
export const RPC_URL = 'https://soroban-testnet.stellar.org:443';
export const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
