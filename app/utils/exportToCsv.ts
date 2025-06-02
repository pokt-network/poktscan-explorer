import * as CSV from 'csv-string'
import { getCurrentDatetime } from '@/app/utils/format'

export const convertRowToString = <T extends object>(
  columns: Array<CsvColumn>,
  row: T,
  formatterFunction: (field: keyof T, row: T) => string
) => {
  let rowsDataString = ''
  const newObject = (columns).reduce((acc, { field }) => {
    acc[field] = formatterFunction(field, row)
    return acc
  }, {} as Record<keyof T, string>)

  rowsDataString += CSV.stringify(newObject)
  return rowsDataString
}

export interface CsvColumn {
  field: string
  headerName: string
}

export interface ClientExportOptions<T extends object> {
  columns: Array<CsvColumn>
  fileNameKey: string
  rows: Array<T>
  formatterFunction: (field: keyof T, row: T) => string
  useUtc: boolean
}

export const exportToCsvFromClient = <T extends object>({
  columns,
  fileNameKey,
  rows,
  formatterFunction,
  useUtc
}: ClientExportOptions<T>) => {
  let rowsDataString = ''

  rows.forEach(
    (item: T) => (rowsDataString += convertRowToString<T>(columns,item, formatterFunction))
  )

  const blob = new Blob([CSV.stringify(columns.map(item => item.headerName)) + rowsDataString], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.setAttribute(
    'download',
    `${fileNameKey}_${getCurrentDatetime(useUtc)}.csv`
  )
  link.click()
}
