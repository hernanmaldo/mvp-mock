import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Plus, Pencil, Trash2, ArrowLeftRight, MessageSquarePlus, Search, Upload, Download,
  ChevronDown, ChevronRight, Undo2, RotateCcw, Lock, ArrowRight, History,
} from 'lucide-react'
import { useDemo } from '../store/DemoContext'
import { ProcessingHeader } from '../components/ProcessingHeader'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge, type Tone } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { FieldWrap, TextInput, TextArea, Select } from '../components/ui/Field'
import { DemoNote, EmptyState } from '../components/ui/Misc'
import { Table, TableScroll, Td, Th, Tr } from '../components/ui/Table'
import { num2, fechaHora } from '../lib/format'
import { cn } from '../lib/cn'
import {
  INTERVENCIONES, manoObraGroups, potenciaRows, descripcionesAux,
} from '../data/fixtures'
import type { MaterialItem, ItemizadoVersion } from '../types'
import { NotFound } from './NotFound'

type Tab = 'materiales' | 'mo' | 'potencia' | 'descripciones' | 'historial'

const tabs: { id: Tab; label: string }[] = [
  { id: 'materiales', label: 'Materiales' },
  { id: 'mo', label: 'M.O y resumen' },
  { id: 'potencia', label: 'Potencia' },
  { id: 'descripciones', label: 'Descripciones auxiliares' },
  { id: 'historial', label: 'Historial' },
]

const versionMeta: Record<ItemizadoVersion, { tone: Tone; label: string }> = {
  inicial: { tone: 'success', label: 'Estado base (inicial)' },
  modificado: { tone: 'info', label: 'Con modificaciones manuales' },
  importado: { tone: 'warning', label: 'Escenario importado' },
}

export function Itemizado() {
  const { projectId, pid } = useParams()
  const demo = useDemo()
  const { project, getProcessing } = demo
  const navigate = useNavigate()

  const processing = getProcessing(pid!)
  const [tab, setTab] = useState<Tab>('materiales')

  if (!processing) return <NotFound />

  if (!processing.itemizadoGenerado) {
    return (
      <div className="space-y-5">
        <ProcessingHeader projectName={project.nombre} processing={processing} current="itemizado" />
        <EmptyState
          icon={<Lock size={28} />}
          title="El itemizado aún no fue generado"
          description="Se genera por primera vez después de resolver todas las alertas de las detecciones."
          action={
            <Button
              variant="primary"
              iconRight={<ArrowRight size={15} />}
              onClick={() =>
                navigate(`/proyectos/${projectId}/procesamiento/${processing.id}/detecciones`)
              }
            >
              Ir a revisión de detecciones
            </Button>
          }
        />
      </div>
    )
  }

  const vmeta = versionMeta[processing.itemizadoVersion]

  return (
    <div className="space-y-5">
      <ProcessingHeader
        projectName={project.nombre}
        processing={processing}
        current="itemizado"
        actions={
          <Button
            variant="primary"
            iconRight={<ArrowRight size={14} />}
            onClick={() => navigate(`/proyectos/${projectId}/procesamiento/${processing.id}/memoria`)}
          >
            Continuar a memoria
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={vmeta.tone}>{vmeta.label}</Badge>
        <span className="text-xs text-ink-muted">
          La edición del itemizado no modifica detecciones ni alertas.
        </span>
      </div>

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
            {t.label}
            {tab === t.id && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-600" />
            )}
          </button>
        ))}
      </div>

      {tab === 'materiales' && <MaterialesTab pid={processing.id} />}
      {tab === 'mo' && <ManoObraTab />}
      {tab === 'potencia' && <PotenciaTab />}
      {tab === 'descripciones' && <DescripcionesTab />}
      {tab === 'historial' && <HistorialTab pid={processing.id} />}
    </div>
  )
}

// --- Materiales -------------------------------------------------------------

