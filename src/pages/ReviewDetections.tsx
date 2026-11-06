import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText, MapPin, CheckCircle2,
  Pencil, XCircle, MessageSquarePlus, ListChecks, ShieldCheck, Lock, Table2,
  Image as ImageIcon, Type, Lightbulb,
} from 'lucide-react'
import { useDemo, pendingAlerts, allAlertsResolved } from '../store/DemoContext'
import { ProcessingHeader } from '../components/ProcessingHeader'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge, type Tone } from '../components/ui/Badge'
import { DetectionStatusBadge } from '../components/ui/StatusBadge'
import { Modal } from '../components/ui/Modal'
import { FieldWrap, TextInput, TextArea } from '../components/ui/Field'
import { DemoNote, EmptyState } from '../components/ui/Misc'
import { confianzaLabel } from '../lib/format'
import { cn } from '../lib/cn'
import type { Detection, DetectionOrigin, DetectionType } from '../types'
import { NotFound } from './NotFound'

type Tab = 'resumen' | 'requisitos' | 'normas' | 'detecciones'

const tabs: { id: Tab; label: string }[] = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'requisitos', label: 'Requisitos' },
  { id: 'normas', label: 'Normas' },
  { id: 'detecciones', label: 'Detecciones y alertas' },
]

const originIcon: Record<DetectionOrigin, typeof Type> = {
  Texto: Type,
  Tabla: Table2,
  'Imagen o plano': ImageIcon,
}

const typeTone: Record<DetectionType, Tone> = {
  'Posible pieza': 'info',
  'Cantidad no indicada': 'warning',
  'Posible referencia repetida': 'warning',
  'Posibles unidades adicionales': 'warning',
  'Ambigüedad técnica': 'warning',
  'Requisito especial': 'brand',
}

export function ReviewDetections() {
  const { projectId, pid } = useParams()
  const { project, getProcessing, setDetectionStatus, correctDetection, commentDetection, generateItemizado } = useDemo()
  const navigate = useNavigate()

  const processing = getProcessing(pid!)
  const [tab, setTab] = useState<Tab>('detecciones')
  const [viewerPage, setViewerPage] = useState(() => processing?.detecciones[0]?.pagina ?? 1)
  const [zoom, setZoom] = useState(100)
  const [correcting, setCorrecting] = useState<Detection | null>(null)
  const [commenting, setCommenting] = useState<Detection | null>(null)

  const pend = processing ? pendingAlerts(processing) : 0
  const resolved = processing ? allAlertsResolved(processing) : false

  if (!processing) return <NotFound />

  const goToPage = (n: number) => setViewerPage(n)

  const generar = () => {
    generateItemizado(processing.id)
    navigate(`/proyectos/${projectId}/procesamiento/${processing.id}/itemizado`)
  }

  return (
    <div className="space-y-5">
      <ProcessingHeader
        projectName={project.nombre}
        processing={processing}
        current="detecciones"
        actions={
          <Button
            variant="primary"
            icon={resolved ? <CheckCircle2 size={16} /> : <Lock size={16} />}
            disabled={!resolved}
            onClick={generar}
            title={resolved ? 'Generar itemizado' : 'Resolvé todas las alertas para habilitar'}
          >
            Generar itemizado
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        {pend > 0 ? (
          <Badge tone="warning">{pend} alerta(s) pendiente(s)</Badge>
        ) : (
          <Badge tone="success">Todas las alertas resueltas</Badge>
        )}
        <span className="text-xs text-ink-muted">
          El primer acceso al itemizado se bloquea hasta resolver todas las alertas del alcance
          incluido.
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        {/* Panel de resultados con pestañas */}
        <div className="min-w-0 space-y-4">
          <div className="flex items-center gap-1 overflow-x-auto scroll-thin border-b border-line">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'relative whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors',
                  tab === t.id ? 'text-brand-600' : 'text-ink-subtle hover:text-ink',
                )}
              >
                <span className="flex items-center gap-1.5">
                  {t.label}
                  {t.id === 'detecciones' && pend > 0 && (
                    <span className="rounded-full bg-warning-bg px-1.5 text-2xs font-bold text-warning-fg">
                      {pend}
                    </span>
                  )}
                </span>
                {tab === t.id && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-600" />
                )}
              </button>
            ))}
          </div>

          {tab === 'resumen' && <ResumenTab processing={processing} />}
          {tab === 'requisitos' && (
            <RequisitosTab detections={processing.detecciones} onGo={goToPage} />
          )}
          {tab === 'normas' && <NormasTab />}
          {tab === 'detecciones' && (
            <DeteccionesTab
              detections={processing.detecciones}
              onGo={goToPage}
              onConfirm={(id) => setDetectionStatus(processing.id, id, 'Confirmada')}
              onDiscard={(id) => setDetectionStatus(processing.id, id, 'Descartada')}
              onCorrect={(d) => setCorrecting(d)}
              onComment={(d) => setCommenting(d)}
            />
          )}
        </div>

        {/* Visor documental simulado */}
        <div className="xl:sticky xl:top-[4.5rem] xl:self-start">
          <DocumentViewer
            page={viewerPage}
            zoom={zoom}
            pdfName={processing.pdfNombre}
            onPrev={() => setViewerPage((p) => Math.max(1, p - 1))}
            onNext={() => setViewerPage((p) => p + 1)}
            onZoomIn={() => setZoom((z) => Math.min(160, z + 10))}
            onZoomOut={() => setZoom((z) => Math.max(60, z - 10))}
          />
        </div>
      </div>

      {/* Modal corregir */}
      <CorrectModal
        detection={correcting}
        onClose={() => setCorrecting(null)}
        onSave={(patch) => {
          if (correcting) correctDetection(processing.id, correcting.id, patch)
          setCorrecting(null)
        }}
      />

      {/* Modal comentar */}
      <CommentModal
        detection={commenting}
        onClose={() => setCommenting(null)}
        onSave={(text) => {
          if (commenting) commentDetection(processing.id, commenting.id, text)
          setCommenting(null)
        }}
      />
    </div>
  )
}

