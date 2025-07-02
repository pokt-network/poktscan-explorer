export default function BoxLabel({label}: { label: string }) {
  return (
    <div
      className={'flex items-center pt-1 justify-center ml-2 h-[22px] mt-[-4px] border border-[color:--divider] px-[6px]'}
    >
      <p
        className={'text-[color:--secondary] text-[10px] -mt-0.5 leading-[22px]'}
      >
        {label}
      </p>
    </div>
  )
}
