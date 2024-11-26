import { Table as ShadTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CircleHelp } from 'lucide-react'
import React from 'react'
import { GridColDef } from '@/app/components/Table'

interface BaseTableProps {
  columns: Array<GridColDef>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: Array<any>
  defaultMinWidth?: number
}

export default function BaseTable({rows, columns, defaultMinWidth}: BaseTableProps) {
  return (
    <ShadTable>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => {

            return (
              <TableHead
                key={column.field}
                style={{
                  minWidth: column.minWidth || defaultMinWidth,
                  maxWidth: column.maxWidth,
                  width: column.width,
                }}
                className={`${index ? 'pl-2 md:pl-4' : 'pl-4'} text-xs md:text-[0.8125rem] text-left whitespace-nowrap py-[10px] ${index === columns.length - 1 ? 'pr-4' : 'pr-2 md:pr-4'}`}
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
                    minWidth: column.minWidth || defaultMinWidth,
                    maxWidth: column.maxWidth,
                    width: column.width,
                  }}
                  className={`h-[48px] py-[10px] ${index ? 'pl-2 md:pl-4' : 'pl-4'} ${index === columns.length - 1 ? 'pr-4' : 'pr-2 md:pr-4'}`}
                >
                  {column.renderCell ? column.renderCell(row) : (
                    <p className={"text-xs md:text-sm whitespace-nowrap overflow-hidden overflow-ellipsis"}>
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
