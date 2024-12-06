'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Error({

  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className={'flex grow h-[calc(100dvh-70px-53px-55px)] flex-col pt-4 pl-6 sm:pl-10 xl:pl-4'}>
      <h1 className={'font-medium text-[6rem] leading-[140px]'}>Oops!</h1>
      <p className={'text-[color:--secondary] font-medium text-4xl tracking-widest'}>
        There was an error.
      </p>
      <p className={'text-[color:--secondary] tracking-wide mt-2 mb-5'}>
        There was an error while trying to load the page. Please try again later.
      </p>
      <div className={'flex items-center gap-4'}>
        <Button
          onClick={reset}
          className={'text-white h-11 w-[140px] text-center font-medium p-2 rounded-lg bg-[color:--primary-background] hover:bg-[color:--primary] transition-all'}>
          Refresh
        </Button>
        <Link href="/" className={'text-[color:--secondary] w-[140px] text-center font-medium p-2 rounded-lg border-2 border-[color:--secondary]  hover:text-[color:--foreground] transition-all'}>
          Back to home
        </Link>
      </div>
    </div>
  )
}
