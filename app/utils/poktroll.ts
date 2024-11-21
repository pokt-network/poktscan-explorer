import { fromBech32 } from "@cosmjs/encoding";

export function isValidPoktAddress(address: string): boolean {
  try {
    const decoded = fromBech32(address);
    return decoded.prefix === "pokt";
  } catch {
    // If decoding fails, it's not a valid Bech32 address
    return false;
  }
}

export function isValidHash(hash: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(hash)
}
