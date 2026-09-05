import { LogIn, LogOut, XCircle, type LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type StatusStyle = {
  icon: LucideIcon
  badge: string
  iconColor: string
}

const STATUS_STYLES: Record<string, StatusStyle> = {
  ENTERED: {
    icon: LogIn,
    badge: 'border-blue-500 bg-blue-50 text-blue-600',
    iconColor: 'text-blue-600',
  },
  EXITED: {
    icon: LogOut,
    badge: 'border-emerald-500 bg-emerald-50 text-emerald-600',
    iconColor: 'text-emerald-600',
  },
  CANCELLED: {
    icon: XCircle,
    badge: 'border-red-500 bg-red-50 text-red-600',
    iconColor: 'text-red-600',
  },
}

const FALLBACK_STYLE: StatusStyle = {
  icon: XCircle,
  badge: 'border-border bg-muted text-muted-foreground',
  iconColor: 'text-muted-foreground',
}

interface StatusBadgeProps {
  status: string
  label: string
  className?: string
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const style = STATUS_STYLES[status.toUpperCase()] ?? FALLBACK_STYLE
  const Icon = style.icon

  return (
    <Badge
      variant='outline'
      className={cn(style.badge, 'font-medium', className)}
    >
      <Icon className={cn('size-3', style.iconColor)} />
      {label}
    </Badge>
  )
}
