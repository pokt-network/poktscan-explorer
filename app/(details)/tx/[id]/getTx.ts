import type { ApolloClient } from '@apollo/client'
import { cache } from 'react'
import { getUrl } from '@/app/components/RawEntity/utils'
import { DocumentNodeData } from '@/app/hooks/useFetchOnBlock'
import { graphql } from '@/app/config/gql'
import { getMultisigInfo, isMsgValidatorRelated, isMulti, PREFIX,Secp256k1, pubKeyToAddress, SignerInfoSDKType, VALIDATOR_PREFIX } from '@/app/utils/poktroll'
import { fetchDataFromRpcOrIndexer } from '@/app/utils/fetch'

export type TxFromIndexer = DocumentNodeData<typeof txByIdDocument>['transaction']

export interface TxResponseFromRpc {
  tx: {
    body: {
      messages: Array<{
        "@type": string
      } & object>
      memo: string
      timeout_height: string
      unordered: boolean
      timeout_timestamp: any
      extension_options: Array<any>
      non_critical_extension_options: Array<any>
    }
    auth_info: {
      signer_infos: Array<SignerInfoSDKType>
      fee: {
        amount: Array<{
          denom: string
          amount: string
        }>
        gas_limit: string
        payer: string
        granter: string
      }
      tip: any
    }
    signatures: Array<string>
  }
  tx_response: {
    height: string
    txhash: string
    codespace: string
    code: number
    data: string
    raw_log: string
    logs: Array<any>
    info: string
    gas_wanted: string
    gas_used: string
    tx: {
      "@type": string
      body: {
        messages: Array<{
          "@type": string
        } & object>
        memo: string
        timeout_height: string
        unordered: boolean
        timeout_timestamp: any
        extension_options: Array<any>
        non_critical_extension_options: Array<any>
      }
      auth_info: {
        signer_infos: Array<{
          public_key: {
            "@type": string
            key: string
          }
          mode_info: {
            single: {
              mode: string
            }
          }
          sequence: string
        }>
        fee: {
          amount: Array<{
            denom: string
            amount: string
          }>
          gas_limit: string
          payer: string
          granter: string
        }
        tip: any
      }
      signatures: Array<string>
    }
    timestamp: string
    events: Array<{
      type: string
      attributes: Array<{
        key: string
        value: string
        index: boolean
      }>
    }>
  }
}

const txByIdDocument = graphql(`
  query transaction($id: String!) {
    transaction(id: $id) {
      id
      code
      codespace
      block {
        timestamp
        height: id
      }
      gasUsed
      gasWanted
      signerAddress
      fees
      memo
      isMultisig
      multisig
      amountSentByDenom
    }
  }
`)

const getRawTxFromRpc = cache(async (hash: string, rpcUrl: string): Promise<TxResponseFromRpc> => {
  return await fetch(
    getUrl(rpcUrl, 'tx', hash)
  ).then((res) => {
    if (res.status === 404) {
      return null
    }

    return res.json()
  })
})

export default getRawTxFromRpc

export interface Tx {
  signerAddress: string
  code: number,
  codespace: string | null,
  height: string,
  timestamp: string | null,
  gasUsed: string,
  gasWanted: string,
  fees: Array<{
    amount: string,
    denom: string
  }>,
  memo: string | null,
  isMultisig: boolean,
  // need to parse this to be able to obtain this
  multisig:  {
  from: string,
    all: Array<string>,
    signed: Array<string>,
    indices: Array<number>,
    threshold: number,
    multisigPubKey: string,
    bitarrayElems: string,
    extraBitsStored: number,
  } | null
  amountSentByDenom: Array<{
    denom: string,
    amount: string
  }>
}

