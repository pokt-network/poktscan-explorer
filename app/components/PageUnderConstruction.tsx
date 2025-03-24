import React from 'react'
import ListTitle from '@/app/components/ListTitle'
import { Hammer, HardHat, Pickaxe } from 'lucide-react'

interface PageUnderConstructionProps {
  title: string
}

export default function PageUnderConstruction({title}: PageUnderConstructionProps) {
  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex h-[calc(100dvh-53px-57px-70px)] flex-col"}>
      <ListTitle title={title} />
      <div className={'w-full h-full flex flex-col items-center justify-center'}>
        <HardHat className={'w-14 h-14 stroke-1 mt-[-150px] text-[#6898ff]'}/>
        <div className={' flex flex-row items-center gap-4'}>
          <Hammer className={'text-[--secondary] w-14 h-14 stroke-1 rotate-[-10deg]'}/>
          <div>
            <p className={'font-medium text-4xl tracking-wide text-center'}>Page<br/>Under Construction</p>
          </div>
          <Pickaxe className={'text-[--secondary] w-14 h-14 stroke-1 rotate-[-75deg] ml-1'}/>
        </div>
      </div>
    </div>
  )
}
