import Link from 'next/link'
import React from 'react'
import SelectItemsPerRow from '@/app/components/SelectItemsPerRow'
import { CircleAlert } from 'lucide-react';
import BaseTable from '@/app/components/BaseTable'
import TableDownloadButton from '@/app/components/TableDownloadButton'

export interface GridColDef {
  field: string
  headerName: React.ReactNode
  headerAlign?: 'left' | 'center' | 'right'
  width?: number
  minWidth?: number
  maxWidth?: number
  description?: string
  align?: 'left' | 'center' | 'right';
  // eslint-disable @typescript-eslint/no-explicit-any
  renderCell?: (cell: any) => React.ReactNode
}

export interface TableProps {
  header: {
    title: string
    subtitle?: React.ReactNode
  }
  columns: Array<GridColDef>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: Array<any>
  pagination: {
    currentPage: number
    totalPages: number
    itemsPerPage: number
    basePath: string
  }
  defaultMinWidth?: number
}



export default function Table({pagination, rows, columns, header, defaultMinWidth = 100}: TableProps) {
  return (
    <div className={"w-full h-full flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow"}>
      <Table.Header
        title={header.title}
        subtitle={header.subtitle}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        itemsPerPage={pagination.itemsPerPage}
        basePath={pagination.basePath}
        hidePagination={rows.length === 0}
        columns={columns}
        rows={rows}
      />
      <BaseTable columns={columns} rows={rows} defaultMinWidth={defaultMinWidth} />
      {
        rows.length > 0 ? (
          <Table.Footer
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            itemsPerPage={pagination.itemsPerPage}
            basePath={pagination.basePath}
          />
        ): (
          <div className={"h-[400px] flex flex-col items-center justify-center"}>
            <CircleAlert className={"h-16 w-16 text-[color:--warning]"}/>
            <p className={"text-lg font-semibold mt-4 mb-3"}>
              There are no matching records
            </p>
            <p className={"text-sm text-[color:--secondary]"}>
              Please try another search
            </p>
          </div>
        )
      }
    </div>
  )
}

function getSymbol(path: string) {
  return path.includes('?') ? '&' : '?'
}

export const getNewPageHref = ({
  itemsPerPage,
  newPage,
  basePath
}: {
  itemsPerPage: number,
  newPage: number,
  basePath: string
}) => {

  let href: string

  if (newPage === 1) {
    href = basePath
  } else {
    href = `${basePath}${getSymbol(basePath)}p=${newPage}`
  }

  if (itemsPerPage !== 25) {
    href += `${getSymbol(href)}ps=${itemsPerPage}`
  }

  return href
}

interface TableHeaderProps {
  title: string
  subtitle?: React.ReactNode
  currentPage: number
  totalPages: number
  itemsPerPage: number
  basePath: string
  hidePagination?: boolean
  rows: Array<any>
  columns: Array<GridColDef>
}

type TablePaginationProps = {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  basePath: string
}

Table.Pagination = function TablePagination({currentPage, totalPages, itemsPerPage, basePath}: TablePaginationProps) {
  const commonClasses = "text-[13px] inline-block rounded-md border border-[color:--divider] m-w-8 px-2 py-1 text-center leading-[18px]"
  const pClasses = `${commonClasses} text-[color:--secondary]`
  const aClasses = `${commonClasses} text-[color:--primary] aria-disabled:text-neutral-400 aria-disabled:cursor-not-allowed`
  return (
    <div className={"flex flex-row items-center justify-end gap-2"}>
      <Link
        className={aClasses}
        href={getNewPageHref({
          itemsPerPage,
          newPage: 1,
          basePath
        })}
        aria-disabled={currentPage === 1}
      >
        First
      </Link>
      <Link
        className={aClasses}
        href={getNewPageHref({
          itemsPerPage,
          newPage: currentPage - 1,
          basePath
        })}
        aria-disabled={currentPage === 1}
      >
        {'<'}
      </Link>
      <p
        className={pClasses}
      >
        Page {currentPage} of {totalPages}
      </p>
      <Link
        className={aClasses}
        href={getNewPageHref({
          itemsPerPage,
          newPage: currentPage + 1,
          basePath
        })}
        aria-disabled={currentPage === totalPages}
      >
        {'>'}
      </Link>
      <Link
        className={aClasses}
        href={getNewPageHref({
          itemsPerPage,
          newPage: totalPages,
          basePath
        })}
        aria-disabled={currentPage === totalPages}
      >
        Last
      </Link>
    </div>
  )
}

Table.Header = function TableHeader({title, subtitle, hidePagination,currentPage, totalPages, itemsPerPage, basePath, rows, columns}: TableHeaderProps) {
  return (
    <div className={"flex pt-4 px-3 md:px-4 pb-3 flex-row w-full min-h-[74px] flex-wrap items-center justify-between gap-3"}>
      <div>
        <p className={"text-sm"}>
          {title}
        </p>
        {subtitle ? typeof subtitle === 'string' ? (
          <p className={'text-xs text-[color:--secondary]'}>
            {subtitle}
          </p>
        ) : subtitle : null}
      </div>

      <div className={'flex flex-row items-center justify-between gap-2 flex-wrap'}>
        <TableDownloadButton rows={rows} columns={columns.map((col) => ({...col, renderCell: undefined}))} />
        {!hidePagination && (
          <Table.Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            basePath={basePath}
          />
        )}
      </div>
    </div>
  )
}

interface TableFooterProps {
  currentPage: number;
  itemsPerPage: number
  totalPages: number
  basePath: string
}

const validItemsPerPage = [25, 50, 75, 100]

Table.Footer = function TableFooter({currentPage, itemsPerPage, totalPages, basePath}: TableFooterProps) {
  const itemsPerPageOption = validItemsPerPage.includes(itemsPerPage) ? itemsPerPage : 25

  return (
    <div className={"flex flex-row py-4 px-3 md:px-4 w-full min-h-[74px] items-center justify-between border-t border-[color:--divider] flex-wrap gap-3"}>
      <div className={"flex flex-row items-center gap-2"}>
        <p className={"text-sm text-[color:--secondary] whitespace-nowrap"}>
          Show rows:
        </p>
        <SelectItemsPerRow value={itemsPerPageOption} basePath={basePath} currentPage={currentPage} options={validItemsPerPage as Array<number>} />
      </div>

      <Table.Pagination currentPage={currentPage} totalPages={totalPages} itemsPerPage={itemsPerPage} basePath={basePath} />
    </div>
  )
}
