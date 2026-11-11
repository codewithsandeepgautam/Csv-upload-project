import clsx from 'clsx'
import { Copy, Eye, EyeOff, Trash2 } from 'lucide-react'
import { getOperators, isFilterReady, needsValue } from '../../lib/filters'
import type { Column, Filter } from '../../types'
import { Button } from '../ui/Button'
import { MultiSelect } from '../ui/MultiSelect'

interface Props {
  filter: Filter
  columns: Column[]
  index: number
  onChange: (patch: Partial<Filter>) => void
  onRemove: () => void
  onDuplicate: () => void
}

export function FilterRow({ filter, columns, index, onChange, onRemove, onDuplicate }: Props) {
  const column = columns.find((c) => c.key === filter.column) ?? columns[0]
  const operators = getOperators(column)
  const ready = isFilterReady(filter)
  const inputType = column.type === 'number' ? 'number' : column.type === 'date' ? 'date' : 'text'
  const listId = `opts-${filter.id}`

  const changeColumn = (key: string) => {
    const next = columns.find((c) => c.key === key)!
    onChange({ column: key, operator: getOperators(next)[0].value, value: '', value2: '', values: [] })
  }

  const changeOperator = (op: Filter['operator']) =>
    onChange({ operator: op, ...(op === 'in' ? { value: '' } : { values: [] }) })

  return (
    <div
      className={clsx(
        'flex flex-wrap items-center gap-2 rounded-lg border bg-white p-2.5 transition',
        filter.enabled ? 'border-line' : 'border-dashed border-line opacity-60',
      )}
    >
      <span className="w-5 text-center font-mono text-xs text-ink-faint">{index + 1}</span>

      <select value={filter.column} onChange={(e) => changeColumn(e.target.value)} className="w-44" aria-label="Column">
        {columns.map((c) => (
          <option key={c.key} value={c.key}>
            {c.key}
          </option>
        ))}
      </select>

      <select
        value={filter.operator}
        onChange={(e) => changeOperator(e.target.value as Filter['operator'])}
        className="w-36"
        aria-label="Operator"
      >
        {operators.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {needsValue(filter.operator) &&
        (filter.operator === 'in' ? (
          <MultiSelect options={column.options} value={filter.values} onChange={(values) => onChange({ values })} />
        ) : (
          <>
            <input
              type={inputType}
              value={filter.value}
              onChange={(e) => onChange({ value: e.target.value })}
              placeholder={filter.operator === 'between' ? 'From' : 'Value'}
              list={column.options.length ? listId : undefined}
              className="min-w-[9rem] flex-1"
              aria-label="Value"
            />
            {filter.operator === 'between' && (
              <>
                <span className="text-xs text-ink-faint">and</span>
                <input
                  type={inputType}
                  value={filter.value2}
                  onChange={(e) => onChange({ value2: e.target.value })}
                  placeholder="To"
                  className="min-w-[9rem] flex-1"
                  aria-label="Second value"
                />
              </>
            )}
            {column.options.length > 0 && (
              <datalist id={listId}>
                {column.options.map((o) => (
                  <option key={o} value={o} />
                ))}
              </datalist>
            )}
          </>
        ))}

      <div className="ml-auto flex items-center gap-1">
        {filter.enabled && !ready && <span className="mr-1 text-xs text-warn">Enter a value</span>}
        <Button
          variant="ghost"
          className="w-9 px-0"
          onClick={() => onChange({ enabled: !filter.enabled })}
          title={filter.enabled ? 'Turn off (keep it, but ignore it)' : 'Turn on'}
          aria-label={filter.enabled ? 'Disable filter' : 'Enable filter'}
        >
          {filter.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
        </Button>
        <Button variant="ghost" className="w-9 px-0" onClick={onDuplicate} title="Duplicate" aria-label="Duplicate filter">
          <Copy size={16} />
        </Button>
        <Button variant="danger" className="w-9 px-0" onClick={onRemove} title="Remove" aria-label="Remove filter">
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  )
}