function MaterialesTab({ pid }: { pid: string }) {
  const { getProcessing, deleteMaterial, exportItemizado, importItemizado } = useDemo()
  const navigate = useNavigate()
  const { projectId } = useParams()
  const processing = getProcessing(pid)!
  const materiales = processing.materiales

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [editing, setEditing] = useState<MaterialItem | 'new' | null>(null)
  const [moving, setMoving] = useState<MaterialItem | null>(null)
  const [observing, setObserving] = useState<MaterialItem | null>(null)
  const [origin, setOrigin] = useState<MaterialItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)

  const toggle = (cod: string) => setCollapsed((c) => ({ ...c, [cod]: !c[cod] }))
  const total = materiales.reduce((s, m) => s + m.importe, 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setEditing('new')}>
            Agregar ítem
          </Button>
          <Button variant="default" size="sm" icon={<Upload size={14} />} onClick={() => setImportOpen(true)}>
            Importar Excel
          </Button>
          <Button variant="default" size="sm" icon={<Download size={14} />} onClick={() => exportItemizado(pid)}>
            Exportar Excel
          </Button>
        </div>
        <div className="text-sm">
          <span className="text-ink-muted">Total materiales (muestra): </span>
          <span className="font-semibold tabular-nums text-ink">{num2(total)}</span>
        </div>
      </div>

      <DemoNote>
        Organización en capítulos e intervenciones siguiendo el Excel de referencia. «Valor unitario»
        e «Importe» son etiquetas de interfaz para los valores observados; no se presentan como
        precios vigentes. El conjunto es una muestra, no el Excel completo.
      </DemoNote>

      {INTERVENCIONES.map((intv) => {
        const rows = materiales.filter((m) => m.intervencion === intv.codigo)
        const subtotal = rows.reduce((s, m) => s + m.importe, 0)
        const isCollapsed = collapsed[intv.codigo]
        return (
          <Card key={intv.codigo}>
            <button
              onClick={() => toggle(intv.codigo)}
              className="flex w-full items-center justify-between gap-3 border-b border-line px-4 py-2.5 text-left hover:bg-surface-hover"
            >
              <span className="flex items-center gap-2 min-w-0">
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                <span className="font-mono text-xs text-ink-muted">{intv.codigo}</span>
                <span className="truncate text-sm font-semibold text-ink">{intv.titulo}</span>
              </span>
              <span className="flex shrink-0 items-center gap-3 text-xs">
                <Badge tone="neutral">{rows.length} ítem(s)</Badge>
                <span className="text-ink-muted">
                  Subtotal: <span className="font-semibold tabular-nums text-ink">{num2(subtotal)}</span>
                </span>
              </span>
            </button>
            {!isCollapsed && (
              <TableScroll>
                <Table>
                  <thead>
                    <Tr>
                      <Th>Ítem</Th>
                      <Th align="right">Cantidad</Th>
                      <Th>Unidad</Th>
                      <Th>Descripción</Th>
                      <Th>Código</Th>
                      <Th>Marca</Th>
                      <Th align="right">Valor unitario</Th>
                      <Th align="right">Importe</Th>
                      <Th align="right">Acciones</Th>
                    </Tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <Tr>
                        <Td className="text-ink-muted" align="center">—</Td>
                        <Td /><Td /><Td className="text-ink-muted">Sin ítems en esta intervención</Td>
                        <Td /><Td /><Td /><Td /><Td />
                      </Tr>
                    ) : (
                      rows.map((m) => (
                        <Tr key={m.id} hover>
                          <Td className="tabular-nums">{m.item}</Td>
                          <Td align="right">{m.cantidad}</Td>
                          <Td>{m.unidad}</Td>
                          <Td className="max-w-[320px]">
                            <span className="text-ink">{m.descripcion}</span>
                            {m.observacion && (
                              <span className="mt-0.5 block text-2xs italic text-ink-muted">
                                Obs.: {m.observacion}
                              </span>
                            )}
                          </Td>
                          <Td className="text-ink-subtle">{m.codigo}</Td>
                          <Td className="text-ink-subtle">{m.marca}</Td>
                          <Td align="right">{num2(m.valorUnitario)}</Td>
                          <Td align="right" className="font-medium">{num2(m.importe)}</Td>
                          <Td align="right">
                            <div className="flex items-center justify-end gap-0.5">
                              <IconBtn title="Editar" onClick={() => setEditing(m)}>
                                <Pencil size={14} />
                              </IconBtn>
                              <IconBtn title="Mover de intervención" onClick={() => setMoving(m)}>
                                <ArrowLeftRight size={14} />
                              </IconBtn>
                              <IconBtn title="Agregar observación" onClick={() => setObserving(m)}>
                                <MessageSquarePlus size={14} />
                              </IconBtn>
                              <IconBtn title="Consultar origen" onClick={() => setOrigin(m)}>
                                <Search size={14} />
                              </IconBtn>
                              <IconBtn title="Eliminar" onClick={() => setDeleteId(m.id)} danger>
                                <Trash2 size={14} />
                              </IconBtn>
                            </div>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </TableScroll>
            )}
          </Card>
        )
      })}

      <div className="flex justify-end rounded-lg border border-line bg-white px-4 py-3 text-sm shadow-card">
        <span className="text-ink-muted">Total materiales (muestra):&nbsp;</span>
        <span className="font-semibold tabular-nums text-ink">{num2(total)}</span>
      </div>

      {/* Modales */}
      <MaterialFormModal
        pid={pid}
        state={editing}
        onClose={() => setEditing(null)}
      />
      <MoveModal pid={pid} material={moving} onClose={() => setMoving(null)} />
      <ObservacionModal pid={pid} material={observing} onClose={() => setObserving(null)} />

      <Modal
        open={!!origin}
        onClose={() => setOrigin(null)}
        title="Consultar origen del ítem"
        size="sm"
        footer={
          <>
            <Button variant="default" onClick={() => setOrigin(null)}>
              Cerrar
            </Button>
            <Button
              variant="primary"
              icon={<ArrowRight size={14} />}
              onClick={() =>
                navigate(`/proyectos/${projectId}/procesamiento/${pid}/detecciones`)
              }
            >
              Ir a detecciones
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-subtle">
          En el producto, este ítem permitiría volver a consultar la detección original que lo
          originó. En esta demostración se enlaza a la revisión de detecciones.
        </p>
        {origin && (
          <p className="mt-2 rounded bg-surface-sunken px-2 py-1 text-xs text-ink-muted">
            {origin.descripcion}
          </p>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMaterial(pid, deleteId)}
        title="Eliminar ítem"
        tone="danger"
        confirmLabel="Eliminar"
        icon={<Trash2 size={15} />}
      >
        La eliminación se representa como una modificación registrada en el historial, no como
        pérdida de trazabilidad.
      </ConfirmDialog>

      <ConfirmDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onConfirm={() => importItemizado(pid)}
        title="Importar Excel"
        confirmLabel="Confirmar importación"
        icon={<Upload size={15} />}
      >
        La importación reemplazará el itemizado actual. La operación quedará registrada y podrá
        deshacerse. No se analiza el archivo seleccionado.
      </ConfirmDialog>
    </div>
  )
}

function IconBtn({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode
  onClick: () => void
  title: string
  danger?: boolean
}) {
  return (
    <button
      title={title}
      aria-label={title}
      onClick={onClick}
      className={cn(
        'rounded p-1.5 transition-colors hover:bg-surface-hover',
        danger ? 'text-danger-fg hover:bg-danger-bg' : 'text-ink-muted',
      )}
    >
      {children}
    </button>
  )
}

function MaterialFormModal({
  pid,
  state,
  onClose,
}: {
  pid: string
  state: MaterialItem | 'new' | null
  onClose: () => void
}) {
  const { addMaterial, editMaterial } = useDemo()
  const isNew = state === 'new'
  const editingItem = state && state !== 'new' ? state : null

  const [form, setForm] = useState({
    intervencion: '1.1', item: '', cantidad: '', unidad: 'UDS',
    descripcion: '', codigo: '', marca: '', valorUnitario: '',
  })

  useEffect(() => {
    if (editingItem) {
      setForm({
        intervencion: editingItem.intervencion,
        item: String(editingItem.item),
        cantidad: String(editingItem.cantidad),
        unidad: editingItem.unidad,
        descripcion: editingItem.descripcion,
        codigo: editingItem.codigo,
        marca: editingItem.marca,
        valorUnitario: String(editingItem.valorUnitario),
      })
    } else if (isNew) {
      setForm({
        intervencion: '1.1', item: '', cantidad: '1', unidad: 'UDS',
        descripcion: '', codigo: '-', marca: '-', valorUnitario: '0',
      })
    }
  }, [state]) // eslint-disable-line react-hooks/exhaustive-deps

  const valid = form.descripcion.trim() !== '' && Number(form.cantidad) > 0

  const save = () => {
    const payload = {
      intervencion: form.intervencion,
      item: Number(form.item) || 0,
      cantidad: Number(form.cantidad) || 0,
      unidad: form.unidad,
      descripcion: form.descripcion.trim(),
      codigo: form.codigo || '-',
      marca: form.marca || '-',
      valorUnitario: Number(form.valorUnitario) || 0,
    }
    if (editingItem) {
      editMaterial(pid, { ...editingItem, ...payload })
    } else {
      addMaterial(pid, payload)
    }
    onClose()
  }

  return (
    <Modal
      open={state !== null}
      onClose={onClose}
      title={editingItem ? 'Editar ítem' : 'Agregar ítem'}
      description="Los cambios quedan registrados en el historial del itemizado."
      footer={
        <>
          <Button variant="default" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" disabled={!valid} onClick={save}>
            {editingItem ? 'Guardar cambios' : 'Agregar ítem'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <FieldWrap label="Intervención">
          <Select
            value={form.intervencion}
            onChange={(e) => setForm({ ...form, intervencion: e.target.value })}
          >
            {INTERVENCIONES.map((i) => (
              <option key={i.codigo} value={i.codigo}>
                {i.codigo} — {i.titulo}
              </option>
            ))}
          </Select>
        </FieldWrap>
        <FieldWrap label="N° de ítem">
          <TextInput type="number" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} />
        </FieldWrap>
        <FieldWrap label="Cantidad" required>
          <TextInput type="number" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} />
        </FieldWrap>
        <FieldWrap label="Unidad">
          <TextInput value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })} />
        </FieldWrap>
        <div className="col-span-2">
          <FieldWrap label="Descripción" required>
            <TextInput value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </FieldWrap>
        </div>
        <FieldWrap label="Código">
          <TextInput value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
        </FieldWrap>
        <FieldWrap label="Marca">
          <TextInput value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} />
        </FieldWrap>
        <div className="col-span-2">
          <FieldWrap label="Valor unitario" hint="Etiqueta de interfaz; no representa precio vigente. El importe se calcula como cantidad × valor unitario.">
            <TextInput type="number" value={form.valorUnitario} onChange={(e) => setForm({ ...form, valorUnitario: e.target.value })} />
          </FieldWrap>
        </div>
      </div>
    </Modal>
  )
}

