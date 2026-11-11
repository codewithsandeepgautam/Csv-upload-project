export type Row = Record<string, string>

export type ColumnType = 'text' | 'number' | 'date' | 'boolean'

export interface Column {
  key: string
  type: ColumnType
  /** Distinct values, only filled for low-cardinality text columns (used for suggestions / "is one of"). */
  options: string[]
}

export type Operator =
  | 'contains'
  | 'notContains'
  | 'equals'
  | 'notEquals'
  | 'startsWith'
  | 'endsWith'
  | 'in'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'before'
  | 'after'
  | 'on'
  | 'isTrue'
  | 'isFalse'
  | 'isEmpty'
  | 'isNotEmpty'

export interface Filter {
  id: string
  column: string
  operator: Operator
  value: string
  value2: string
  values: string[]
  enabled: boolean
}

export type MatchMode = 'all' | 'any'

export interface Dataset {
  fileName: string
  columns: Column[]
  rows: Row[]
}
