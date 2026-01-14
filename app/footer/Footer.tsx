import ResponsiveTooltip from '@/app/components/ResponsiveTooltip'
import BackToTop from '@/app/footer/BackToTop'
import { Mail } from 'lucide-react'
import Github from '@/app/footer/github.svg'
import Discord from '@/app/footer/discord.svg'

export default function Footer() {
  return (
    <footer className={'w-full h-full flex items-center justify-center'}>
      <div className={'flex flex-col gap-3 max-w-[1400px] w-full px-3 py-5 md:px-4'}>
        <div className={'flex flex-row items-center justify-between w-full gap-2'}>
          <div className={'flex flex-row items-center gap-2'}>
            {[
              {
                tooltip: 'X',
                href: '',
                icon: '𝕏',
                target: '_blank',
              },
              {
                tooltip: 'Discord',
                href: '',
                icon: (
                  <Discord />
                ),
                target: '_blank',
              },
              {
                tooltip: 'Email',
                href: '',
                icon: (
                  <Mail />
                ),
              },
              {
                tooltip: 'GitHub',
                href: 'https://github.com/trustsoothe',
                icon: (
                  <Github />
                ),
                target: '_blank',
              },
            ].map(({ tooltip, href, icon, target }) => (
              <ResponsiveTooltip
                key={tooltip}
                includeArrow={false}
                trigger={(
                  <a
                    target={target}
                    href={href}
                    className={'h-[30px] w-[30px] px-2 text-sm font-semibold rounded-full flex items-center justify-center border-[color:transparent!important] border-none'}
                  >
                    {icon}
                  </a>
                )}
                content={tooltip}
                contentProps={{
                  side: 'top',
                  arrowPadding: 10
                }}
              />
            ))}
          </div>
          <BackToTop />
        </div>
        <hr className={'border-[color:--divider] my-1'} />
        <p className={'text-xs text-[color:--secondary]'}>
          &copy; 2025 Pocket Scan Technologies
        </p>
      </div>
    </footer>
  )
}