function MoveModal({ pid, material, onClose }: { pid: string; material: MaterialItem | null; onClose: () => void }) {
  const { moveMaterial } = useDemo()
  const [target, setTarget] = useState('1.1')
  useEffect(() => {
    if (material) setTarget(material.intervencion)
  }, [material])

  return (
    <Modal
      open={!!material}
      onClose={onClose}
      title="Mover de intervención"
      size="sm"
      footer={
        <>
          <Button variant="default" onClick={onClose}>Cancelar</Button>
          <Button
            variant="primary"
            onClick={() => {
              if (material) moveMaterial(pid, material.id, target)
              onClose()
            }}
          >
            Mover ítem
          </Button>
        </>
      }
    >
      <FieldWrap label="Intervención de destino">
        <Select value={target} onChange={(e) => setTarget(e.target.value)}>
          {INTERVENCIONES.map((i) => (
            <option key={i.codigo} value={i.codigo}>
              {i.codigo} — {i.titulo}
            </option>
          ))}
        </Select>
      </FieldWrap>
    </Modal>
  )
}

function ObservacionModal({ pid, material, onClose }: { pid: string; material: MaterialItem | null; onClose: () => void }) {
  const { addObservacion } = useDemo()
  const [text, setText] = useState('')
  useEffect(() => {
    if (material) setText(material.observacion ?? '')
  }, [material])

  return (
    <Modal
      open={!!material}
      onClose={onClose}
      title="Agregar observación"
      size="sm"
      footer={
        <>
          <Button variant="default" onClick={onClose}>Cancelar</Button>
          <Button
            variant="primary"
            onClick={() => {
              if (material) addObservacion(pid, material.id, text)
              onClose()
            }}
          >
            Guardar observación
          </Button>
        </>
      }
    >
      <FieldWrap label="Observación">
        <TextArea value={text} onChange={(e) => setText(e.target.value)} />
      </FieldWrap>
    </Modal>
  )
}

