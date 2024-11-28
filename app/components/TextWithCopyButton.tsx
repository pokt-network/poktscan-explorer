import CopyIconButton from '@/app/components/CopyIconButton'

export default function TextWithCopyButton({text}: {text: string}) {
  return (
    <span className={'inline-flex min-w-0 grow flex-row items-center'}>
      <span className={'text-sm whitespace-nowrap overflow-hidden overflow-ellipsis'}>
        {text}
      </span>
      <CopyIconButton text={text.replace('#', '')} />
    </span>
  )
}
