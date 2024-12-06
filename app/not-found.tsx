import Link from 'next/link'

export default function NotFound() {
  return (
    <div className={'flex grow h-[calc(100dvh-70px-53px-55px)] flex-col pt-4 pl-6 sm:pl-10 xl:pl-4'}>
      <h1 className={'font-medium text-[8rem] leading-[140px]'}>404</h1>
      <p className={'text-[color:--secondary] font-medium text-4xl tracking-widest'}>
        Page Not Found
      </p>
      <p className={'text-[color:--secondary] tracking-wide mt-2 mb-5'}>
        The page you are looking for does not exist!
      </p>
      <Link href="/" className={'text-white w-[140px] text-center font-medium p-2 rounded-lg bg-[color:--primary-background] hover:bg-[color:--primary] transition-all'}>
        Back to home
      </Link>
    </div>
  )
}
