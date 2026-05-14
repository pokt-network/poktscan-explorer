import { EntityLinkProps } from '@/app/components/EntityLink'
import RawEntityClient from '@/app/components/RawEntity/Client'
import { getPublicRpcUrl } from '@/app/utils/rpcUrl'

interface RawEntityProps {
  entity: EntityLinkProps['entity']
  id: string
  loadOnClick?: boolean
  rpcUrl?: string
}

export default function  RawEntity({entity, id, loadOnClick, rpcUrl}: RawEntityProps) {
  const baseUrl = rpcUrl || getPublicRpcUrl()
  return (
    <RawEntityClient baseUrl={baseUrl} entity={entity} id={id} loadOnClick={loadOnClick} />
  )
}
