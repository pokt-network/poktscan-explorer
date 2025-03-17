import TextWithCopyButton from '@/app/components/TextWithCopyButton'
// import SponsoredLabel from '@/app/components/SponsoredLabel'
import React from 'react'

interface TitleEntityProps {
  title: string
  text: string
}

export default function TitleEntity({title, text}: TitleEntityProps) {
  return (
    <>
      <div className={"flex flex-row items-center gap-2"}>
        <h1 className={'text-lg font-medium'}>
          {title}
        </h1>
        <TextWithCopyButton text={text} />
      </div>
      <hr className={'border-[color:--divider] mt-1'} />
      <div className={'pb-4'}>
        {/*<SponsoredLabel lightColor={'[color:--secondary]'} />*/}
      </div>

    </>
  )
}
