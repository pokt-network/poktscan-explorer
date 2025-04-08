import Link from 'next/link'
import CopyIconButton from '@/app/components/CopyIconButton'
import { isValidHash, isValidPoktAddress } from '@/app/utils/poktroll'
import { truncateAddress, truncateBothSides } from '@/app/utils/format'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { TooltipArrow } from '@radix-ui/react-tooltip'

export interface EntityLinkProps {
  entity: 'block' | 'supplier' | 'account' | 'tx' | 'app' | 'gateway' | 'validator' | 'service'
  entityId: string | number
  label?: string
  prefetch?: boolean
  copy?: {
    enabled: boolean
    tooltip?: string
  }
}

export default function EntityLink({entityId, entity, label, copy, prefetch = false}: EntityLinkProps) {
  if (!entityId) {
    return null
  }

  const copyEnabled = copy ? copy.enabled : true

  let text = label || entityId, includeTooltip = false

  if (!label) {
    if (isValidPoktAddress(entityId as string)) {
      text = truncateAddress(entityId as string)
      includeTooltip = true
    } else if (isValidHash(entityId as string)) {
      text = truncateBothSides(entityId as string, 8)
      includeTooltip = true
    }
  }

  const link = (
    <Link
      prefetch={prefetch}
      href={`/${entity}/${entityId}`}
      className={"text-[color:--primary] dark:hover:text-blue-300 hover:text-blue-600 decoration-none whitespace-nowrap overflow-hidden overflow-ellipsis"}
    >
      {text}
    </Link>
  )

  return (
    <div className={"flex flex-row items-center gap-0.5 h-[24px] min-w-0"}>
        {includeTooltip ? (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                {link}
              </TooltipTrigger>
              <TooltipContent side={'top'}>
                <p className={'p-2 bg-[color:--tooltip-background] text-white rounded-lg text-xs base-shadow'}>
                  {entityId}
                </p>
                <TooltipArrow className={'mt-[-7px] fill-[color:--tooltip-background] stroke-[color:--tooltip-background] stroke-2'} />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : link}
      {
        copyEnabled && (
          <CopyIconButton
            text={entityId?.toString() || ''}
            tooltip={copy?.tooltip}
          />
        )
      }
    </div>
  )
}
