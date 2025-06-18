import { clsx } from 'clsx'
import { formatSimpleAmount } from '@/app/utils/format'
import { Item } from '@/app/components/EntityDetail'

interface SourceChipProps {
  source: 'indexer' | 'rpc'
  height?: string | number
}

export default function SourceChips({source, height}: SourceChipProps) {
  return (
    <div className={'absolute left-2.5 top-3 flex items-center justify-center gap-2'}>
      <div
        className={
          clsx(
            'flex items-center justify-center px-2 py-1 rounded-lg border-2',
            source === 'rpc' && 'border-[color:--warning-background]',
            source === 'indexer' && 'border-[color:--success-background]',
          )
        }
      >
        <p
          className={
            clsx(
              'text-xs font-semibold',
              source === 'rpc' && 'text-[color:--warning]',
              source === 'indexer' && 'text-[color:--success]',
            )
          }
        >
          {source === 'rpc' ? 'From RPC' : 'From Indexer'}
        </p>
      </div>
      {height && (
        <div className={'flex items-center justify-center px-2 py-1 rounded-lg border-2 border-[color:--highlight-option]'}>
          <p className={'text-xs font-semibold text-[color:--secondary]'}>Height: {formatSimpleAmount(height)}</p>
        </div>
      )}
    </div>
  )
}

export function getSourceChipsRow(source: 'indexer' | 'rpc', height?: string | number): Item {
  return {
    type: 'row',
    label: <span className={'block h-5'} />,
    value: <SourceChips source={source} height={height} />
  }
}
