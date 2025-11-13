import ParamList from '@/app/params/ParamList'

export default async function ParamsPage() {
  return (
    <div className={"px-3 py-5 md:px-4 gap-4 flex flex-col"}>
      <ParamList initialData={null} initialError={false} />
    </div>
  )
}
