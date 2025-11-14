import { BELIEF_MARKET_ADDRESS } from "@/config/contracts";
import { bytesToHex, getAddress } from "viem";
import type { Address } from "viem";

let fhevmInstance: any = null;

/**
 * Get SDK from window (loaded via static script tag in HTML)
 * SDK 0.3.0-5 is loaded via static script tag in index.html
 */
const getSDK = (): any => {
  if (typeof window === "undefined") {
    throw new Error("FHE SDK requires browser environment");
  }

  // Check for both uppercase and lowercase versions
  const sdk = (window as any).RelayerSDK || (window as any).relayerSDK;

  if (!sdk) {
    throw new Error("RelayerSDK not loaded. Please ensure the script tag is in your HTML.");
  }

  return sdk;
};

/**
 * Initialize FHE instance (singleton pattern)
 */
export const initializeFHE = async (provider?: any): Promise<any> => {
  if (fhevmInstance) {
    console.log("[FHE] ♻️ Using existing FHE instance");
    return fhevmInstance;
  }

  if (typeof window === "undefined") {
    throw new Error("FHE SDK requires browser environment");
  }

  console.log("[FHE] 🚀 Initializing FHE SDK...");

  // Get Ethereum provider from multiple sources (supporting different wallets)
  const ethereumProvider = provider ||
    (window as any).ethereum ||
    (window as any).okxwallet?.provider ||
    (window as any).okxwallet;

  if (!ethereumProvider) {
    throw new Error("No Ethereum provider found. Please connect your wallet first.");
  }

  const sdk = getSDK();
  const { initSDK, createInstance, SepoliaConfig } = sdk;

  console.log("[FHE] 🔧 SDK found, calling initSDK()...");
  await initSDK();
  console.log("[FHE] ✅ SDK initialized");

  console.log("[FHE] 🏗️ Creating FHE instance for Sepolia...");
  console.log("[FHE] 📋 Provider info:", {
    type: ethereumProvider.constructor?.name,
    isMetaMask: ethereumProvider.isMetaMask,
    chainId: ethereumProvider.chainId
  });
  console.log("[FHE] 📋 SepoliaConfig keys:", Object.keys(SepoliaConfig));

  const config = { ...SepoliaConfig, network: ethereumProvider };

  try {
    console.log("[FHE] 📞 Calling createInstance with config...");
    fhevmInstance = await createInstance(config);
    console.log("[FHE] ✅ FHE instance created successfully!");
    console.log("[FHE] 📦 Instance methods:", Object.keys(fhevmInstance || {}));
    return fhevmInstance;
  } catch (error) {
    console.error("[FHE] ❌ createInstance failed:", error);
    if (error instanceof Error) {
      console.error("[FHE] Error name:", error.name);
      console.error("[FHE] Error message:", error.message);
      console.error("[FHE] Error stack:", error.stack);
    }
    throw error;
  }
};

/**
 * Get FHE instance if it exists
 */
export const getFHEInstance = (): any => {
  return fhevmInstance;
};

/**
 * Check if FHE is ready
 */
export const isFheReady = (): boolean => {
  return fhevmInstance !== null;
};

/**
 * Encrypt vote weight using Zama FHE SDK
 * @param weight Vote confidence weight (1-100)
 * @param userAddress User's Ethereum address
 * @returns Encrypted weight handle and input proof
 */
export async function encryptVoteWeight(
  weight: number,
  userAddress: Address
): Promise<{ encryptedWeight: `0x${string}`; inputProof: `0x${string}` }> {
  console.log("[FHE] 🔐 Starting encryption process...");
  console.log("[FHE] 📊 Input:", { weight, userAddress, contractAddress: BELIEF_MARKET_ADDRESS });

  if (weight < 1 || weight > 100) {
    throw new Error("Vote weight must be between 1 and 100");
  }

  // Ensure FHE is initialized
  if (!isFheReady()) {
    console.log("[FHE] ⚠️ FHE not initialized, initializing now...");
    await initializeFHE();
  }

  const instance = getFHEInstance();
  if (!instance) {
    throw new Error("FHE SDK not initialized");
  }

  try {
    console.log("[FHE] 📝 Creating encrypted input...");
    const contractAddr = getAddress(BELIEF_MARKET_ADDRESS);
    const userAddr = getAddress(userAddress);

    const input = instance.createEncryptedInput(contractAddr, userAddr);
    input.add64(BigInt(weight));

    console.log("[FHE] 🔐 Encrypting...");
    const { handles, inputProof } = await input.encrypt();

    const encryptedWeight = bytesToHex(handles[0]) as `0x${string}`;
    const proof = bytesToHex(inputProof) as `0x${string}`;

    console.log("[FHE] ✅ Encryption completed");

    return {
      encryptedWeight,
      inputProof: proof
    };
  } catch (error) {
    console.error("[FHE] ❌ Encryption failed:", error);
    throw new Error(`Failed to encrypt vote weight: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Decrypt publicly available handles using the relayer SDK
 */
export async function publicDecryptHandles(handles: `0x${string}`[]) {
  if (handles.length === 0) {
    throw new Error("No handles provided for public decryption");
  }

  if (!isFheReady()) {
    await initializeFHE();
  }

  const instance = getFHEInstance();
  if (!instance) {
    throw new Error("FHE SDK not initialized");
  }

  const result = await instance.publicDecrypt(handles);
  const normalized: Record<string, number> = {};
  Object.entries(result.clearValues || {}).forEach(([handle, value]) => {
    const key = handle.toLowerCase();
    normalized[key] = typeof value === "bigint" ? Number(value) : Number(value);
  });

  const values = handles.map((handle) => normalized[handle.toLowerCase()] ?? 0);

  return {
    values,
    abiEncoded: result.abiEncodedClearValues as `0x${string}`,
    proof: result.decryptionProof as `0x${string}`
  };
}
