import clsx from 'clsx'
import { ListFilter, Plus, X } from 'lucide-react'
import { createFilter, isFilterReady } from '../../lib/filters'
import type { Column, Filter, MatchMode } from '../../types'
import { Button } from '../ui/Button'
import { FilterRow } from './FilterRow'

interface Props {
  columns: Column[]
  filters: Filter[]
  mode: MatchMode
  onFiltersChange: (filters: Filter[]) => void
  onModeChange: (mode: MatchMode) => void
}

export function FilterPanel({ columns, filters, mode, onFiltersChange, onModeChange }: Props) {
  const activeCount = filters.filter(isFilterReady).length

  const update = (id: string, patch: Partial<Filter>) =>
    onFiltersChange(filters.map((f) => (f.id === id ? { ...f, ...patch } : f)))

  const duplicate = (id: string) => {
    const i = filters.findIndex((f) => f.id === id)
    const copy = { ...filters[i], id: crypto.randomUUID(), values: [...filters[i].values] }
    onFiltersChange([...filters.slice(0, i + 1), copy, ...filters.slice(i + 1)])
  }

  return (
    <section className="rounded-xl border border-line bg-card p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <ListFilter size={18} className="text-brand" />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-brand px-2 py-0.5 font-sans text-xs font-medium text-white">{activeCount} active</span>
          )}
        </h2>

        {filters.length > 1 && (
          <div className="flex items-center gap-2 text-sm text-ink-soft">
            Show rows matching
            <div className="inline-flex rounded-md border border-line bg-white p-0.5">
              {(['all', 'any'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onModeChange(m)}
                  className={clsx(
                    'rounded px-2.5 py-1 text-xs font-medium transition',
                    mode === m ? 'bg-brand text-white' : 'text-ink-soft hover:text-ink',
                  )}
                >
                  {m === 'all' ? 'ALL filters (AND)' : 'ANY filter (OR)'}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="ml-auto flex gap-2">
          {filters.length > 0 && (
            <Button variant="ghost" onClick={() => onFiltersChange([])}>
              <X size={15} /> Clear all
            </Button>
          )}
          <Button variant="primary" onClick={() => onFiltersChange([...filters, createFilter(columns[0])])}>
            <Plus size={16} /> Add filter
          </Button>
        </div>
      </div>

      {filters.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">
          No filters yet. Click <strong>Add filter</strong> to narrow the table down — you can stack as many as you like, even on the same column.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {filters.map((f, i) => (
            <FilterRow
              key={f.id}
              filter={f}
              index={i}
              columns={columns}
              onChange={(patch) => update(f.id, patch)}
              onRemove={() => onFiltersChange(filters.filter((x) => x.id !== f.id))}
              onDuplicate={() => duplicate(f.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
