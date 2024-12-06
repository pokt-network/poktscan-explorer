import ResponsiveTooltip from '@/app/components/ResponsiveTooltip'
import BackToTop from '@/app/footer/BackToTop'
import { Mail } from 'lucide-react'
import Github from '@/app/footer/github.svg'
import Discord from '@/app/footer/discord.svg'

export default function Footer() {
  return (
    <footer className={'w-full h-full flex items-center justify-center'}>
      <div className={'flex flex-row items-center justify-between max-w-[1400px] w-full px-3 py-5 md:px-4'}>
        <div className={'flex flex-row items-center gap-2'}>
          {[
            {
              tooltip: 'X / Twitter',
              href: 'https://twitter.com/poktscan',
              icon: '𝕏',
              target: '_blank',
            },
            {
              tooltip: 'Discord',
              href: 'https://discord.gg/5PjUPybh',
              icon: (
                <Discord />
              ),
              target: '_blank',
            },
            {
              tooltip: 'Email',
              href: 'mailto:info@poktscan.com',
              icon: (
                <Mail />
              ),
            },
            {
              tooltip: 'GitHub',
              href: 'https://github.com/pokt-scan',
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
    </footer>
  )
}
