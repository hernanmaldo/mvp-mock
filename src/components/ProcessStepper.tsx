import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { STAGE_ORDER, STAGE_LABEL, type Stage, type Processing } from '../types'
import { cn } from '../lib/cn'

const stageRoute: Record<Stage, string> = {
  rangos: 'nuevo',
  secciones: 'secciones',
  detecciones: 'detecciones',
  itemizado: 'itemizado',
  memoria: 'memoria',
}

export function ProcessStepper({
  processing,
  current,
}: {
  processing: Processing
  current: Stage
}) {
  const navigate = useNavigate()
  const reachedIdx = STAGE_ORDER.indexOf(processing.stage)
  const currentIdx = STAGE_ORDER.indexOf(current)
  // "rangos" ya no es navegable una vez creado el procesamiento
  const steps = STAGE_ORDER.filter((s) => s !== 'rangos')

  return (
    <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
      {steps.map((stage, i) => {
        const idx = STAGE_ORDER.indexOf(stage)
        const done = idx < currentIdx
        const isCurrent = stage === current
        const reachable = idx <= reachedIdx
        return (
          <li key={stage} className="flex items-center">
            <button
              disabled={!reachable || isCurrent}
              onClick={() =>
                navigate(
                  `/proyectos/${processing.projectId}/procesamiento/${processing.id}/${stageRoute[stage]}`,
                )
              }
              className={cn(
                'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                isCurrent && 'border-brand-600 bg-brand-50 text-brand-600',
                !isCurrent && done && 'border-success-border bg-success-bg text-success-fg hover:brightness-95',
                !isCurrent && !done && reachable && 'border-line bg-white text-ink-subtle hover:bg-surface-hover',
                !reachable && 'border-dashed border-line bg-white text-ink-disabled cursor-not-allowed',
              )}
            >
              <span
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold',
                  isCurrent && 'bg-brand-600 text-white',
                  done && 'bg-success-fg text-white',
                  !isCurrent && !done && 'bg-neutralTag-bg text-ink-muted',
                )}
              >
                {done ? <Check size={11} /> : i + 1}
              </span>
              {STAGE_LABEL[stage]}
            </button>
            {i < steps.length - 1 && (
              <span className="mx-0.5 h-px w-4 bg-line sm:w-6" aria-hidden />
            )}
          </li>
        )
      })}
    </ol>
  )
}
