import type { Column, Filter, MatchMode, Operator, Row } from '../types'
import { isFalseValue, isTrueValue, toNumber, toTime } from './csv'

interface OperatorDef {
  value: Operator
  label: string
}

export function getOperators(column: Column): OperatorDef[] {
  switch (column.type) {
    case 'number':
      return [
        { value: 'equals', label: '=' },
        { value: 'notEquals', label: '≠' },
        { value: 'gt', label: '>' },
        { value: 'gte', label: '≥' },
        { value: 'lt', label: '<' },
        { value: 'lte', label: '≤' },
        { value: 'between', label: 'between' },
        { value: 'isEmpty', label: 'is empty' },
        { value: 'isNotEmpty', label: 'is not empty' },
      ]
    case 'date':
      return [
        { value: 'on', label: 'on' },
        { value: 'before', label: 'before' },
        { value: 'after', label: 'after' },
        { value: 'between', label: 'between' },
        { value: 'isEmpty', label: 'is empty' },
        { value: 'isNotEmpty', label: 'is not empty' },
      ]
    case 'boolean':
      return [
        { value: 'isTrue', label: 'is true' },
        { value: 'isFalse', label: 'is false' },
        { value: 'isEmpty', label: 'is empty' },
        { value: 'isNotEmpty', label: 'is not empty' },
      ]
    default:
      return [
        { value: 'contains', label: 'contains' },
        { value: 'notContains', label: 'does not contain' },
        { value: 'equals', label: 'equals' },
        { value: 'notEquals', label: 'does not equal' },
        { value: 'startsWith', label: 'starts with' },
        { value: 'endsWith', label: 'ends with' },
        ...(column.options.length > 0 ? [{ value: 'in' as Operator, label: 'is one of' }] : []),
        { value: 'isEmpty', label: 'is empty' },
        { value: 'isNotEmpty', label: 'is not empty' },
      ]
  }
}

const NO_VALUE_OPS: Operator[] = ['isTrue', 'isFalse', 'isEmpty', 'isNotEmpty']
export const needsValue = (op: Operator) => !NO_VALUE_OPS.includes(op)

export function isFilterReady(f: Filter): boolean {
  if (!f.enabled) return false
  if (!needsValue(f.operator)) return true
  if (f.operator === 'in') return f.values.length > 0
  if (f.operator === 'between') return f.value.trim() !== '' && f.value2.trim() !== ''
  return f.value.trim() !== ''
}

export function createFilter(column: Column): Filter {
  return {
    id: crypto.randomUUID(),
    column: column.key,
    operator: getOperators(column)[0].value,
    value: '',
    value2: '',
    values: [],
    enabled: true,
  }
}

function matchesFilter(row: Row, f: Filter, column: Column): boolean {
  const raw = (row[f.column] ?? '').trim()
  const op = f.operator

  if (op === 'isEmpty') return raw === ''
  if (op === 'isNotEmpty') return raw !== ''
  if (op === 'isTrue') return isTrueValue(raw)
  if (op === 'isFalse') return isFalseValue(raw)

  if (column.type === 'number') {
    const n = toNumber(raw)
    if (Number.isNaN(n)) return false
    const a = toNumber(f.value)
    const b = toNumber(f.value2)
    switch (op) {
      case 'equals': return n === a
      case 'notEquals': return n !== a
      case 'gt': return n > a
      case 'gte': return n >= a
      case 'lt': return n < a
      case 'lte': return n <= a
      case 'between': return n >= Math.min(a, b) && n <= Math.max(a, b)
    }
    return false
  }

  if (column.type === 'date') {
    const t = toTime(raw)
    if (Number.isNaN(t)) return false
    const a = toTime(f.value)
    const b = toTime(f.value2)
    const day = 86_400_000
    switch (op) {
      case 'on': return t >= a && t < a + day
      case 'before': return t < a
      case 'after': return t >= a + day
      case 'between': return t >= Math.min(a, b) && t < Math.max(a, b) + day
    }
    return false
  }

  const text = raw.toLowerCase()
  const q = f.value.trim().toLowerCase()
  switch (op) {
    case 'contains': return text.includes(q)
    case 'notContains': return !text.includes(q)
    case 'equals': return text === q
    case 'notEquals': return text !== q
    case 'startsWith': return text.startsWith(q)
    case 'endsWith': return text.endsWith(q)
    case 'in': return f.values.some((v) => v.toLowerCase() === text)
  }
  return false
}

export function applyFilters(rows: Row[], filters: Filter[], columns: Column[], mode: MatchMode): Row[] {
  const ready = filters.filter(isFilterReady)
  if (ready.length === 0) return rows
  const byKey = new Map(columns.map((c) => [c.key, c]))
  const active = ready.flatMap((f) => {
    const col = byKey.get(f.column)
    return col ? [{ f, col }] : []
  })
  return rows.filter((row) =>
    mode === 'all'
      ? active.every(({ f, col }) => matchesFilter(row, f, col))
      : active.some(({ f, col }) => matchesFilter(row, f, col)),
  )
}

export function applySearch(rows: Row[], columns: Column[], term: string): Row[] {
  const q = term.trim().toLowerCase()
  if (!q) return rows
  return rows.filter((row) => columns.some((c) => (row[c.key] ?? '').toLowerCase().includes(q)))
}
