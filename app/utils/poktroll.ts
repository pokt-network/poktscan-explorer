import { fromBech32 } from "@cosmjs/encoding";

export function isValidPoktAddress(address: string): boolean {
  try {
    const decoded = fromBech32(address);
    return decoded.prefix === "pokt" || decoded.prefix === "poktvaloper" || decoded.prefix === "poktvalcons";
  } catch {
    // If decoding fails, it's not a valid Bech32 address
    return false;
  }
}

export function isValidMorseAddress(address: string): boolean {
  return /^[0-9a-fA-F]+$/g.test(address) && address.length === 40;
}

export function isValidHash(hash: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(hash)
}

/**
 * Validates if the given string is a valid hash of a public key.
 * The hash must follow these rules:
 * - Exactly 40 characters long
 * - Only contains hexadecimal characters (0-9, A-F)
 *
 * @param hash - The string to validate
 * @returns true if the string is a valid hash, false otherwise
 */
export function isValidEd25519Hash(hash: string): boolean {
  const ed25519HashRegex = /^[0-9A-F]{40}$/i; // Regex for 40 hex characters
  return ed25519HashRegex.test(hash);
}
