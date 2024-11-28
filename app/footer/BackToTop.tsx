'use client'
import { ArrowUpToLine } from 'lucide-react';

export default function BackToTop() {

  return (
    <div
      className={'flex flex-row items-center gap-1.5 cursor-pointer hover:text-[color:--primary]'}
      onClick={e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }}>
      <ArrowUpToLine className={'h-4 w-4'} />
      <p className={'text-sm'}>Back to Top</p>
    </div>
  )
}
