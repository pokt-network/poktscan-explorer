import Link from 'next/link'
import { Table as ShadTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import React from 'react'
import SelectItemsPerRow from '@/app/components/SelectItemsPerRow'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CircleHelp } from 'lucide-react'

export interface GridColDef {
  field: string
  headerName: React.ReactNode
  headerAlign?: 'left' | 'center' | 'right'
  minWidth?: number
  maxWidth?: number
  description?: string
  // eslint-disable @typescript-eslint/no-explicit-any
  renderCell?: (cell: any) => React.ReactNode
}

export interface TableProps {
  header: {
    title: string
    subtitle: string
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
}



export default function Table({pagination, rows, columns, header, }: TableProps) {
  return (
    <div className={"w-full h-full flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background]"}>
      <Table.Header
        title={header.title}
        subtitle={header.subtitle}
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        itemsPerPage={pagination.itemsPerPage}
        basePath={pagination.basePath}
      />
      <Table.Table columns={columns} rows={rows} />
      <Table.Footer
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        itemsPerPage={pagination.itemsPerPage}
        basePath={pagination.basePath}
      />
    </div>
  )
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
    href = `${basePath}?p=${newPage}`
  }

  if (itemsPerPage !== 25) {
    href += `${newPage === 1 ? '?' : '&'}ps=${itemsPerPage}`
  }

  return href
}

interface TableHeaderProps {
  title: string
  subtitle: string
  currentPage: number
  totalPages: number
  itemsPerPage: number
  basePath: string
}

type TablePaginationProps = Omit<TableHeaderProps, 'title' | 'subtitle'>

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

Table.Header = function TableHeader({title, subtitle, currentPage, totalPages, itemsPerPage, basePath}: TableHeaderProps) {
  return (
    <div className={"flex p-4 flex-row w-full h-74 items-center justify-between"}>
      <div>
        <p className={"text-sm"}>
          {title}
        </p>
        <p className={"text-xs text-[color:--secondary]"}>
          {subtitle}
        </p>
      </div>

      <Table.Pagination currentPage={currentPage} totalPages={totalPages} itemsPerPage={itemsPerPage} basePath={basePath} />
    </div>
  )
}

interface TableTableProps {
  columns: Array<GridColDef>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: Array<any>
}

Table.Table = function Table({columns, rows}: TableTableProps) {
  return (
    <ShadTable>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => {

              return (
                <TableHead
                  key={column.field}
                  style={{
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                  }}
                  className={`${index ? 'pl-2' : 'pl-4'} text-[13px] text-left whitespace-nowrap py-[10px] ${index === columns.length - 1 ? 'pr-4' : 'pr-2'}`}
                >
                  <span>
                    {column.headerName}
                  </span>
                  {column.description && (
                    <div className={'inline-flex relative w-4 h-4'}>
                      <TooltipProvider delayDuration={150}>
                        <Tooltip>
                          <TooltipTrigger className={'ml-[2px] absolute top-[3px] left-[2px]'}>
                            <CircleHelp className={'w-4 h-4 text-[color:--secondary]'} />
                          </TooltipTrigger>
                          <TooltipContent side={'left'}>
                            <p
                              className={'p-2 bg-[color:--main-background] rounded-lg border border-[color:--divider]'}>
                              {column.description}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                  )}
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            {columns.map((column, index) => {
              return (
                <TableCell
                  key={column.field}
                  style={{
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                  }}
                  className={`h-[48px] py-[10px] ${index ? 'pl-2' : 'pl-4'} ${index === columns.length - 1 ? 'pr-4' : 'pr-2'}`}
                  >
                    {column.renderCell ? column.renderCell(row) : (
                      <p className={"text-[14px] whitespace-nowrap overflow-hidden overflow-ellipsis"}>
                        {row[column.field]}
                      </p>
                    )}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
    </ShadTable>
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
    <div className={"flex flex-row p-4 w-full h-[74px] items-center justify-between border-t border-[color:--divider]"}>
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
