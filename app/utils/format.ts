import millify from 'millify'

export function convertUpoktToPokt(upokt: number | string ): number {
  // todo: convert upokt to pokt using a library to divide precisely (not using floats)
  return Number(upokt) / 1e6
}

export function truncateBothSides(str: string, length: number) {
  if (str.length <= length) {
    return str
  }

  return `${str.substring(0, length)}...${str.substring(str.length - length)}`
}

export function truncateAddress(address: string) {
  return truncateBothSides(address.replace('pokt', ''), 8)
}

function toScientificNotation(num: number): string {
  if (num === 0) return "0";

  const exponent = Math.floor(Math.log10(Math.abs(num)));
  const mantissa = num / Math.pow(10, exponent);

  return `${mantissa.toFixed(6)}e${exponent}`;
}

export function formatUpokt(props: Omit<FormatAmountProps, 'denom'> & {denom?: 'upokt'}) {
  return formatAmount({
    ...props,
    denom: 'upokt'
  })
}

export function formatSimpleAmount(amount: FormatAmountProps['amount']) {
  return formatAmount({
    amount,
  })
}

interface FormatAmountProps {
  amount: number | string | bigint,
  denom?: 'upokt' | null,
  includeSymbol?:boolean
  abbreviateThreshold?: number
  maxDecimals?: number
}

export function formatAmount({
  amount,
  denom,
  includeSymbol = true,
  abbreviateThreshold = 1e8,
  maxDecimals = 4,
}: FormatAmountProps) {
  if (!amount) {
    return '0'
  }

  let amountNumber: number, symbol: string

  if (denom === 'upokt') {
    amountNumber = convertUpoktToPokt(amount.toString())
    symbol = 'POKT'
  } else {
    amountNumber = Number(amount)
  }

  if (isNaN(amountNumber)) {
    amountNumber = 0
  }

  let amountString: string

  if (abbreviateThreshold && amountNumber >= abbreviateThreshold) {
    if (Number.isSafeInteger(amountNumber)) {
      amountString = millify(amountNumber)
    } else {
      amountString = toScientificNotation(amountNumber)
    }
  } else {
    amountString = Number(amountNumber.toFixed(maxDecimals)).toLocaleString()
  }

  return symbol && includeSymbol ? `${amountString} ${symbol}` : amountString
}

export function formatSize(size: number) {
  return millify(size, {
    units: ["B", "KB", "MB", "GB", "TB"],
    space: true,
  })
}
