// import SponsoredLabel from '@/app/components/SponsoredLabel'
import React from 'react'

interface ListTitleProps {
  title: string
}

export default function ListTitle({title}: ListTitleProps) {
  return (
    <>
      <h1 className={'text-lg font-medium'}>
        {title}
      </h1>
      <hr className={'border-[color:--divider] mt-1'} />
      <div className={'pb-4'}>
        {/*<SponsoredLabel lightColor={'[color:--secondary]'} />*/}
      </div>
    </>
  )
}