export async function getTxFromRpc(hash: string, rpcUrl: string): Promise<Tx & {messages: TxResponseFromRpc['tx']['body']['messages']} | null> {
  const txFromRpc = await getRawTxFromRpc(hash, rpcUrl)

  if (!txFromRpc) {
    return null
  }

  const signerInfo = txFromRpc.tx.auth_info.signer_infos.at(0)!
  const isMultisig =  isMulti(signerInfo)

  const multisigObject  = isMultisig ? getMultisigInfo(signerInfo) : null

  let signerAddress = ''

  if (multisigObject) {
    signerAddress = multisigObject.fromAddress
  } else if (signerInfo.public_key?.['@type'] === Secp256k1) {
    signerAddress = pubKeyToAddress(
      signerInfo.public_key['@type'],
      signerInfo.public_key.key,
      isMsgValidatorRelated(txFromRpc.tx.body.messages.at(0)?.['@type'] || '') ? VALIDATOR_PREFIX : PREFIX,
    );
  }

  // eslint-disable-next-line
  // @ts-ignore
  const sentMessages: Array<{
    '@type': '/cosmos.bank.v1beta1.MsgSend',
    amount: Array<{amount: string, denom: string}>
  }> = txFromRpc.tx.body.messages.filter(message => message['@type'] === '/cosmos.bank.v1beta1.MsgSend')

  const amountByDenomRecord = sentMessages.reduce((acc, message) => {
    message.amount.forEach(amount => {
      acc[amount.denom] = BigInt(acc[amount.denom] || 0) + BigInt(amount.amount)
    })

    return acc
  }, {} as Record<string, bigint>)

  const amountSentByDenom = Object.keys(amountByDenomRecord).map(denom => ({
    denom,
    amount: amountByDenomRecord[denom].toString()
  }))


  return {
    // need to parse this to be able to obtain signerAddress
    signerAddress,
    code: txFromRpc.tx_response.code,
    codespace: txFromRpc.tx_response.codespace,
    height: txFromRpc.tx_response.height,
    timestamp: null,
    gasUsed: txFromRpc.tx_response.gas_used,
    gasWanted: txFromRpc.tx_response.gas_wanted,
    fees: txFromRpc.tx.auth_info.fee.amount,
    memo: txFromRpc.tx.body.memo,
    isMultisig: isMultisig,
    messages: txFromRpc.tx.body.messages,
    // need to parse this to be able to obtain this
    multisig: multisigObject ? {
      from: multisigObject.fromAddress,
      all: multisigObject.allSignerAddresses,
      signed: multisigObject.signedSignerAddresses,
      indices: multisigObject.signerIndices,
      threshold: multisigObject.threshold,
      multisigPubKey: multisigObject.multisigPubKey,
      bitarrayElems: multisigObject.bitarrayElems,
      extraBitsStored: multisigObject.extraBitsStored,
    } : null,
    amountSentByDenom,
  }
}

async function getTxFromIndexer(hash: string, apolloClient: ApolloClient<any>): Promise<Tx | null> {
  const {data} = await apolloClient.query({
    query: txByIdDocument,
    variables: {
      id: hash
    }
  })

  if (!data?.transaction) {
    return null
  }

  const txFromIndexer = data.transaction

  return {
    signerAddress: txFromIndexer.signerAddress!,
    code: txFromIndexer.code,
    codespace: txFromIndexer.codespace || null,
    height: txFromIndexer.block?.height,
    timestamp: txFromIndexer.block?.timestamp,
    gasUsed: txFromIndexer.gasUsed,
    gasWanted: txFromIndexer.gasWanted,
    fees: txFromIndexer.fees,
    memo: txFromIndexer.memo || null,
    isMultisig: txFromIndexer.isMultisig,
    multisig: txFromIndexer.multisig,
    amountSentByDenom: txFromIndexer.amountSentByDenom,
  }
}

export type GetTxResult = Awaited<ReturnType<typeof getTransaction>>

export async function getTransaction(hash: string, rpcUrl: string, apolloClient: ApolloClient<any>) {
  return await fetchDataFromRpcOrIndexer({
    getFromRpc: getTxFromRpc,
    getFromIndexer: getTxFromIndexer,
    id: hash,
    rpcUrl,
    apolloClient,
  })
}

export async function getMessages(hash: string, rpcUrl: string) {
  const rpcData = await getRawTxFromRpc(hash, rpcUrl)

  return rpcData.tx.body.messages.map((message) => ({
    typeUrl: message['@type'],
    json: JSON.stringify({
      ...message,
      ['@type'] : undefined
    })
  }))
}

function parseAttributeValue(value: string) {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1)
  }

  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

export async function getEvents(hash: string, rpcUrl: string) {
  const rpcData = await getRawTxFromRpc(hash, rpcUrl)

  return rpcData.tx_response.events.map((event) => ({
    typeUrl: event.type,
    json: JSON.stringify(event.attributes.reduce((acc, item) => ({
      ...acc,
      [item.key]: parseAttributeValue(item.value),
    }), {}))
  }))
}
