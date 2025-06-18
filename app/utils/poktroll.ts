import {
  ripemd160,
  sha256,
} from "@cosmjs/crypto";
import {
  fromBase64,
  fromBech32,
  toBech32,
  toBase64,
  toHex,
} from "@cosmjs/encoding";
import isEmpty from "lodash/isEmpty";
import isNil from "lodash/isNil";
import {
  createMultisigThresholdPubkey,
  encodeAminoPubkey,
  encodeSecp256k1Pubkey,
  pubkeyToAddress,
  SinglePubkey,
} from "@cosmjs/amino";

export enum SignMode {
  SIGN_MODE_UNSPECIFIED = 0,
  SIGN_MODE_DIRECT = 1,
  SIGN_MODE_TEXTUAL = 2,
  SIGN_MODE_DIRECT_AUX = 3,
  SIGN_MODE_LEGACY_AMINO_JSON = 127,
  UNRECOGNIZED = -1,
}

export interface CompactBitArraySDKType {
  extra_bits_stored: number;
  elems: string;
}

export interface ModeInfo_MultiSDKType {
  bitarray?: CompactBitArraySDKType;
  mode_infos: ModeInfoSDKType[];
}

export interface ModeInfo_SingleSDKType {
  mode: SignMode;
}

export interface ModeInfoSDKType {
  single?: ModeInfo_SingleSDKType;
  multi?: ModeInfo_MultiSDKType;
}

type SingleSecp256k1Pubkey = {
  '@type': typeof Secp256k1
  key: string
}

type MultiLegacyAminoPubkey = {
  '@type': typeof MultisigLegacyAminoPubKey
  threshold: number
  public_keys: Array<SingleSecp256k1Pubkey>
}

export interface SignerInfoSDKType {
  public_key?: SingleSecp256k1Pubkey | MultiLegacyAminoPubkey;
  mode_info?: ModeInfoSDKType;
  sequence: bigint;
}

export const Secp256k1 = "/cosmos.crypto.secp256k1.PubKey";
export const Ed25519 = "/cosmos.crypto.ed25519.PubKey";
export const MultisigLegacyAminoPubKey = "/cosmos.crypto.multisig.LegacyAminoPubKey";
export const PREFIX = "pokt";
export const VALIDATOR_PREFIX = "poktvaloper";

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

function rawEd25519PubKeyToRawAddress(pubKey: Uint8Array): Uint8Array {
  let pk = pubKey;

  if (pubKey.length === 34) {
    // NB: pubKey has 2 "extra" bytes at the beginning as compared to the
    // base64-decoded representation/ of the same key when imported to
    // fetchd (`fetchd keys add --recover`) and shown (`fetchd keys show`).
    // Inspired from https://github.com/bryanchriswhite/fetchai-ledger-subquery/blob/main/src/mappings/primitives.ts#L71
    pk = pubKey.slice(2);
  }

  if (pk.length !== 32) {
    throw new Error(`Invalid Ed25519 pub key length: ${pk.length}`);
  }

  return sha256(pk).slice(0, 20);
}

function rawSecp256k1PubKeyToRawAddress(pubKey: Uint8Array): Uint8Array {
  let pk = pubKey;

  if (pubKey.length === 35) {
    // NB: pubKey has 2 "extra" bytes at the beginning as compared to the
    // base64-decoded representation/ of the same key when imported to
    // fetchd (`fetchd keys add --recover`) and shown (`fetchd keys show`).
    // Inspired from https://github.com/bryanchriswhite/fetchai-ledger-subquery/blob/main/src/mappings/primitives.ts#L71
    pk = pubKey.slice(2);
  }

  if (pk.length !== 33) {
    throw new Error(`Invalid Secp256k1 pub key length: ${pk.length}`);
  }

  return ripemd160(sha256(pk));
}

function pubKeyToRawAddress(type: string, pubKey: Uint8Array, prefix?: string): string {
  switch (type) {
    case Ed25519:
      return toHex(rawEd25519PubKeyToRawAddress(pubKey)).toUpperCase();
    case Secp256k1:
      if (isEmpty(prefix) || isNil(prefix)) {
        throw new Error("Bench32 Prefix should not be empty");
      }
      return toBech32(prefix, rawSecp256k1PubKeyToRawAddress(pubKey));
    default:
      // Keep this case here to guard against new types being added but not handled
      throw new Error(`pubKey type ${type} not supported`);
  }
}

