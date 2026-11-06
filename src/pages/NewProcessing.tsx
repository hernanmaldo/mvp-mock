import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Upload, FileText, Plus, Trash2, ScanSearch, Sparkles } from 'lucide-react'
import { useDemo } from '../store/DemoContext'
import { Breadcrumbs, PageHeader, DemoNote } from '../components/ui/Misc'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { FieldWrap, TextInput } from '../components/ui/Field'
import { DEMO_PLIEGO } from '../data/fixtures'
import type { PageRange } from '../types'

interface DraftRange {
  id: string
  desde: string
  hasta: string
}

let draftSeq = 0
const newDraft = (): DraftRange => ({ id: `d-${++draftSeq}`, desde: '', hasta: '' })

export function NewProcessing() {
  const { projectId } = useParams()
  const { project, createProcessing, notify } = useDemo()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const [pdfName, setPdfName] = useState('')
  const [usandoDemo, setUsandoDemo] = useState(false)
  const [ranges, setRanges] = useState<DraftRange[]>([newDraft()])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setPdfName(f.name)
      setUsandoDemo(false)
      notify('Archivo seleccionado (no se procesa su contenido).', 'info')
    }
  }

  const useDemoPliego = () => {
    setPdfName(DEMO_PLIEGO)
    setUsandoDemo(true)
  }

  const updateRange = (id: string, field: 'desde' | 'hasta', value: string) => {
    setRanges((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  const addRange = () => setRanges((rs) => [...rs, newDraft()])
  const removeRange = (id: string) =>
    setRanges((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== id) : rs))

  const validate = (): PageRange[] | null => {
    const errs: Record<string, string> = {}
    if (!pdfName) errs.pdf = 'Seleccioná un PDF o usá el pliego de demostración.'

    const parsed: PageRange[] = []
    ranges.forEach((r, i) => {
      const d = Number(r.desde)
      const h = Number(r.hasta)
      if (r.desde === '' || r.hasta === '') {
        errs[r.id] = 'Completá ambas páginas del rango.'
      } else if (!Number.isInteger(d) || !Number.isInteger(h) || d <= 0 || h <= 0) {
        errs[r.id] = 'Las páginas deben ser números positivos.'
      } else if (d > h) {
        errs[r.id] = 'La página inicial debe ser menor o igual a la final.'
      } else {
        parsed.push({ id: `R-${i + 1}`, desde: d, hasta: h })
      }
    })

    setErrors(errs)
    return Object.keys(errs).length === 0 ? parsed : null
  }

  const identificar = () => {
    const parsed = validate()
    if (!parsed) return
    const pid = createProcessing({
      pdfNombre: pdfName,
      rangos: parsed,
      numeracionImpresaDisponible: usandoDemo,
    })
    navigate(`/proyectos/${projectId}/procesamiento/${pid}/secciones`)
  }

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: 'Proyectos', to: '/proyectos' },
          { label: project.nombre, to: `/proyectos/${project.id}` },
          { label: 'Nuevo procesamiento' },
        ]}
      />
      <PageHeader
        title="Nuevo procesamiento"
        subtitle="Un único PDF por proyecto. Los rangos usan la posición de página del PDF."
      />

      <DemoNote>
        Los resultados son fixtures de demostración, no una extracción real. No se procesan ni se
        muestran como analizadas páginas fuera de los rangos indicados.
      </DemoNote>

      <Card>
        <CardHeader title="Documento de entrada" description="Seleccioná el pliego a leer." />
        <CardBody className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={onPickFile} />
            <Button
              variant="default"
              icon={<Upload size={15} />}
              onClick={() => fileRef.current?.click()}
            >
              Seleccionar PDF
            </Button>
            <Button variant="subtle" icon={<Sparkles size={15} />} onClick={useDemoPliego}>
              Usar pliego de demostración
            </Button>
          </div>

          {pdfName ? (
            <div className="flex items-center gap-2.5 rounded-md border border-line bg-surface-sunken px-3 py-2">
              <FileText size={18} className="text-ink-muted" />
              <span className="min-w-0 flex-1 truncate text-sm text-ink" title={pdfName}>
                {pdfName}
              </span>
              {usandoDemo && <Badge tone="brand">Demostración</Badge>}
            </div>
          ) : (
            <p className="text-xs text-ink-muted">Todavía no se seleccionó un documento.</p>
          )}
          {errors.pdf && <p className="text-xs text-danger-fg">{errors.pdf}</p>}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Rangos de páginas"
          description="Indicá uno o más rangos (página desde / hasta) sobre la posición del PDF."
          actions={
            <Button variant="default" size="sm" icon={<Plus size={14} />} onClick={addRange}>
              Agregar rango
            </Button>
          }
        />
        <CardBody className="space-y-3">
          {ranges.map((r, i) => (
            <div key={r.id} className="rounded-md border border-line p-3">
              <div className="flex flex-wrap items-end gap-3">
                <div className="text-xs font-semibold text-ink-muted">Rango {i + 1}</div>
                <FieldWrap label="Página desde" htmlFor={`${r.id}-desde`}>
                  <TextInput
                    id={`${r.id}-desde`}
                    type="number"
                    min={1}
                    className="w-28"
                    value={r.desde}
                    onChange={(e) => updateRange(r.id, 'desde', e.target.value)}
                  />
                </FieldWrap>
                <FieldWrap label="Página hasta" htmlFor={`${r.id}-hasta`}>
                  <TextInput
                    id={`${r.id}-hasta`}
                    type="number"
                    min={1}
                    className="w-28"
                    value={r.hasta}
                    onChange={(e) => updateRange(r.id, 'hasta', e.target.value)}
                  />
                </FieldWrap>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 size={14} />}
                  onClick={() => removeRange(r.id)}
                  disabled={ranges.length === 1}
                >
                  Quitar
                </Button>
              </div>
              {errors[r.id] && <p className="mt-2 text-xs text-danger-fg">{errors[r.id]}</p>}
            </div>
          ))}

          <div className="rounded-md bg-surface-sunken px-3 py-2 text-xs text-ink-subtle">
            <span className="font-semibold">Resumen de rangos: </span>
            {ranges.filter((r) => r.desde && r.hasta).length === 0
              ? 'sin rangos válidos todavía'
              : ranges
                  .filter((r) => r.desde && r.hasta)
                  .map((r) => `${r.desde}–${r.hasta}`)
                  .join(', ')}
          </div>

          <p className="text-xs text-ink-muted">
            La numeración impresa se muestra por separado solo cuando está disponible. No se inventa
            una correspondencia entre numeración impresa y posición real.
          </p>
        </CardBody>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="default" onClick={() => navigate(`/proyectos/${project.id}`)}>
          Cancelar
        </Button>
        <Button variant="primary" icon={<ScanSearch size={16} />} onClick={identificar}>
          Identificar secciones
        </Button>
      </div>
    </div>
  )
}
