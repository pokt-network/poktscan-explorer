import { Table as ShadTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CircleHelp } from 'lucide-react'
import React from 'react'
import { GridColDef } from '@/app/components/Table'
import { Skeleton } from '@/components/ui/skeleton'
import { clsx } from 'clsx'

interface BaseTableProps {
  columns: Array<GridColDef>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: Array<any>
  defaultMinWidth?: number
  isLoading?: boolean
  skeletonRows?: number
}

function getAlignClass(column: GridColDef) {
  switch (column.align) {
    case 'left':
      return 'text-left'
    case 'center':
      return 'text-center'
    case 'right':
      return 'text-right'
    default:
      return 'text-left'
  }
}

function getSkeletonAlignClass(column: GridColDef) {
  switch (column.align) {
    case 'left':
      return 'left-3'
    case 'center':
      return 'ml-[calc(((100%-66%)/2)-16px)]'
    case 'right':
      return 'right-3'
    default:
      return 'left-3'
  }
}

export default function BaseTable({rows, columns, defaultMinWidth, isLoading, skeletonRows = 5}: BaseTableProps) {
  if (isLoading) {
    rows = Array.from({length: skeletonRows}).map((_, index) => ({
      id: index
    }))
  }
  return (
    <ShadTable
      className={'h-full'}
      containerClassName={
        clsx(
          'h-full grow',
          isLoading && 'overflow-hidden'
        )
      }
    >
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => {
            const align = getAlignClass(column)

            return (
              <TableHead
                key={column.field}
                style={{
                  minWidth: column.minWidth || defaultMinWidth,
                  maxWidth: column.maxWidth,
                  width: column.width,
                }}
                className={`${index ? 'pl-2 md:pl-4' : 'pl-4'} ${align} text-xs md:text-[0.8125rem] whitespace-nowrap py-[10px] ${index === columns.length - 1 ? 'pr-4' : 'pr-2 md:pr-4'}`}
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
              const align = getAlignClass(column)

              let children: React.ReactNode

              if (isLoading) {
                children = <Skeleton className={`w-4/6 h-[20px] absolute ${getSkeletonAlignClass(column)} top-[14px]`} />
              } else if (column.renderCell) {
                children = column.renderCell(row)
              } else {
                children = (
                  <p className={"text-xs md:text-sm whitespace-nowrap overflow-hidden overflow-ellipsis"}>
                    {row[column.field]}
                  </p>
                )
              }

              return (
                <TableCell
                  key={column.field}
                  style={{
                    minWidth: column.minWidth || defaultMinWidth,
                    maxWidth: column.maxWidth,
                    width: column.width,
                    ...(isLoading && {
                      position: 'relative'

                    })
                  }}
                  className={`h-[48px] py-[10px] ${align} ${index ? 'pl-2 md:pl-4' : 'pl-4'} ${index === columns.length - 1 ? 'pr-4' : 'pr-2 md:pr-4'}`}
                >
                  {children}
                </TableCell>
              )
            })}
          </TableRow>
        ))}
      </TableBody>
    </ShadTable>
  )
}
