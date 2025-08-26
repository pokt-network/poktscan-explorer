import type { ApolloClient } from '@apollo/client'
import Big from 'big.js'
import { cache } from 'react'
import {sha256} from "@cosmjs/crypto"
import {pubkeyToAddress} from "@cosmjs/amino"
import { fromBase64, fromBech32, toBech32, toHex } from '@cosmjs/encoding'
import { validatorByIdDocument } from '@/app/(details)/validator/[id]/operations'
import { formatSimpleAmount, formatUpokt } from '@/app/utils/format'
import { CONSENSUS_PREFIX, PREFIX } from '@/app/utils/poktroll'
import { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { fetchDataFromRpcOrIndexer } from '@/app/utils/fetch'
import { getUrl } from '@/app/components/RawEntity/utils'
import { getStakeLabel } from '@/app/utils/stake'

export type ValidatorResponseFromRpc = {
  validator: {
    operator_address: string
    consensus_pubkey: {
      "@type": string
      key: string
    }
    jailed: boolean
    status: string
    tokens: string
    delegator_shares: string
    description: {
      moniker: string
      identity: string
      website: string
      security_contact: string
      details: string
    }
    unbonding_height: string
    unbonding_time: string
    commission: {
      commission_rates: {
        rate: string
        max_rate: string
        max_change_rate: string
      }
      update_time: string
    }
    min_self_delegation: string
    unbonding_on_hold_ref_count: string
    unbonding_ids: Array<string>
  }
}

export interface DelegationsFromRpc {
  delegation_responses: Array<{
    delegation: {
      delegator_address: string
      validator_address: string
      shares: string
    }
    balance: {
      denom: string
      amount: string
    }
  }>
  pagination: {
    next_key: any
    total: string
  }
}


export interface Validator {
  status: string
  stakeAmount: string
  selfStakeAmount: string
  votingPower: string
  commissionRewards: string
  outstandingRewards: string
  signer: null | string
  balance: null | string
  minSelfDelegation: string
  commission: string
  maxRate: string
  maxChangeRate: string
  moniker: string
  identity: string
  securityContact: string
  details: string
  website: string
  addresses: {
    operator: string
    account: string
    hex: string
    consensus: string
    consensusPubkey: string
  }
}

function atomicToDecimal(value: string, decimals: number = 18): string {
  if (!/^\d+$/.test(value)) {
    throw new Error("Invalid atomic value");
  }

  const padded = value.padStart(decimals + 1, '0');
  const whole = padded.slice(0, -decimals);
  const fraction = padded.slice(-decimals).replace(/0+$/, ''); // remove trailing zeros

  return fraction ? `${whole}.${fraction}` : whole;
}

export function getHexAddressFromConsensusPubkey(consensusPubkey: string): string {
  return toHex(sha256(fromBase64(consensusPubkey)).slice(0, 20)).toUpperCase()
}

function getConsensusAddressFromPubKey(consensusPubkey: string): string {
  return pubkeyToAddress({
    type: "tendermint/PubKeyEd25519",
    value: consensusPubkey,
  }, CONSENSUS_PREFIX)
}

function getValidatorAccountAddress(valoperAddress: string) {
  try {
    const { data } = fromBech32(valoperAddress)
    return toBech32(PREFIX, data)
  } catch {
    return ''
  }
}

export const getRawValidatorFromRpc = cache(async (address: string, rpcUrl: string): Promise<ValidatorResponseFromRpc['validator']> => {
  return await fetch(getUrl(rpcUrl, 'validator', address)).then(res => {
    if (res.status === 404) {
      return null
    } else {
      return res.json().then(res => res.validator)
    }
  })
})

export async function getValidatorFromRpc(address: string, rpcUrl: string): Promise<Validator | null> {
  const account = getValidatorAccountAddress(address)

  const [
    validator,
    selfStake,
    bondedTokens,
    commission,
    outstandingRewards
  ] = await Promise.all([
    getRawValidatorFromRpc(address, rpcUrl),
    fetch(`${rpcUrl}/cosmos/staking/v1beta1/delegations/${account}`)
      .then(res => res.json())
      .then(res => {
        const data = res as DelegationsFromRpc

        return data.delegation_responses.find(item => item.delegation.validator_address === address)?.balance?.amount || "0"
      })
      .catch(() => ''),
    fetch(`${rpcUrl}/cosmos/staking/v1beta1/pool`)
      .then(res => res.json())
      .then((res) => res.pool.bonded_tokens)
      .catch(() => ''),
    fetch(`${rpcUrl}/cosmos/distribution/v1beta1/validators/${address}`)
      .then(res => res.json())
      .then((res) => res?.commission?.at(0)?.amount || '')
      .catch(() => ''),
    fetch(`${rpcUrl}/cosmos/distribution/v1beta1/validators/${address}/outstanding_rewards`)
      .then(res => res.json())
      .then((res) => res?.rewards?.rewards?.at(0)?.amount || '')
      .catch(() => ''),
  ])

  if (!validator) {
    return null
  }

  let status = ''

  switch (validator.status) {
    case "BOND_STATUS_UNBONDED": {
      status = 'Unstaked'
      break;
    }
    case "BOND_STATUS_UNBONDING": {
      status = 'Unstaking'
      break;
    }
    case "BOND_STATUS_BONDED": {
      status = 'Staked'
      break;
    }
  }

  return {
    status,
    stakeAmount: validator.tokens,
    selfStakeAmount: selfStake,
    votingPower: bondedTokens ? formatSimpleAmount(new Big(validator.tokens).div(bondedTokens).mul(100).toFixed(2)) + '%' : '-',
    commissionRewards: commission ? formatUpokt({
      amount: commission,
      maxDecimals: 6
    }) : '',
    outstandingRewards: outstandingRewards ? formatUpokt({
      amount: outstandingRewards,
      maxDecimals: 6
    }) : '',
    signer: null,
    balance: null,
    minSelfDelegation: validator.min_self_delegation,
    commission: validator.commission.commission_rates.rate,
    maxRate: validator.commission.commission_rates.max_rate,
    maxChangeRate: validator.commission.commission_rates.max_change_rate,
    moniker: validator.description.moniker,
    identity: validator.description.identity,
    securityContact: validator.description.security_contact,
    details: validator.description.details,
    website: validator.description.website,
    addresses: {
      operator: address,
      account,
      hex: getHexAddressFromConsensusPubkey(validator.consensus_pubkey.key),
      consensus: getConsensusAddressFromPubKey(validator.consensus_pubkey.key),
      consensusPubkey: JSON.stringify(validator.consensus_pubkey),
    }
  }
}

export function parseValidatorFromIndexer(data: DocumentNodeData<typeof validatorByIdDocument>) {
  if (!data?.validator) return null

  const validator = data!.validator!

  return {
    status: getStakeLabel(validator.stakeStatus),
    stakeAmount: validator.stakeAmount,
    selfStakeAmount: '',
    votingPower: '',
    commissionRewards: '',
    outstandingRewards: '',
    signer: validator.signerId,
    balance: validator.signer?.balances?.nodes?.find(balance => balance.denom === 'upokt')?.amount || '0',
    minSelfDelegation: validator.minSelfDelegation.toString(),
    commission: atomicToDecimal(validator.commission?.rate || '0'),
    maxRate: atomicToDecimal(validator.commission?.maxRate || '0'),
    maxChangeRate: atomicToDecimal(validator.commission?.maxChangeRate || '0'),
    moniker: validator.description?.moniker || '',
    identity: validator.description?.identity || '',
    securityContact: validator.description?.securityContact || '',
    details: validator.description?.details || '',
    website: validator.description?.website || '',
    addresses: {
      operator: validator.id,
      account: '',
      hex: '',
      consensus: '',
      consensusPubkey: '',
    }
  }
}

async function getValidatorFromIndexer(address: string, apolloClient: ApolloClient<any>): Promise<Validator | null> {
  throw new Error('Not implemented properly yet. Please use getValidatorFromRpc for now.');

  const {data} = await apolloClient.query({
    query: validatorByIdDocument,
    variables: {
      id: address
    }
  })

  if (!data?.validator) {
    return null
  }

  return parseValidatorFromIndexer(data)
}

export type GetValidatorResult = Awaited<ReturnType<typeof getValidator>>

export default async function getValidator(address: string, rpcUrl: string, apolloClient: ApolloClient<any>) {
  return await fetchDataFromRpcOrIndexer({
    getFromRpc: getValidatorFromRpc,
    getFromIndexer: getValidatorFromIndexer,
    id: address,
    rpcUrl,
    apolloClient,
  })
}
