import Link from 'next/link'
import CopyIconButton from '@/app/components/CopyIconButton'

export interface EntityLinkProps {
  entity: 'block' | 'supplier' | 'account' | 'tx' | 'app' | 'gateway'
  entityId: string | number
  label?: string
  copy?: {
    enabled: boolean
    tooltip?: string
  }
}

export default function EntityLink({entityId, entity, label, copy}: EntityLinkProps) {
  if (!entityId) {
    return null
  }

  return (
    <div className={"flex flex-row items-center gap-0.5"}>
      <Link href={`/${entity}/${entityId}`} className={"text-[color:--primary] dark:hover:text-blue-300 hover:text-blue-600 decoration-none whitespace-nowrap overflow-hidden overflow-ellipsis"} prefetch>
        {label || entityId}
      </Link>
      {
        copy?.enabled && (
          <CopyIconButton
            text={entityId?.toString()!}
            tooltip={copy.tooltip}
          />
        )
      }
    </div>
  )
}
