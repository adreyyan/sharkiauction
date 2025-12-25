/**
 * FHEVM Client-Side Encryption Service
 * Handles encryption/decryption for Private Auction
 */

import { initFhevm, createInstance } from 'fhevmjs';

let fhevmInstance = null;
let initPromise = null;

/**
 * Initialize FHEVM (call once at app startup)
 */
export async function initializeFHEVM() {
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    try {
      console.log('🔐 Initializing FHEVM...');
      await initFhevm();
      console.log('✅ FHEVM initialized');
    } catch (error) {
      console.error('❌ FHEVM initialization failed:', error);
      throw error;
    }
  })();
  
  return initPromise;
}

/**
 * Get or create FHEVM instance
 */
export async function getFHEVMInstance(provider) {
  await initializeFHEVM();
  
  if (fhevmInstance) {
    return fhevmInstance;
  }
  
  try {
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    
    const networkUrl = provider.connection?.url || provider._getConnection()?.url;
    const gatewayUrl = getGatewayUrl(chainId);
    
    console.log(`🔐 Creating FHEVM instance for chain ${chainId}...`);
    
    fhevmInstance = await createInstance({
      chainId,
      networkUrl,
      gatewayUrl,
    });
    
    console.log('✅ FHEVM instance created');
    return fhevmInstance;
  } catch (error) {
    console.error('❌ Failed to create FHEVM instance:', error);
    throw error;
  }
}

/**
 * Encrypt a uint64 value for auction bid/reserve
 */
export async function encryptAmount(amount, provider) {
  const instance = await getFHEVMInstance(provider);
  
  // Convert to wei if needed
  const amountWei = typeof amount === 'string' && amount.includes('.')
    ? ethers.parseEther(amount).toString()
    : amount.toString();
  
  console.log(`🔐 Encrypting amount: ${amountWei} wei`);
  
  const encrypted = instance.encrypt64(BigInt(amountWei));
  
  return {
    encryptedData: encrypted.handles[0],
    inputProof: encrypted.inputProof,
  };
}

/**
 * Decrypt an encrypted value (only works with permission)
 */
export async function decryptAmount(contractAddress, encryptedValue, provider) {
  const instance = await getFHEVMInstance(provider);
  
  try {
    console.log('🔓 Attempting to decrypt...');
    const decrypted = await instance.decrypt(contractAddress, encryptedValue);
    console.log('✅ Decryption successful');
    return BigInt(decrypted);
  } catch (error) {
    console.error('❌ Decryption failed:', error);
    throw new Error('Unable to decrypt - you may not have permission');
  }
}

/**
 * Get gateway URL for chain
 */
function getGatewayUrl(chainId) {
  const gateways = {
    31337: 'http://localhost:8545',
    11155111: 'https://gateway.sepolia.fhevm.io', // Sepolia gateway
  };
  
  return gateways[chainId] || gateways[11155111];
}

/**
 * Reset instance (for network changes)
 */
export function resetFHEVMInstance() {
  fhevmInstance = null;
  console.log('🔄 FHEVM instance reset');
}

