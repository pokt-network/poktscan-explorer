'use client'

import { useExpandContext } from '@/app/appbar/Routes/ExpandContext'
import { RoutesAccordion as RoutesAccordionComponent } from '@/app/components/RoutesMenu'
import routes from '@/app/appbar/Routes/routes'
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion'
import { useState } from 'react'
import * as React from 'react'

export default function RoutesAccordion() {
  const {isExpanded} = useExpandContext()
  const [height, setHeight] = useState("106px");

  return (
    <Accordion type={'single'} value={isExpanded ? 'expand' : ''} className={'lg:hidden'}>
      <AccordionItem value={'expand'}
      >
        <AccordionContent
          ref={(node) => {
            if (node) {
              setHeight(`${node.scrollHeight}px`);
            }
          }}
          style={{
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            '--radix-accordion-content-height': height,
          }}
        >
          <div>
            <RoutesAccordionComponent
              routeGroups={routes}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
