import millify from 'millify'
import Big from 'big.js'

export function convertUpoktToPokt(upokt: number | string ): number {
  // todo: convert upokt to pokt using a library to divide precisely (not using floats)
  return new Big(upokt).div(1e6).toNumber()
}

export function truncateBothSides(str: string, length: number) {
  if (str.length <= length) {
    return str
  }

  return `${str.substring(0, length)}...${str.substring(str.length - length)}`
}

export function truncateAddress(address: string) {
  // `pokt` is the prefix for every account and `poktvaloper` is for validators, so replace `valoper` after pokt in case
  // the address is the signer of a validator.
  return truncateBothSides(address.replace('pokt', '').replace('valoper', ''), 8)
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
  denom?: 'upokt' | string | null,
  includeSymbol?:boolean
  abbreviateThreshold?: number
  maxDecimals?: number
}

export function formatAmount({
  amount,
  denom,
  includeSymbol = true,
  abbreviateThreshold = 1e8,
  maxDecimals = 6,
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
    symbol = denom || ''
  }

  if (isNaN(amountNumber)) {
    amountNumber = 0
  }

  let amountString: string

  if (abbreviateThreshold && amountNumber >= abbreviateThreshold) {
    if (Number.isSafeInteger(Math.ceil(amountNumber))) {
      amountString = millify(amountNumber)
    } else {
      amountString = toScientificNotation(amountNumber)
    }
  } else {
    amountString = Number(amountNumber.toFixed(maxDecimals)).toLocaleString(undefined, {
      maximumFractionDigits: maxDecimals,
    })
  }

  return symbol && includeSymbol ? `${amountString} ${symbol}` : amountString
}

export function formatSize(size: number) {
  return millify(size, {
    units: ["B", "KB", "MB", "GB", "TB"],
    space: true,
  })
}

export function getCurrentDatetime(useUTC: boolean = false): string {
  const now = new Date();

  const year = useUTC ? now.getUTCFullYear() : now.getFullYear();
  const month = (useUTC ? now.getUTCMonth() : now.getMonth()) + 1;
  const day = useUTC ? now.getUTCDate() : now.getDate();
  const hours = useUTC ? now.getUTCHours() : now.getHours();
  const minutes = useUTC ? now.getUTCMinutes() : now.getMinutes();
  const seconds = useUTC ? now.getUTCSeconds() : now.getSeconds();

  const pad = (n: number) => String(n).padStart(2, '0');

  return `${year}-${pad(month)}-${pad(day)}_${pad(hours)}-${pad(minutes)}-${pad(seconds)}`;
}
