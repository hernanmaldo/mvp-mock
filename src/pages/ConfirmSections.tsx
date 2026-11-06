import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2, CheckCircle2, ArrowRight, Layers } from 'lucide-react'
import { useDemo } from '../store/DemoContext'
import { ProcessingHeader } from '../components/ProcessingHeader'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Checkbox } from '../components/ui/Field'
import { DemoNote } from '../components/ui/Misc'
import { NotFound } from './NotFound'

export function ConfirmSections() {
  const { projectId, pid } = useParams()
  const { project, getProcessing, toggleSection, confirmSections } = useDemo()
  const navigate = useNavigate()
  const [analyzing, setAnalyzing] = useState(false)

  const processing = getProcessing(pid!)
  if (!processing) return <NotFound />

  const incluidas = processing.secciones.filter((s) => s.incluida)
  const canContinue = incluidas.length > 0

  const confirmar = () => {
    if (!canContinue) return
    setAnalyzing(true)
    confirmSections(processing.id)
    window.setTimeout(() => {
      navigate(`/proyectos/${projectId}/procesamiento/${processing.id}/detecciones`)
    }, 1300)
  }

  return (
    <div className="space-y-5">
      <ProcessingHeader projectName={project.nombre} processing={processing} current="secciones" />

      <DemoNote>
        Primera revisión, antes de las detecciones de piezas. Las secciones excluidas no aportan
        alertas ni ítems al escenario mostrado. Las referencias de página son simuladas y no
        verificadas.
      </DemoNote>

      <Card>
        <CardHeader
          title="Secciones identificadas dentro del alcance seleccionado"
          description="Incluí o excluí cada sección. Se exige al menos una sección incluida."
          icon={<Layers size={18} />}
        />
        <CardBody className="space-y-2.5">
          {processing.secciones.map((sec) => (
            <div
              key={sec.id}
              className="flex items-start justify-between gap-4 rounded-md border border-line px-3 py-3 hover:bg-surface-hover"
            >
              <Checkbox
                checked={sec.incluida}
                onChange={() => toggleSection(processing.id, sec.id)}
                label={
                  <span className="flex items-center gap-2">
                    {sec.titulo}
                    {sec.simulada && <Badge tone="warning">Página simulada</Badge>}
                  </span>
                }
                description={sec.descripcion}
              />
              <div className="shrink-0 text-right">
                <div className="text-2xs font-semibold uppercase tracking-wide text-ink-muted">
                  Páginas
                </div>
                <div className="text-sm tabular-nums text-ink-subtle">
                  {sec.paginaDesde}–{sec.paginaHasta}
                </div>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Resumen del alcance confirmado" />
        <CardBody>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge tone={canContinue ? 'success' : 'warning'}>
              {incluidas.length} de {processing.secciones.length} secciones incluidas
            </Badge>
            {incluidas.length > 0 ? (
              <span className="text-ink-subtle">
                {incluidas.map((s) => s.titulo.split(' ').slice(0, 3).join(' ')).join(' · ')}
              </span>
            ) : (
              <span className="text-ink-muted">Incluí al menos una sección para continuar.</span>
            )}
          </div>
          <p className="mt-3 text-xs text-ink-muted">
            Se usan ejemplos de equipamiento electromecánico, energía y automatismo como contexto del
            pliego. No se mostrarán resultados correspondientes a páginas fuera del alcance.
          </p>
        </CardBody>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button variant="default" onClick={() => navigate(`/proyectos/${project.id}`)}>
          Volver al proyecto
        </Button>
        <Button
          variant="primary"
          icon={analyzing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
          iconRight={!analyzing ? <ArrowRight size={14} /> : undefined}
          disabled={!canContinue || analyzing}
          onClick={confirmar}
        >
          {analyzing ? 'Analizando…' : 'Confirmar secciones y analizar'}
        </Button>
      </div>

      {analyzing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/30 backdrop-blur-[1px]">
          <div className="flex items-center gap-3 rounded-lg border border-line bg-white px-5 py-4 shadow-overlay">
            <Loader2 size={20} className="animate-spin text-brand-600" />
            <div>
              <div className="text-sm font-medium text-ink">Análisis simulado en curso</div>
              <div className="text-xs text-ink-muted">Preparando detecciones de demostración…</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
