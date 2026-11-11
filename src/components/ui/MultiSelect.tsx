import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface Props {
  options: string[]
  value: string[]
  onChange: (value: string[]) => void
}

export function MultiSelect({ options, value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const toggle = (opt: string) =>
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt])

  return (
    <div ref={ref} className="relative min-w-[11rem] flex-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-line bg-white px-2.5 text-left text-sm"
      >
        <span className={value.length ? 'truncate' : 'text-ink-faint'}>
          {value.length === 0 ? 'Select values…' : value.length <= 2 ? value.join(', ') : `${value.length} selected`}
        </span>
        <ChevronDown size={14} className="shrink-0 text-ink-faint" />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 max-h-60 w-full min-w-[12rem] overflow-auto rounded-md border border-line bg-white p-1 shadow-lg">
          {options.map((opt) => (
            <label key={opt} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-paper">
              <input type="checkbox" checked={value.includes(opt)} onChange={() => toggle(opt)} className="accent-[#14614a]" />
              <span className="truncate">{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
