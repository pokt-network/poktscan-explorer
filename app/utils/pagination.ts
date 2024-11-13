interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function getPageAndItems(
  searchParams: PageProps['searchParams'],
) {
  const params = await searchParams

  let page = 1, itemsPerPage = 25

  if (typeof params.p === 'string') {
    page = parseInt(params.p)
  }

  if (typeof params.ps === 'string') {
    const ps = parseInt(params.ps)

    if ([25, 50, 75, 100].includes(ps)) {
      itemsPerPage = ps
    }
  }

  return {page, itemsPerPage}
}