// --- M.O y resumen ----------------------------------------------------------

function ManoObraTab() {
  const groups = manoObraGroups()
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((g, i) => [g.titulo, i < 3])),
  )
  return (
    <div className="space-y-3">
      <DemoNote>
        Esta información no se reduce a una tarjeta de total: se organiza en tablas y grupos
        expandibles. Valores de referencia de demostración, no precios vigentes.
      </DemoNote>
      {groups.map((g) => {
        const isOpen = open[g.titulo]
        return (
          <Card key={g.titulo}>
            <button
              onClick={() => setOpen((o) => ({ ...o, [g.titulo]: !o[g.titulo] }))}
              className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-surface-hover"
            >
              <span className="flex items-center gap-2">
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span className="text-sm font-semibold text-ink">{g.titulo}</span>
              </span>
              <Badge tone="neutral">{g.rows.length} fila(s)</Badge>
            </button>
            {isOpen && (
              <div className="border-t border-line">
                {g.descripcion && (
                  <p className="px-4 pt-3 text-xs text-ink-muted">{g.descripcion}</p>
                )}
                <TableScroll>
                  <Table>
                    <thead>
                      <Tr>
                        <Th>Concepto</Th>
                        <Th align="right">Valor</Th>
                      </Tr>
                    </thead>
                    <tbody>
                      {g.rows.map((r, i) => (
                        <Tr key={i} hover>
                          <Td>{r.concepto}</Td>
                          <Td align="right" className="tabular-nums">{r.valor}</Td>
                        </Tr>
                      ))}
                    </tbody>
                  </Table>
                </TableScroll>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

// --- Potencia ---------------------------------------------------------------

function PotenciaTab() {
  const rows = potenciaRows()
  return (
    <Card>
      <CardHeader
        title="Potencia"
        description="Se conservan las etiquetas del archivo de referencia. No se corrigen unidades ni se introducen cálculos técnicos."
      />
      <TableScroll>
        <Table>
          <thead>
            <Tr>
              <Th>Ítem</Th>
              <Th align="right">Cantidad</Th>
              <Th>Unidad</Th>
              <Th>Descripción</Th>
              <Th align="right">Potencia HP</Th>
              <Th align="right">Potencia en W</Th>
              <Th align="right">Corriente (A) cos fi 0,85</Th>
            </Tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <Tr key={r.id} hover>
                <Td className="tabular-nums">{r.item}</Td>
                <Td align="right">{r.cantidad}</Td>
                <Td>{r.unidad}</Td>
                <Td>{r.descripcion}</Td>
                <Td align="right">{num2(r.potenciaHP)}</Td>
                <Td align="right">{num2(r.potenciaW)}</Td>
                <Td align="right">{num2(r.corrienteA)}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableScroll>
    </Card>
  )
}

// --- Descripciones auxiliares ----------------------------------------------

function DescripcionesTab() {
  const rows = descripcionesAux()
  return (
    <Card>
      <CardHeader
        title="Descripciones auxiliares"
        description="Combinación de material y aplicación para descripciones compuestas."
      />
      <TableScroll>
        <Table>
          <thead>
            <Tr>
              <Th>Material</Th>
              <Th>Aplicación</Th>
              <Th>Descripción combinada</Th>
            </Tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <Tr key={r.id} hover>
                <Td>{r.material}</Td>
                <Td className="text-ink-subtle">{r.aplicacion}</Td>
                <Td className="font-medium">{r.descripcionCombinada}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableScroll>
    </Card>
  )
}

// --- Historial --------------------------------------------------------------

function HistorialTab({ pid }: { pid: string }) {
  const { getProcessing, undoLast, undoImport, resetItemizado } = useDemo()
  const processing = getProcessing(pid)!
  const [confirmReset, setConfirmReset] = useState(false)

  const canUndo = processing.undoStack.length > 0
  const canUndoImport = processing.preImport !== null

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Historial de cambios del itemizado"
          icon={<History size={18} />}
          description="Versiones visuales preparadas: inicial, modificación manual e importación."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="default" size="sm" icon={<Undo2 size={14} />} disabled={!canUndo} onClick={() => undoLast(pid)}>
                Deshacer último cambio
              </Button>
              <Button variant="default" size="sm" icon={<Undo2 size={14} />} disabled={!canUndoImport} onClick={() => undoImport(pid)}>
                Deshacer importación
              </Button>
              <Button variant="subtle" size="sm" icon={<RotateCcw size={14} />} onClick={() => setConfirmReset(true)}>
                Restablecer itemizado inicial
              </Button>
            </div>
          }
        />
        <CardBody className="p-0">
          <TableScroll>
            <Table>
              <thead>
                <Tr>
                  <Th>Fecha y hora</Th>
                  <Th>Acción</Th>
                  <Th>Elemento</Th>
                  <Th>Antes</Th>
                  <Th>Después</Th>
                  <Th>Comentario</Th>
                </Tr>
              </thead>
              <tbody>
                {processing.historial.map((h) => (
                  <Tr key={h.id} hover>
                    <Td className="whitespace-nowrap text-ink-subtle">{fechaHora(h.fechaHora)}</Td>
                    <Td className="font-medium">{h.accion}</Td>
                    <Td className="max-w-[240px] text-ink-subtle">{h.elemento}</Td>
                    <Td className="text-ink-muted">{h.antes}</Td>
                    <Td className="text-ink-muted">{h.despues}</Td>
                    <Td className="max-w-[240px] text-ink-muted">{h.comentario}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableScroll>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => resetItemizado(pid)}
        title="Restablecer itemizado inicial"
        confirmLabel="Restablecer"
        icon={<RotateCcw size={15} />}
      >
        Se vuelve al itemizado base generado tras resolver las alertas. No se reprocesa el pliego ni
        se alteran las detecciones.
      </ConfirmDialog>
    </div>
  )
}
