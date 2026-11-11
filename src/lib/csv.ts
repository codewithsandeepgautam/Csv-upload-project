import Papa from 'papaparse'
import type { Column, ColumnType, Dataset, Row } from '../types'

const MAX_OPTIONS = 40
const ISO_DATE = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?)?/
const NUMBER = /^-?\d+(\.\d+)?$/
const TRUE_VALUES = new Set(['true', 'yes', 'y'])
const FALSE_VALUES = new Set(['false', 'no', 'n'])

export const isTrueValue = (v: string) => TRUE_VALUES.has(v.trim().toLowerCase())
export const isFalseValue = (v: string) => FALSE_VALUES.has(v.trim().toLowerCase())

export function toNumber(v: string): number {
  const cleaned = v.trim().replace(/,/g, '')
  return NUMBER.test(cleaned) ? Number(cleaned) : NaN
}

export function toTime(v: string): number {
  const t = v.trim()
  return ISO_DATE.test(t) ? Date.parse(t) : NaN
}

function inferType(values: string[]): ColumnType {
  if (values.length === 0) return 'text'
  if (values.every((v) => isTrueValue(v) || isFalseValue(v))) return 'boolean'
  if (values.every((v) => !Number.isNaN(toNumber(v)))) return 'number'
  if (values.every((v) => !Number.isNaN(toTime(v)))) return 'date'
  return 'text'
}

function buildColumns(headers: string[], rows: Row[]): Column[] {
  return headers.map((key) => {
    const values: string[] = []
    const distinct = new Set<string>()
    for (const row of rows) {
      const v = (row[key] ?? '').trim()
      if (v !== '') {
        values.push(v)
        if (distinct.size <= MAX_OPTIONS) distinct.add(v)
      }
    }
    const type = inferType(values)
    const options =
      type === 'text' && distinct.size > 0 && distinct.size <= MAX_OPTIONS
        ? [...distinct].sort((a, b) => a.localeCompare(b))
        : []
    return { key, type, options }
  })
}

export function parseCsv(file: File): Promise<Dataset> {
  return new Promise((resolve, reject) => {
    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => h.trim(),
      complete: (result) => {
        const headers = (result.meta.fields ?? []).filter((h) => h !== '')
        if (headers.length === 0 || result.data.length === 0) {
          reject(new Error('This CSV looks empty. Make sure it has a header row and at least one data row.'))
          return
        }
        const rows = result.data.map((r) => {
          const clean: Row = {}
          for (const h of headers) clean[h] = r[h] == null ? '' : String(r[h])
          return clean
        })
        resolve({ fileName: file.name, columns: buildColumns(headers, rows), rows })
      },
      error: (err: Error) => reject(new Error(`Could not read the file: ${err.message}`)),
    })
  })
}

export function downloadCsv(columns: Column[], rows: Row[], fileName: string) {
  const csv = Papa.unparse({ fields: columns.map((c) => c.key), data: rows.map((r) => columns.map((c) => r[c.key])) })
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}
