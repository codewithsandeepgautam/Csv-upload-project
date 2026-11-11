import { Download, RefreshCw, Search, Table2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { FileUpload } from './components/FileUpload'
import { FilterPanel } from './components/filters/FilterPanel'
import { DataTable } from './components/table/DataTable'
import { Button } from './components/ui/Button'
import { downloadCsv, parseCsv } from './lib/csv'
import { applyFilters, applySearch } from './lib/filters'
import type { Dataset, Filter, MatchMode } from './types'

export default function App() {
  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [filters, setFilters] = useState<Filter[]>([])
  const [mode, setMode] = useState<MatchMode>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (file: File) => {
    setError(null)
    if (!/\.csv$/i.test(file.name) && !file.type.includes('csv')) {
      setError('Please choose a .csv file.')
      return
    }
    setLoading(true)
    try {
      const data = await parseCsv(file)
      setDataset(data)
      setFilters([])
      setSearch('')
      setMode('all')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong while reading the file.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadSample = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}sample-shampoo.csv`)
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      await load(new File([blob], 'sample-shampoo.csv', { type: 'text/csv' }))
    } catch {
      setError('Could not load the sample file.')
    }
  }, [load])

  const filtered = useMemo(() => {
    if (!dataset) return []
    return applySearch(applyFilters(dataset.rows, filters, dataset.columns, mode), dataset.columns, search)
  }, [dataset, filters, mode, search])

  const reset = () => {
    setDataset(null)
    setFilters([])
    setSearch('')
    setError(null)
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
            <Table2 size={20} />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold leading-tight">CSV Explorer</h1>
            <p className="text-xs text-ink-soft">Upload a CSV, view it as a table, and slice it with as many filters as you need.</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] space-y-4 px-5 py-6">
        {!dataset ? (
          <div className="pt-8">
            <FileUpload onFile={load} onSample={loadSample} loading={loading} error={error} />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <p className="font-display text-lg font-semibold">{dataset.fileName}</p>
                <p className="text-sm text-ink-soft">
                  <span className="font-mono">{dataset.rows.length.toLocaleString()}</span> rows ·{' '}
                  <span className="font-mono">{dataset.columns.length}</span> columns
                  {filtered.length !== dataset.rows.length && (
                    <>
                      {' '}· showing <span className="font-mono font-medium text-brand">{filtered.length.toLocaleString()}</span> after filtering
                    </>
                  )}
                </p>
              </div>
              <div className="relative ml-auto">
                <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search all columns…"
                  className="w-64 pl-8"
                />
              </div>
              <Button disabled={filtered.length === 0} onClick={() => downloadCsv(dataset.columns, filtered, 'filtered-data.csv')}>
                <Download size={15} /> Export filtered
              </Button>
              <Button onClick={reset}>
                <RefreshCw size={15} /> Upload another file
              </Button>
            </div>

            <FilterPanel
              columns={dataset.columns}
              filters={filters}
              mode={mode}
              onFiltersChange={setFilters}
              onModeChange={setMode}
            />

            <DataTable columns={dataset.columns} rows={filtered} />
          </>
        )}
      </main>
    </div>
  )
}
