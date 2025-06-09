'use client'

import { Copy } from 'lucide-react';
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { TooltipArrow } from '@radix-ui/react-tooltip'

interface CopyIconButtonProps {
  text: string
  tooltip?: string
}

export default function CopyIconButton({text, tooltip}: CopyIconButtonProps) {
  const [isCopied, setIsCopied] = useState(false)

  const Icon = isCopied ? Check : Copy

  const buttonComponent = (
    <Button
      variant={'ghost'}
      size={'icon'}
      className={"text-[color:--secondary] hover:text-[color:--primary] dark:hover:text-blue-300 hover:dark:text-blue-300"}
      onClick={(e) => {
        e.preventDefault()
        navigator.clipboard.writeText(text).then(() => {
          setIsCopied(true)
          setTimeout(() => {
            setIsCopied(false)
          }, 1000)
        })
      }}
    >
      <Icon className={'h-3 w-3'} />
    </Button>
  )

  if (!tooltip) {
    return buttonComponent
  }

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          {buttonComponent}
        </TooltipTrigger>
        <TooltipContent alignOffset={10}>
          <p className={"p-2 bg-[color:--main-background] rounded-lg border border-[color:--divider]"}>
            {isCopied ? 'Copied!' : tooltip}
          </p>
          <TooltipArrow className={"fill-[color:--main-background] stroke-[color:--divider] stroke-2"} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
