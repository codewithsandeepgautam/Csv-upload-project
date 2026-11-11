import clsx from 'clsx'
import { FileSpreadsheet, Loader2, UploadCloud } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from './ui/Button'

interface Props {
  onFile: (file: File) => void
  onSample: () => void
  loading: boolean
  error: string | null
}

export function FileUpload({ onFile, onSample, loading, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handle = (file?: File | null) => {
    if (file) onFile(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handle(e.dataTransfer.files?.[0])
        }}
        className={clsx(
          'flex flex-col items-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition',
          dragging ? 'border-brand bg-brand-tint' : 'border-line bg-card',
        )}
      >
        {loading ? (
          <Loader2 className="animate-spin text-brand" size={40} />
        ) : (
          <UploadCloud className="text-brand" size={40} strokeWidth={1.5} />
        )}
        <h2 className="mt-4 font-display text-2xl font-semibold">{loading ? 'Reading your file…' : 'Drop a CSV file here'}</h2>
        <p className="mt-1 text-sm text-ink-soft">or pick one from your computer. Everything stays in your browser — nothing is uploaded anywhere.</p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button variant="primary" disabled={loading} onClick={() => inputRef.current?.click()}>
            <FileSpreadsheet size={16} /> Choose CSV file
          </Button>
          <Button disabled={loading} onClick={onSample}>
            Try the sample data
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => handle(e.target.files?.[0])}
        />
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
    </div>
  )
}
