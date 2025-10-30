import Link from 'next/link'
import React from 'react'
import SelectItemsPerRow from '@/app/components/SelectItemsPerRow'
import { CircleAlert } from 'lucide-react';
import BaseTable from '@/app/components/BaseTable'
import TableDownloadButton from '@/app/components/TableDownloadButton'
import clsx from 'clsx';

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
  filters?: Array<{
    label: string
    value: string
  }>
  activeFilter?: string
  csvEndpoint?: string
  entityFilters?: Record<string, string | string[]>
}

export default function Table({pagination, rows, columns, header, defaultMinWidth = 100, filters, activeFilter, csvEndpoint, entityFilters}: TableProps) {
  const paginationFilter = filters?.length ? filters.find((filter) => filter.value === activeFilter)?.value : undefined

  return (
    <div className={"w-full h-full flex flex-col rounded-lg border border-[color:--divider] bg-[color:--main-background] base-shadow"}>
      {filters && (
        <Table.Filters
          filters={filters}
          activeFilter={activeFilter}
          basePath={pagination.basePath}
          itemsPerPage={pagination.itemsPerPage}
          page={pagination.currentPage}
        />
      )}
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
        activeFilter={paginationFilter}
        csvEndpoint={csvEndpoint}
        entityFilters={entityFilters}
      />
      <BaseTable columns={columns} rows={rows} defaultMinWidth={defaultMinWidth} />
      {
        rows.length > 0 ? (
          <Table.Footer
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            itemsPerPage={pagination.itemsPerPage}
            basePath={pagination.basePath}
            activeFilter={paginationFilter}
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
  basePath,
  filter,
  resetPage = false,
}: {
  itemsPerPage: number,
  newPage: number,
  basePath: string,
  filter?: string,
  resetPage?: boolean,
}) => {

  let href = basePath

  if (itemsPerPage !== 25) {
    href += `${getSymbol(basePath)}ps=${itemsPerPage}`
  }

  if (filter) {
    href += `${getSymbol(href)}filter=${filter}`
  }

  if (resetPage) {
    return href
  }

  if (newPage !== 1) {
    href += `${getSymbol(href)}p=${newPage}`
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
  activeFilter?: string
  csvEndpoint?: string
  entityFilters?: Record<string, string | string[]>
}

type TablePaginationProps = {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  basePath: string
  activeFilter?: string
}

Table.Pagination = function TablePagination({currentPage, totalPages, itemsPerPage, basePath, activeFilter}: TablePaginationProps) {
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
          basePath,
          filter: activeFilter
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
          basePath,
          filter: activeFilter
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
          basePath,
          filter: activeFilter
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
          basePath,
          filter: activeFilter
        })}
        aria-disabled={currentPage === totalPages}
      >
        Last
      </Link>
    </div>
  )
}

Table.Header = function TableHeader({title, subtitle, hidePagination,currentPage, totalPages, itemsPerPage, activeFilter, basePath, rows, columns, csvEndpoint, entityFilters}: TableHeaderProps) {
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
        {rows.length > 0 && (
          <TableDownloadButton
            rows={rows}
            columns={columns.map((col) => ({...col, renderCell: undefined}))}
            csvEndpoint={csvEndpoint}
            activeFilter={activeFilter}
            entityFilters={entityFilters}
          />
        )}
        {!hidePagination && (
          <Table.Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            basePath={basePath}
            activeFilter={activeFilter}
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
  activeFilter?: string
}

const validItemsPerPage = [25, 50, 75, 100]

Table.Footer = function TableFooter({currentPage, itemsPerPage, totalPages, basePath, activeFilter}: TableFooterProps) {
  const itemsPerPageOption = validItemsPerPage.includes(itemsPerPage) ? itemsPerPage : 25

  return (
    <div className={"flex flex-row py-4 px-3 md:px-4 w-full min-h-[74px] items-center justify-between border-t border-[color:--divider] flex-wrap gap-3"}>
      <div className={"flex flex-row items-center gap-2"}>
        <p className={"xs:text-xs text-sm text-[color:--secondary] whitespace-nowrap"}>
          Show rows:
        </p>
        <SelectItemsPerRow
          value={itemsPerPageOption}
          basePath={basePath}
          currentPage={currentPage}
          options={validItemsPerPage as Array<number>}
          activeFilter={activeFilter}
        />
      </div>

      <Table.Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        basePath={basePath}
        activeFilter={activeFilter}
      />
    </div>
  )
}

interface TableFilterProps {
  activeFilter?: string
  filters: Array<{
    label: string
    value: string
  }>
  basePath: string
  page: number
  itemsPerPage: number
}

Table.Filters = function TableFilters({
  filters,
  basePath,
  page,
  itemsPerPage,
  activeFilter = 'all',
}: TableFilterProps) {
  const activeIsOneOfFilters = filters.some((filter) => filter.value === activeFilter)

  return (
    <div
      className={
        clsx(
          "flex flex-row gap-4 mt-4 -mb-2 md:-mb-3 pl-4 flex-wrap",
        )
      }
    >
      {[{label: 'All', value: 'all'},...filters].map(({label, value}) => {
        const isActive = activeIsOneOfFilters ? activeFilter === value : value === 'all'

        if (isActive) {
          return (
            <span
              key={value}
              className={`min-w-[60px] text-center text-xs px-[10px] font-semibold leading-[36px] cursor-not-allowed select-none rounded-lg transition-transform duration-300 bg-[color:--primary-background] text-white`}
            >
              {label}
            </span>
          )
        }

        return (
          <Link
            className={`min-w-[60px] text-center text-xs px-[10px] font-semibold aria-disabled:cursor-not-allowed leading-[36px] rounded-lg transition-transform duration-300 bg-[color:rgba(141,141,141,0.12)]`}
            href={
              getNewPageHref({
                itemsPerPage,
                newPage: page,
                basePath,
                filter: value,
                resetPage: true,
              })
            }
            scroll={false}
            key={value}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
