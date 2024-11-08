import Link from 'next/link'
import { Table as ShadTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import React from 'react'
import SelectItemsPerRow from '@/app/components/SelectItemsPerRow'

export interface GridColDef {
  field: string
  headerName: string
  minWidth?: number
  // eslint-disable @typescript-eslint/no-explicit-any
  renderCell?: (cell: any) => React.ReactNode
}

interface TableProps {
  header: {
    title: string
    subtitle: string
  }
  columns: Array<GridColDef>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: Array<any>
  pagintation: {
    currentPage: number
    totalPages: number
    itemsPerPage: number
  }
}



export default function Table({pagintation, rows, columns, header}: TableProps) {
  return (
    <div className={"w-full h-full flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background]"}>
      <Table.Header
        title={header.title}
        subtitle={header.subtitle}
        currentPage={pagintation.currentPage}
        totalPages={pagintation.totalPages}
        itemsPerPage={pagintation.itemsPerPage}
      />
      <Table.Table columns={columns} rows={rows} />
      <Table.Footer
        currentPage={pagintation.currentPage}
        totalPages={pagintation.totalPages}
        itemsPerPage={pagintation.itemsPerPage}
      />
    </div>
  )
}

export const getNewPageHref = ({
                          itemsPerPage,
                          newPage,
                        }: {
  itemsPerPage: number,
  newPage: number,
}) => {
  let href: string

  if (newPage === 1) {
    href = `/blocks`
  } else {
    href = `/blocks?p=${newPage}`
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
}

type TablePaginationProps = Omit<TableHeaderProps, 'title' | 'subtitle'>

Table.Pagination = function TablePagination({currentPage, totalPages, itemsPerPage}: TablePaginationProps) {
  const commonClasses = "text-[13px] inline-block rounded-md border border-[color:--divider] m-w-8 px-2 py-1 text-center leading-[18px]"
  const pClasses = `${commonClasses} text-[color:--secondary]`
  const aClasses = `${commonClasses} text-[color:--primary] aria-disabled:text-neutral-400 aria-disabled:cursor-not-allowed`
  return (
    <div className={"flex flex-row items-center justify-end gap-2"}>
      <Link
        className={aClasses}
        href={getNewPageHref({
          itemsPerPage,
          newPage: 1
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
          newPage: currentPage +1
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
        })}
        aria-disabled={currentPage === totalPages}
      >
        Last
      </Link>
    </div>
  )
}

Table.Header = function TableHeader({title, subtitle, currentPage, totalPages, itemsPerPage}: TableHeaderProps) {
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

      <Table.Pagination currentPage={currentPage} totalPages={totalPages} itemsPerPage={itemsPerPage} />
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
            {columns.map((column, index) => (
              <TableHead
                key={column.field}
                className={`${index ? 'pl-2' : 'pl-4'} text-[13px] min-w-[100px] text-left whitespace-nowrap py-[10px] ${index === columns.length - 1 ? 'pr-4' : 'pr-2'}`}
              >
                {column.headerName}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column, index) => (
                <TableCell
                  key={column.field}
                  className={`h-[48px] min-w-[100px] py-[10px] ${index ? 'pl-2' : 'pl-4'} ${index === columns.length - 1 ? 'pr-4' : 'pr-2'}`}
                >
                  {column.renderCell ? column.renderCell(row) : (
                    <p className={"text-[14px] whitespace-nowrap"}>
                      {row[column.field]}
                    </p>
                  )}
                </TableCell>
              ))}
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
}

const validItemsPerPage = [25, 50, 75, 100]

Table.Footer = function TableFooter({currentPage, itemsPerPage, totalPages}: TableFooterProps) {
  const itemsPerPageOption = validItemsPerPage.includes(itemsPerPage) ? itemsPerPage : 25

  return (
    <div className={"flex flex-row p-4 w-full h-[74px] items-center justify-between border-t border-[color:--divider]"}>
      <div className={"flex flex-row items-center gap-2"}>
        <p className={"text-sm text-[color:--secondary] whitespace-nowrap"}>
          Show rows:
        </p>
        <SelectItemsPerRow value={itemsPerPageOption} currentPage={currentPage} options={validItemsPerPage as Array<number>} />
      </div>

      <Table.Pagination currentPage={currentPage} totalPages={totalPages} itemsPerPage={itemsPerPage} />
    </div>
  )
}
