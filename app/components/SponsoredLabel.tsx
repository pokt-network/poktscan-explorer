interface SponsoredLabelProps {
  lightColor?: string
}

export default function SponsoredLabel({lightColor}: SponsoredLabelProps) {
  const color = lightColor ? `text-${lightColor}` : 'text-neutral-300'

  return (
    <p className={`text-sm ${color} dark:text-[color:--secondary] leading-[23px]`}>
      <span className={'font-semibold'}>Sponsored:</span> Want to earn rewards with Pocket Network?{' '}
      <a
        className={'text-[color:--primary] dark:hover:text-blue-300 hover:text-blue-600 font-semibold'}
        href={'mailto:info@pocket.network'}
      >
        Stake with us!
      </a>
    </p>
  )
}
