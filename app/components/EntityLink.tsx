import Link from 'next/link'

interface EntityLinkProps {
  entity: 'block'
  entityId: string | number
}

export default function EntityLink({entityId, entity}: EntityLinkProps) {
  return (
    <Link href={`/${entity}/${entityId}`} className={"text-[color:--primary] dark:hover:text-blue-400 hover:text-blue-600 decoration-none"} prefetch>
      {entityId}
    </Link>
  )
}
