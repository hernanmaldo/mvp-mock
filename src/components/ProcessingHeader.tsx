import { type ReactNode } from 'react'
import { Breadcrumbs, PageHeader } from './ui/Misc'
import { ProcessStepper } from './ProcessStepper'
import { Badge } from './ui/Badge'
import { STAGE_LABEL, type Processing, type Stage } from '../types'
import { fechaHora } from '../lib/format'

export function ProcessingHeader({
  projectName,
  processing,
  current,
  actions,
}: {
  projectName: string
  processing: Processing
  current: Stage
  actions?: ReactNode
}) {
  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: 'Proyectos', to: '/proyectos' },
          { label: projectName, to: `/proyectos/${processing.projectId}` },
          { label: `${processing.id} · ${STAGE_LABEL[current]}` },
        ]}
      />
      <PageHeader
        title={STAGE_LABEL[current]}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{processing.id}</Badge>
            <span className="text-ink-muted">{fechaHora(processing.fechaHora)}</span>
            <span className="text-ink-disabled">·</span>
            <span className="text-ink-muted">{processing.pdfNombre}</span>
          </span>
        }
        actions={actions}
      />
      <div className="rounded-lg border border-line bg-white px-4 py-3 shadow-card">
        <ProcessStepper processing={processing} current={current} />
      </div>
    </div>
  )
}
