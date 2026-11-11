import clsx from 'clsx'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, SearchX } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { isTrueValue, toNumber, toTime } from '../../lib/csv'
import type { Column, Row } from '../../types'
import { Button } from '../ui/Button'

interface Props {
  columns: Column[]
  rows: Row[]
}

const PAGE_SIZES = [25, 50, 100, 250]

function compare(a: string, b: string, col: Column): number {
  const ea = a.trim() === ''
  const eb = b.trim() === ''
  if (ea || eb) return ea === eb ? 0 : ea ? 1 : -1 
  if (col.type === 'number') return toNumber(a) - toNumber(b)
  if (col.type === 'date') return toTime(a) - toTime(b)
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

function Cell({ value, column }: { value: string; column: Column }) {
  if (value.trim() === '') return <span className="text-ink-faint">—</span>
  if (column.type === 'boolean') {
    const yes = isTrueValue(value)
    return (
      <span
        className={clsx(
          'rounded-full px-2 py-0.5 text-xs font-medium',
          yes ? 'bg-brand-tint text-brand-dark' : 'bg-stone-200 text-ink-soft',
        )}
      >
        {value}
      </span>
    )
  }
  return <>{value}</>
}

export function DataTable({ columns, rows }: Props) {
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null)
  const [pageSize, setPageSize] = useState(50)
  const [page, setPage] = useState(0)

  useEffect(() => setPage(0), [rows])

  const sorted = useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.key === sort.key)
    if (!col) return rows
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((x, y) => {
      const a = x[sort.key] ?? ''
      const b = y[sort.key] ?? ''
      const blankA = a.trim() === ''
      const blankB = b.trim() === ''
      if (blankA || blankB) return blankA === blankB ? 0 : blankA ? 1 : -1
      return compare(a, b, col) * dir
    })
  }, [rows, sort, columns])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const current = Math.min(page, pageCount - 1)
  const start = current * pageSize
  const visible = sorted.slice(start, start + pageSize)

  const toggleSort = (key: string) =>
    setSort((s) => (!s || s.key !== key ? { key, dir: 'asc' } : s.dir === 'asc' ? { key, dir: 'desc' } : null))

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-line bg-card py-16 text-center">
        <SearchX size={36} className="text-ink-faint" strokeWidth={1.5} />
        <p className="mt-3 font-display text-lg font-semibold">No rows match these filters</p>
        <p className="text-sm text-ink-soft">Loosen a filter, switch it off, or remove it to see data again.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card">
      <div className="max-h-[68vh] overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-[#ece8dc]">
            <tr>
              <th className="border-b border-line px-3 py-2.5 text-right font-mono text-xs font-medium text-ink-faint">#</th>
              {columns.map((c) => {
                const active = sort?.key === c.key
                return (
                  <th
                    key={c.key}
                    aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    className="whitespace-nowrap border-b border-line px-3 py-2.5 text-left font-semibold"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(c.key)}
                      className={clsx(
                        'inline-flex items-center gap-1.5 hover:text-brand',
                        c.type === 'number' && 'flex-row-reverse',
                      )}
                    >
                      {c.key}
                      {active ? (
                        sort.dir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                      ) : (
                        <ArrowUpDown size={13} className="text-ink-faint" />
                      )}
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, i) => (
              <tr key={start + i} className="border-b border-line/70 last:border-0 odd:bg-white/60 hover:bg-brand-tint/60">
                <td className="px-3 py-2 text-right font-mono text-xs text-ink-faint">{start + i + 1}</td>
                {columns.map((c) => (
                  <td
                    key={c.key}
                    title={row[c.key]}
                    className={clsx(
                      'max-w-[22rem] truncate px-3 py-2',
                      c.type === 'number' && 'text-right font-mono tabular-nums',
                    )}
                  >
                    <Cell value={row[c.key] ?? ''} column={c} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-2.5 text-sm text-ink-soft">
        <span>
          Rows <span className="font-mono">{start + 1}–{start + visible.length}</span> of{' '}
          <span className="font-mono">{sorted.length.toLocaleString()}</span>
        </span>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            Rows per page
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setPage(0)
              }}
              className="h-8 w-20"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <Button variant="secondary" className="h-8 w-8 px-0" disabled={current === 0} onClick={() => setPage(current - 1)} aria-label="Previous page">
            <ChevronLeft size={16} />
          </Button>
          <span className="min-w-[5.5rem] text-center font-mono text-xs">
            {current + 1} / {pageCount}
          </span>
          <Button variant="secondary" className="h-8 w-8 px-0" disabled={current >= pageCount - 1} onClick={() => setPage(current + 1)} aria-label="Next page">
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}
