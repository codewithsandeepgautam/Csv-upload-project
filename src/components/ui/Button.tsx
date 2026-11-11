import clsx from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const styles: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  secondary: 'border border-line bg-white text-ink hover:bg-paper',
  ghost: 'text-ink-soft hover:bg-paper hover:text-ink',
  danger: 'text-ink-soft hover:bg-red-50 hover:text-red-700',
}

export function Button({ variant = 'secondary', className, type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        styles[variant],
        className,
      )}
      {...rest}
    />
  )
}
