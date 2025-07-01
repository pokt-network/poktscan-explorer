import { Search } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function ItemsSelectorLoader() {
  return (
    <div className={'border border-[color:--divider] p-4 h-full w-full bg-[color:--main-background]'}>

      <div className={'h-[30px] flex flex-row items-center gap-1 border border-[color:--divider] bg-[color:--background] px-2'}>
        <Search className={'stroke-1 min-w-4 w-4 h-4 text-[color:--secondary]'} />
        <p className={'text-[color:--secondary] ml-0.5 tracking-wider text-xs select-none'}>
          Search...
        </p>
      </div>

      <div className={'flex flex-row gap-2 items-center mt-2'}>
        {Array.from({length: 3}).map((_, index) => (
          <Skeleton key={index} className={'w-[50px] h-5 rounded-2xl'} />
        ))}
      </div>

      <div
        className={'overflow-y-auto grow min-h-0 flex flex-col gap-3 mt-4 h-[calc(100%-50px-24px)]'}
      >
        {Array.from({length: 5}).map((_, index) => (
          <Skeleton key={index} className={'w-full h-5'} />
        ))}
      </div>
    </div>
  )
}
