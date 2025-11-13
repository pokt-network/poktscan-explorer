import { EntityLinkProps } from '@/app/components/EntityLink'
import RawEntityClient from '@/app/components/RawEntity/Client'

interface RawEntityProps {
  entity: EntityLinkProps['entity']
  id: string
  loadOnClick?: boolean
  rpcUrl?: string
}

export default function  RawEntity({entity, id, loadOnClick, rpcUrl}: RawEntityProps) {
  const baseUrl = rpcUrl || process.env.NEXT_PUBLIC_RPC_BASE_URL!
  return (
    <RawEntityClient baseUrl={baseUrl} entity={entity} id={id} loadOnClick={loadOnClick} />
  )
}