// --- Tabs -------------------------------------------------------------------

function ResumenTab({ processing }: { processing: ReturnType<typeof useDemo>['processings'][number] }) {
  const porTipo = useMemo(() => {
    const m = new Map<string, number>()
    processing.detecciones.forEach((d) => m.set(d.tipo, (m.get(d.tipo) ?? 0) + 1))
    return [...m.entries()]
  }, [processing.detecciones])

  const incluidas = processing.secciones.filter((s) => s.incluida)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Detecciones" value={processing.detecciones.length} />
        <Stat label="Pendientes" value={pendingAlerts(processing)} tone="warning" />
        <Stat
          label="Confirmadas"
          value={processing.detecciones.filter((d) => d.estado === 'Confirmada').length}
          tone="success"
        />
        <Stat
          label="Descartadas"
          value={processing.detecciones.filter((d) => d.estado === 'Descartada').length}
        />
      </div>

      <Card>
        <CardHeader title="Alcance incluido" />
        <CardBody className="space-y-2">
          {incluidas.map((s) => (
            <div key={s.id} className="flex items-center justify-between text-sm">
              <span className="text-ink">{s.titulo}</span>
              <span className="text-ink-muted tabular-nums">
                p. {s.paginaDesde}–{s.paginaHasta}
              </span>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Alertas por tipo" />
        <CardBody className="flex flex-wrap gap-2">
          {porTipo.map(([tipo, n]) => (
            <Badge key={tipo} tone="neutral">
              {tipo}: {n}
            </Badge>
          ))}
        </CardBody>
      </Card>

      <DemoNote>
        Pendiente de definir en reunión: alcance exacto de piezas, conjuntos, tareas y servicios. Las
        tareas y servicios no se muestran como piezas detectadas.
      </DemoNote>
    </div>
  )
}

function RequisitosTab({
  detections,
  onGo,
}: {
  detections: Detection[]
  onGo: (p: number) => void
}) {
  const reqs = detections.filter((d) => d.tipo === 'Requisito especial')
  return (
    <Card>
      <CardHeader title="Requisitos especiales detectados" icon={<ShieldCheck size={18} />} />
      <CardBody className="space-y-3">
        {reqs.length === 0 ? (
          <EmptyState title="Sin requisitos especiales en el alcance incluido" />
        ) : (
          reqs.map((r) => (
            <div key={r.id} className="rounded-md border border-line p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink">{r.descripcionPieza}</span>
                <Button variant="ghost" size="sm" icon={<MapPin size={13} />} onClick={() => onGo(r.pagina)}>
                  Ir a página {r.pagina}
                </Button>
              </div>
              <p className="mt-1 rounded bg-brand-50 px-2 py-1 text-xs italic text-brand-700">
                {r.fragmento}
              </p>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  )
}

function NormasTab() {
  const normas = [
    { codigo: 'AEA 90364', nombre: 'Instalaciones eléctricas en inmuebles', nota: 'Referencia general (demostración).' },
    { codigo: 'IEC 60529', nombre: 'Grados de protección IP de envolventes', nota: 'Vinculada al requisito IP65.' },
    { codigo: 'IRAM 2281', nombre: 'Puesta a tierra (serie)', nota: 'Referencia de contexto, no verificada.' },
  ]
  return (
    <Card>
      <CardHeader
        title="Normas referenciadas"
        description="Listado de contexto. No se afirma cumplimiento verificado."
      />
      <CardBody className="space-y-2">
        {normas.map((n) => (
          <div key={n.codigo} className="flex items-start justify-between gap-3 rounded-md border border-line px-3 py-2">
            <div>
              <div className="text-sm font-medium text-ink">{n.codigo}</div>
              <div className="text-xs text-ink-muted">{n.nombre}</div>
            </div>
            <Badge tone="neutral">{n.nota}</Badge>
          </div>
        ))}
      </CardBody>
    </Card>
  )
}

function DeteccionesTab({
  detections,
  onGo,
  onConfirm,
  onDiscard,
  onCorrect,
  onComment,
}: {
  detections: Detection[]
  onGo: (p: number) => void
  onConfirm: (id: string) => void
  onDiscard: (id: string) => void
  onCorrect: (d: Detection) => void
  onComment: (d: Detection) => void
}) {
  const [filter, setFilter] = useState<'todas' | 'pendientes'>('todas')
  const list = filter === 'pendientes' ? detections.filter((d) => d.estado === 'Pendiente') : detections

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          variant={filter === 'todas' ? 'primary' : 'default'}
          size="sm"
          onClick={() => setFilter('todas')}
        >
          Todas ({detections.length})
        </Button>
        <Button
          variant={filter === 'pendientes' ? 'primary' : 'default'}
          size="sm"
          onClick={() => setFilter('pendientes')}
        >
          Pendientes ({detections.filter((d) => d.estado === 'Pendiente').length})
        </Button>
      </div>

      <DemoNote>
        No se muestran coincidencias de catálogo en esta etapa. «Descartar» resuelve la alerta y no
        incorpora ni modifica ítems. Las cantidades no se suman automáticamente por apariciones
        repetidas.
      </DemoNote>

      {list.length === 0 ? (
        <EmptyState icon={<ListChecks size={26} />} title="No hay alertas para este filtro" />
      ) : (
        list.map((d) => (
          <DetectionCard
            key={d.id}
            d={d}
            onGo={onGo}
            onConfirm={onConfirm}
            onDiscard={onDiscard}
            onCorrect={onCorrect}
            onComment={onComment}
          />
        ))
      )}
    </div>
  )
}

function DetectionCard({
  d,
  onGo,
  onConfirm,
  onDiscard,
  onCorrect,
  onComment,
}: {
  d: Detection
  onGo: (p: number) => void
  onConfirm: (id: string) => void
  onDiscard: (id: string) => void
  onCorrect: (d: Detection) => void
  onComment: (d: Detection) => void
}) {
  const OIcon = originIcon[d.origen]
  const resolved = d.estado !== 'Pendiente'
  const esRepeticion = d.tipo === 'Posible referencia repetida'

  return (
    <Card className={cn(resolved && 'opacity-95')}>
      <CardBody className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-ink-muted">{d.id}</span>
          <Badge tone={typeTone[d.tipo]}>{d.tipo}</Badge>
          <Badge tone="neutral" icon={<OIcon size={11} />}>
            {d.origen}
          </Badge>
          <DetectionStatusBadge estado={d.estado} />
          <span className="ml-auto text-xs text-ink-muted">
            Confianza simulada: <strong>{confianzaLabel(d.confianza)}</strong> ({Math.round(d.confianza * 100)}%)
          </span>
        </div>

        <div className="text-xs text-ink-muted">
          {d.seccionTitulo} · página {d.pagina}
        </div>

        {/* Resaltado SOLO dentro de la tarjeta */}
        <blockquote className="rounded-md border-l-2 border-brand-300 bg-brand-50 px-3 py-2 text-xs italic text-brand-700">
          {d.fragmento}
        </blockquote>

        <div className="text-sm">
          <span className="text-ink-muted">Descripción sugerida: </span>
          <span className="font-medium text-ink">{d.descripcionPieza}</span>
          {d.cantidad != null && (
            <span className="text-ink-subtle">
              {' '}
              — {d.cantidad} {d.unidad}
            </span>
          )}
        </div>

        {esRepeticion && (
          <div className="rounded-md bg-surface-sunken px-3 py-2 text-xs text-ink-subtle">
            <Lightbulb size={13} className="mr-1 inline text-warning-fg" />
            Decisión a representar: ¿es una <strong>referencia repetida</strong> (misma pieza) o se
            trata de <strong>unidades adicionales</strong>? No se suma automáticamente.
          </div>
        )}

        {d.comentario && (
          <div className="rounded-md bg-surface-sunken px-3 py-2 text-xs text-ink-subtle">
            <span className="font-semibold">Comentario: </span>
            {d.comentario}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            variant="default"
            size="sm"
            icon={<CheckCircle2 size={14} />}
            onClick={() => onConfirm(d.id)}
            disabled={d.estado === 'Confirmada'}
          >
            Confirmar
          </Button>
          <Button variant="default" size="sm" icon={<Pencil size={14} />} onClick={() => onCorrect(d)}>
            Corregir
          </Button>
          <Button
            variant="default"
            size="sm"
            icon={<XCircle size={14} />}
            onClick={() => onDiscard(d.id)}
            disabled={d.estado === 'Descartada'}
          >
            Descartar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<MessageSquarePlus size={14} />}
            onClick={() => onComment(d)}
          >
            Comentario
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<MapPin size={14} />}
            onClick={() => onGo(d.pagina)}
            className="ml-auto"
          >
            Ir a página {d.pagina}
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}

// --- Visor ------------------------------------------------------------------

function DocumentViewer({
  page,
  zoom,
  pdfName,
  onPrev,
  onNext,
  onZoomIn,
  onZoomOut,
}: {
  page: number
  zoom: number
  pdfName: string
  onPrev: () => void
  onNext: () => void
  onZoomIn: () => void
  onZoomOut: () => void
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-line bg-surface-sunken px-3 py-2">
        <div className="flex items-center gap-1.5 text-xs text-ink-subtle">
          <FileText size={14} />
          <span className="max-w-[160px] truncate" title={pdfName}>
            {pdfName}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" icon={<ChevronLeft size={15} />} onClick={onPrev} />
          <span className="min-w-[72px] text-center text-xs tabular-nums text-ink-subtle">
            Página {page}
          </span>
          <Button variant="ghost" size="sm" icon={<ChevronRight size={15} />} onClick={onNext} />
          <span className="mx-1 h-4 w-px bg-line" />
          <Button variant="ghost" size="sm" icon={<ZoomOut size={15} />} onClick={onZoomOut} />
          <span className="min-w-[44px] text-center text-xs tabular-nums text-ink-subtle">{zoom}%</span>
          <Button variant="ghost" size="sm" icon={<ZoomIn size={15} />} onClick={onZoomIn} />
        </div>
      </div>

      <div className="max-h-[560px] overflow-auto scroll-thin bg-surface-sunken p-4">
        <div
          className="mx-auto bg-white shadow-raised"
          style={{ width: `${(zoom / 100) * 100}%`, maxWidth: 520 }}
        >
          <div className="border-b border-line px-6 py-3 text-2xs uppercase tracking-wide text-ink-disabled">
            Vista de demostración · contenido representativo · página {page}
          </div>
          <div className="space-y-3 px-6 py-5 text-[13px] leading-relaxed text-ink-subtle">
            <h4 className="text-sm font-semibold text-ink">
              Sección técnica (simulada) — página {page}
            </h4>
            <p>
              El presente apartado describe, a modo de demostración, las condiciones generales del
              equipamiento electromecánico y de los tableros asociados a la estación de bombeo.
            </p>
            <p className="rounded bg-surface-sunken px-2 py-1 text-xs text-ink-muted">
              Nota: esta es una vista de demostración. No se dibujan marcas ni resaltados sobre el
              PDF; el resaltado del fragmento aparece únicamente en la tarjeta de cada detección.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Provisión de aparamenta de protección y maniobra.</li>
              <li>Tendido de conductores y canalizaciones según diseño.</li>
              <li>Grado de protección de envolventes a la intemperie.</li>
            </ul>
            <p>
              Los valores, cantidades y referencias mostrados no corresponden a una extracción real
              del documento cargado.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}

// --- Modales ----------------------------------------------------------------

function Stat({ label, value, tone = 'neutral' }: { label: string; value: number; tone?: Tone }) {
  const color =
    tone === 'warning' ? 'text-warning-fg' : tone === 'success' ? 'text-success-fg' : 'text-ink'
  return (
    <Card>
      <CardBody className="py-3">
        <div className={cn('text-2xl font-semibold tabular-nums', color)}>{value}</div>
        <div className="text-xs text-ink-muted">{label}</div>
      </CardBody>
    </Card>
  )
}

function CorrectModal({
  detection,
  onClose,
  onSave,
}: {
  detection: Detection | null
  onClose: () => void
  onSave: (patch: Partial<Detection>) => void
}) {
  const [desc, setDesc] = useState('')
  const [cant, setCant] = useState('')
  const [unidad, setUnidad] = useState('')

  // sincroniza cuando cambia la detección
  useEffect(() => {
    if (detection) {
      setDesc(detection.descripcionPieza)
      setCant(detection.cantidad?.toString() ?? '')
      setUnidad(detection.unidad ?? '')
    }
  }, [detection])

  return (
    <Modal
      open={!!detection}
      onClose={onClose}
      title="Corregir detección"
      description="La corrección queda registrada en la trazabilidad visual."
      footer={
        <>
          <Button variant="default" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() =>
              onSave({
                descripcionPieza: desc,
                cantidad: cant === '' ? null : Number(cant),
                unidad: unidad || null,
              })
            }
          >
            Guardar corrección
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <FieldWrap label="Descripción sugerida de la pieza">
          <TextInput value={desc} onChange={(e) => setDesc(e.target.value)} />
        </FieldWrap>
        <div className="grid grid-cols-2 gap-3">
          <FieldWrap label="Cantidad" hint="Dejar vacío si no se indica">
            <TextInput type="number" value={cant} onChange={(e) => setCant(e.target.value)} />
          </FieldWrap>
          <FieldWrap label="Unidad">
            <TextInput value={unidad} onChange={(e) => setUnidad(e.target.value)} placeholder="UDS, MTS…" />
          </FieldWrap>
        </div>
      </div>
    </Modal>
  )
}

function CommentModal({
  detection,
  onClose,
  onSave,
}: {
  detection: Detection | null
  onClose: () => void
  onSave: (text: string) => void
}) {
  const [text, setText] = useState('')
  useEffect(() => {
    if (detection) setText(detection.comentario)
  }, [detection])

  return (
    <Modal
      open={!!detection}
      onClose={onClose}
      title="Agregar comentario"
      size="sm"
      footer={
        <>
          <Button variant="default" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => onSave(text)}>
            Guardar comentario
          </Button>
        </>
      }
    >
      <FieldWrap label="Comentario">
        <TextArea value={text} onChange={(e) => setText(e.target.value)} />
      </FieldWrap>
    </Modal>
  )
}
