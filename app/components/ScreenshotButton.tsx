'use client'

import { Button } from '@/components/ui/button'
import { Image } from 'lucide-react'
import useTakeScreenshot from '@/app/hooks/useTakeScreenshot'

interface ScreenshotButtonProps {
  baseFileName: string
  nodeId: string
}

export default function ScreenshotButton({
  baseFileName,
  nodeId
}: ScreenshotButtonProps) {
  const {isLoading, takeScreenshot} = useTakeScreenshot({
    fileKeyName: baseFileName,
    nodeId,
  })
  return (
    <Button
      variant={'outline'}
      disabled={isLoading}
      onClick={takeScreenshot}
      className={'border-[color:--divider] text-[color:--primary] w-[30px] h-[30px] rounded-sm hover:border-[color:--primary] hover:text-[color:--primary]'}
    >
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image />
    </Button>
  )
}
