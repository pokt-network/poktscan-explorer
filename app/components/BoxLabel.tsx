export default function BoxLabel({label}: { label: string }) {
  return (
    <span
      className={'text-[color:--secondary] ml-2 h-[22px] mt-[-2px] text-[10px] inline-block border border-[color:--divider] px-[6px] leading-[21px] pt-[0px]'}
    >
      {label}
    </span>
  )
}
