import { CheckCircle2, CircleDot, Pencil, XCircle, type LucideIcon } from 'lucide-react'
import { Badge, type Tone } from './Badge'
import type { DetectionStatus } from '../../types'

const detectionMap: Record<DetectionStatus, { tone: Tone; Icon: LucideIcon }> = {
  Pendiente: { tone: 'warning', Icon: CircleDot },
  Confirmada: { tone: 'success', Icon: CheckCircle2 },
  Corregida: { tone: 'info', Icon: Pencil },
  Descartada: { tone: 'neutral', Icon: XCircle },
}

export function DetectionStatusBadge({ estado }: { estado: DetectionStatus }) {
  const { tone, Icon } = detectionMap[estado]
  return (
    <Badge tone={tone} icon={<Icon size={12} />}>
      {estado}
    </Badge>
  )
}