export function base64PubKeyToAddress(type: string, base64PubKey: string, prefix?: string): string {
  return pubKeyToRawAddress(type, fromBase64(base64PubKey), prefix);
}

export function pubKeyToAddress(type: string, pubKey: string, prefix?: string, toLowerCase?: boolean): string {
  const address = pubKeyToRawAddress(type, fromBase64(pubKey), prefix)
  return toLowerCase ? address.toLowerCase() : address
}

export interface MultisigInfo {
  fromAddress: string;
  allSignerAddresses: string[];
  signedSignerAddresses: string[];
  signerIndices: number[];
  threshold: number;
  multisigPubKey: string;
  extraBitsStored: number;
  bitarrayElems: string;
}

/**
 * Decodes a base64-encoded bit array and determines the indices of bits set to 1.
 *
 * @param {string} elemsBase64 - The base64-encoded string representing the bit array.
 * @param {number} extraBitsStored - The total number of bits considered in the bit array.
 * @return {number[]} An array of indices where the corresponding bits in the bit array are set to 1.
 */
function decodeBitArray(elemsBase64: string, extraBitsStored: number): number[] {
  const bitArray = fromBase64(elemsBase64);

  const signerIndices: number[] = [];

  for (let i = 0; i < extraBitsStored; i++) {
    const byteIndex = Math.floor(i / 8);
    const bitIndex = i % 8;
    const byte = bitArray[byteIndex];

    // Cosmos uses MSB first: bit 0 is the highest bit in the byte
    const bit = (byte >> (7 - bitIndex)) & 1;

    if (bit === 1) {
      signerIndices.push(i);
    }
  }

  return signerIndices;
}

/**
 * Generates a multi-signature public key address based on the provided public keys, threshold, and address prefix.
 *
 * @param {string[]} pubkeysBase64 - An array of public keys in base64 encoding.
 * @param {number} threshold - The minimum number of signatures required to authorize a transaction.
 * @param {string} prefix - The prefix to be used for the derived address (e.g., "cosmos", "terra").
 * @return {Object} An object containing the derived address and the multi-signature public key:
 *                  - `from`: The derived address corresponding to the multi-signature public key.
 *                  - `pubkey`: The base64-encoded amino multi-signature public key.
 */
export function getMultiSignPubKeyAddress(pubkeysBase64: string[], threshold: number, prefix: string): {
  from: string,
  pubkey: string
} {
  // Encode each base64 pubkey as Amino SinglePubkey
  const pubkeyObjs: SinglePubkey[] = pubkeysBase64.map((b64) =>
    encodeSecp256k1Pubkey(fromBase64(b64)),
  );

  // Build a multisig pubkey and derive fromAddress
  const multisigPubkey = createMultisigThresholdPubkey(pubkeyObjs, threshold);
  const aminoMultsigPubKey = encodeAminoPubkey(multisigPubkey);
  return {
    from: pubkeyToAddress(multisigPubkey, prefix),
    pubkey: toBase64(aminoMultsigPubKey),
  };
}

/**
 * Parses multisig signer information from provided parameters, including pubkeys, bitarrays, and other metadata.
 *
 * @param {Object} params - The input parameters for the function.
 * @param {string[]} params.pubkeysBase64 - An array of public keys encoded in base64 format.
 * @param {number} params.threshold - The minimum number of signatures required to validate the multisig.
 * @param {string} params.bitarrayElems - The bitarray representing which signatures are provided.
 * @param {number} params.extraBitsStored - A number representing additional bits stored in the bitarray.
 * @param {string} params.prefix - The address prefix used to encode addresses.
 * @return {MultisigInfo} An object containing parsed multisig information,
 * including the derived `fromAddress`, signer addresses, and metadata.
 */
