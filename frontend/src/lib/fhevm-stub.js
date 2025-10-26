/**
 * FHEVM Stub for Server-Side Rendering
 * This module is used as a placeholder during SSR to prevent WASM loading issues
 */

// Export empty functions that match the fhevm.ts interface
export async function initFhevm() {
  throw new Error('FHEVM can only be used in the browser');
}

export async function encryptText() {
  throw new Error('FHEVM can only be used in the browser');
}

export async function encryptUint32() {
  throw new Error('FHEVM can only be used in the browser');
}

export async function decryptText() {
  throw new Error('FHEVM can only be used in the browser');
}

export async function decryptUint32() {
  throw new Error('FHEVM can only be used in the browser');
}

export function getFhevmInstance() {
  return null;
}
