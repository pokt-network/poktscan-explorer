'use client'
import { ArrowUpToLine } from 'lucide-react';
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const pathhame = usePathname();

  useEffect(() => {
    const element = document.documentElement;

    const checkScrollbarVisibility = () => {
      setIsVisible(element.scrollHeight > element.clientHeight);
    };

    // Initial check
    checkScrollbarVisibility();

    // Add event listener to handle dynamic changes
    window.addEventListener('resize', checkScrollbarVisibility);

    // Cleanup event listener
    return () => {
      window.removeEventListener('resize', checkScrollbarVisibility);
    };
  }, [pathhame]);

  return isVisible ? (
    <div
      className={'flex flex-row items-center gap-1.5 cursor-pointer hover:text-[color:--primary]'}
      onClick={e => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      suppressHydrationWarning
    >
      <ArrowUpToLine className={'h-4 w-4'} />
      <p className={'text-sm'}>Back to Top</p>
    </div>
  ) : null
}
