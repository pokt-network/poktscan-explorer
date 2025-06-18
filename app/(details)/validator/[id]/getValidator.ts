import type { ApolloClient } from '@apollo/client'
import { getUrl } from '@/app/components/RawEntity/utils'
import { validatorByIdDocument } from '@/app/(details)/validator/[id]/operations'
import { getStakeLabel } from '@/app/utils/stake'
import { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { fetchDataFromRpcOrIndexer } from '@/app/utils/fetch'

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

export interface Validator {
  status: string
  stakeAmount: string
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

export async function getValidatorFromRpc(address: string, rpcUrl: string): Promise<Validator | null> {
  const validator = await fetch(getUrl(rpcUrl, 'validator', address)).then(res => {
    if (res.status === 404) {
      return null
    } else {
      return res.json().then(res => res.validator)
    }
  }) as ValidatorResponseFromRpc['validator']


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
  }
}

export function parseValidatorFromIndexer(data: DocumentNodeData<typeof validatorByIdDocument>) {
  const validator = data!.validator!

  return {
    status: getStakeLabel(validator.stakeStatus),
    stakeAmount: validator.stakeAmount,
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
  }
}

async function getValidatorFromIndexer(address: string, apolloClient: ApolloClient<any>): Promise<Validator | null> {
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
