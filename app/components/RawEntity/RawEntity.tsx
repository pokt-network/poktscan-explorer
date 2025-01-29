import { EntityLinkProps } from '@/app/components/EntityLink'
import RawEntityClient from '@/app/components/RawEntity/Client'

interface RawEntityProps {
  entity: EntityLinkProps['entity']
  id: string
  loadOnClick?: boolean
}

export default function RawEntity({entity, id, loadOnClick}: RawEntityProps) {
  return (
    <RawEntityClient baseUrl={process.env.RPC_BASE_URL} entity={entity} id={id} loadOnClick={loadOnClick} />
  )
}
