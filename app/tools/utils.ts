import { isValidPoktAddress } from '@/app/utils/poktroll'
import { maxAddresses } from '@/app/tools/operator/constants'

export function getValidAddresses(addresses?: string) {
  if (!addresses) return []

  return typeof addresses === 'string' ? addresses.split(',').filter(isValidPoktAddress).slice(0, maxAddresses) : []
}
