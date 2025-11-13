export interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
  params: Promise<Record<string, string | string[] | undefined>>
}
