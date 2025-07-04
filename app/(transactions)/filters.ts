import { TransactionFilter } from "../config/gql/graphql";

export enum TransactionFilterValues {
  Send = 'send',
  Claim = 'claim',
  Proof = 'proof',
  Governance = 'governance',
  Staking = 'staking',
}

const messagesByFilter: Record<TransactionFilterValues, Array<string>> = {
  [TransactionFilterValues.Send]: ["/cosmos.bank.v1beta1.MsgSend", "/cosmos.bank.v1beta1.MsgMulti Send"],
  [TransactionFilterValues.Claim]: ['/pocket.proof.MsgCreateClaim'],
  [TransactionFilterValues.Proof]: ['/pocket.proof.MsgSubmitProof'],
  [TransactionFilterValues.Governance]: ["/cosmos.authz.v1beta1.MsgExec"],
  [TransactionFilterValues.Staking]: [
    '/pocket.supplier.MsgStakeSupplier',
    '/pocket.application.MsgStakeApplication',
    '/pocket.gateway.MsgStakeGateway',
    '/pocket.supplier.MsgUnstakeSupplier',
    '/pocket.application.MsgUnstakeApplication',
    '/pocket.gateway.MsgUnstakeGateway',
  ],
}

export const transactionFilters: Array<{label: string, value: string}> = [
  {
    label: 'Send',
    value: TransactionFilterValues.Send,
  },
  {
    label: 'Claim',
    value: TransactionFilterValues.Claim,
  },
  {
    label: 'Proof',
    value: TransactionFilterValues.Proof,
  },
  {
    label: 'Governance',
    value: TransactionFilterValues.Governance,
  },
  {
    label: 'Staking',
    value: TransactionFilterValues.Staking,
  }
]

export function getTransactionGraphQlFilter(
  filter?: TransactionFilterValues,
  address?: string,
  height?: string | bigint | number,
): TransactionFilter | undefined {
  if (!filter && !address && !height) {
    return undefined
  }

  let graphQlFilter: TransactionFilter

  if (filter && Object.values(TransactionFilterValues).includes(filter)) {
    const messages = messagesByFilter[filter]

    if (messages?.length > 0) {
      graphQlFilter = {
        or: messages.map(message => ({
          amountOfMessages: {
            contains: [{type: message}]
          }
        }))
      }
    }
  }

  if (address) {
    graphQlFilter = {
      ...(graphQlFilter! || {}),
      signerAddress: {
        equalTo: address
      }
    }
  }

  if (height) {
    graphQlFilter = {
      ...(graphQlFilter! || {}),
      blockId: {
        equalTo: height
      }
    }
  }

  return graphQlFilter!
}
