import { cn } from '@/lib/utils'

interface ButtonGroupOption {
  value: string
  label: string
}

interface ButtonGroupProps {
  value: string
  onChange: (value: string) => void
  options: ButtonGroupOption[]
}

export function ButtonGroup({ value, onChange, options }: ButtonGroupProps) {
  return (
    <div className="inline-flex rounded-lg border p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200',
            value === option.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