export function parseMultisigSignerInfo({
                                          bitarrayElems,
                                          extraBitsStored,
                                          prefix,
                                          pubkeysBase64,
                                          threshold,
                                        }: {
  pubkeysBase64: string[];
  threshold: number;
  bitarrayElems: string;
  extraBitsStored: number;
  prefix: string;
}): MultisigInfo {
  // Encode each base64 pubkey as Amino SinglePubkey
  const pubkeyObjs: SinglePubkey[] = pubkeysBase64.map((b64) =>
    encodeSecp256k1Pubkey(fromBase64(b64)),
  );

  // Build a multisig pubkey and derive fromAddress
  const { from: fromAddress, pubkey: multisigPubKey } = getMultiSignPubKeyAddress(pubkeysBase64, threshold, prefix);

  // All signer addresses
  const allSignerAddresses = pubkeyObjs.map((pk) => pubkeyToAddress(pk, prefix));

  // Decode the bitarray to find actual signers
  const signerIndices = decodeBitArray(bitarrayElems, extraBitsStored);
  const signedSignerAddresses = signerIndices.map((i) => allSignerAddresses[i]);

  return {
    fromAddress,
    allSignerAddresses,
    signedSignerAddresses,
    signerIndices,
    threshold,
    multisigPubKey,
    bitarrayElems,
    extraBitsStored,
  };
}

/**
 * Extracts the threshold and public keys in Base64 format from a multisig public key bytes' representation.
 * The input must be a valid multisig public key, or an error will be thrown.
 *
 * @param {MultiLegacyAminoPubkey} value - The serialized public key base64 representing a multisig instance.
 * @return {Object} An object containing the threshold and an array of public keys in Base64 format.
 * @return {number} return.threshold - The threshold value for the multisig key.
 * @return {string[]} return.pubkeysBase64 - Array of public keys (in Base64 format) involved in the multisig.
 */
export function extractThresholdAndPubkeysFromMultisig(value: MultiLegacyAminoPubkey): {
  threshold: number;
  pubkeysBase64: string[];
} {
  return {
    threshold: Number(value.threshold),
    pubkeysBase64: value.public_keys.map(p => p.key),
  };
}

/**
 * Retrieves the multisignature information from the given signer information.
 *
 * @param {SignerInfo} signerInfo - The signer information to extract multisig information from.
 * Must be valid multisig signer information with a defined public key.
 * @return {MultisigInfo} The extracted multisignature information including public keys, threshold, and bitarray data.
 * @throws {Error} If the provided signer information is not a multisig or lacks a public key.
 */
export function getMultisigInfo(signerInfo: SignerInfoSDKType): MultisigInfo {
  if (!signerInfo || !isMulti(signerInfo) || signerInfo.public_key?.['@type'] !== MultisigLegacyAminoPubKey) {
    throw new Error("[getMultisigInfo] signerInfo is not a multisig");
  }
  if (!signerInfo.public_key) {
    throw new Error("[getMultisigInfo] missing signerInfos public key");
  }

  const { pubkeysBase64, threshold } = extractThresholdAndPubkeysFromMultisig(signerInfo.public_key);

  return parseMultisigSignerInfo({
    pubkeysBase64,
    threshold,
    bitarrayElems: signerInfo.mode_info?.multi?.bitarray?.elems || '',
    extraBitsStored: signerInfo.mode_info?.multi?.bitarray?.extra_bits_stored as number,
    prefix: "pokt",
  });
}

/**
 * Determines if the provided signer information corresponds to a multisignature public key.
 *
 * @param {SignerInfo} signerInfo - The signer information containing a public key to be checked.
 * @return {boolean} Returns true if the public key type URL matches a multisignature public key; otherwise, false.
 */
export function isMulti(signerInfo: SignerInfoSDKType): boolean {
  if (!signerInfo.public_key) {
    throw new Error(`missing signerInfos public key`);
  }

  return signerInfo.public_key?.['@type'] === MultisigLegacyAminoPubKey;
}

export function isMsgValidatorRelated(typeUrl: string): boolean {
  switch (typeUrl) {
    case "/cosmos.staking.v1beta1.MsgCreateValidator":
    case "/cosmos.staking.v1beta1.MsgEditValidator":
    case "/cosmos.staking.v1beta1.MsgDelegate":
    case "/cosmos.staking.v1beta1.MsgUndelegate":
    case "/cosmos.staking.v1beta1.MsgBeginRedelegate":
    case "/cosmos.slashing.v1beta1.MsgUnjail":
    case "/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission":
    case "/cosmos.distribution.v1beta1.MsgSetWithdrawAddress":
      return true;
    default:
      return false;
  }
}
