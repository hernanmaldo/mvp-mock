import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Plus, Search, Pencil, Trash2, Eye, Upload, Download, ThumbsUp, Lock,
} from 'lucide-react'
import { useDemo } from '../store/DemoContext'
import { Breadcrumbs, PageHeader, DemoNote, EmptyState } from '../components/ui/Misc'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { FieldWrap, TextInput, TextArea } from '../components/ui/Field'
import { Table, TableScroll, Td, Th, Tr } from '../components/ui/Table'
import type { KBField, KBRecord } from '../data/kbFixtures'
import { NotFound } from './NotFound'

export function KBSectionPage() {
  const { slug } = useParams()
  const { kbSections, kbAddRecord, kbEditRecord, kbDeleteRecord, notify } = useDemo()
  const section = kbSections.find((s) => s.slug === slug)

  const [query, setQuery] = useState('')
  const [detail, setDetail] = useState<KBRecord | null>(null)
  const [editing, setEditing] = useState<KBRecord | 'new' | null>(null)
  const [deleteRec, setDeleteRec] = useState<KBRecord | null>(null)
  const [accepting, setAccepting] = useState<KBRecord | null>(null)
  const [acceptComment, setAcceptComment] = useState('')

  const primaryFields = useMemo(
    () => (section ? section.fields.filter((f) => f.primary) : []),
    [section],
  )

  const filtered = useMemo(() => {
    if (!section) return []
    const q = query.trim().toLowerCase()
    if (!q) return section.records
    return section.records.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(q)),
    )
  }, [section, query])

  if (!section) return <NotFound />

  const isHistoric = section.slug === 'proyectos-historicos'

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: 'Base de conocimiento', to: '/base-conocimiento' },
          { label: section.titulo },
        ]}
      />
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            {section.titulo}
            {section.readonly && <Badge tone="neutral"><Lock size={11} className="mr-1" />Solo lectura</Badge>}
          </span>
        }
        subtitle={section.descripcion}
        actions={
          !section.readonly && (
            <Button variant="primary" icon={<Plus size={16} />} onClick={() => setEditing('new')}>
              Nuevo registro
            </Button>
          )
        }
      />

      {section.nota && <DemoNote>{section.nota}</DemoNote>}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2.5">
          <div className="relative w-full max-w-xs">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <TextInput
              className="pl-8"
              placeholder="Buscar…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              icon={<Upload size={14} />}
              onClick={() => notify('Importación simulada: no se analiza ningún archivo.', 'info')}
            >
              Importar
            </Button>
            <Button
              variant="default"
              size="sm"
              icon={<Download size={14} />}
              onClick={() => notify('Exportación simulada: no se generó ningún archivo.', 'info')}
            >
              Exportar
            </Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Sin registros para mostrar"
              description={query ? 'Ningún registro coincide con la búsqueda.' : 'Agregá un registro para comenzar.'}
            />
          </div>
        ) : (
          <TableScroll>
            <Table>
              <thead>
                <Tr>
                  {primaryFields.map((f) => (
                    <Th key={f.key}>{f.label}</Th>
                  ))}
                  <Th align="right">Acciones</Th>
                </Tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <Tr key={r.id} hover>
                    {primaryFields.map((f) => (
                      <Td key={f.key} className="max-w-[280px]">
                        <span className={f.key === primaryFields[0].key ? 'font-medium text-ink' : 'text-ink-subtle'}>
                          {r[f.key] || '—'}
                        </span>
                      </Td>
                    ))}
                    <Td align="right">
                      <div className="flex items-center justify-end gap-0.5">
                        {isHistoric && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<ThumbsUp size={13} />}
                            onClick={() => {
                              setAccepting(r)
                              setAcceptComment('')
                            }}
                          >
                            Aceptar
                          </Button>
                        )}
                        <IconBtn title="Ver detalle" onClick={() => setDetail(r)}>
                          <Eye size={14} />
                        </IconBtn>
                        {!section.readonly && (
                          <>
                            <IconBtn title="Editar" onClick={() => setEditing(r)}>
                              <Pencil size={14} />
                            </IconBtn>
                            <IconBtn title="Eliminar" danger onClick={() => setDeleteRec(r)}>
                              <Trash2 size={14} />
                            </IconBtn>
                          </>
                        )}
                      </div>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableScroll>
        )}
      </Card>

      {/* Detalle */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Detalle del registro"
        size="lg"
        footer={<Button variant="default" onClick={() => setDetail(null)}>Cerrar</Button>}
      >
        {detail && (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {section.fields.map((f) => (
              <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                <dt className="text-2xs font-semibold uppercase tracking-wide text-ink-muted">
                  {f.label}
                </dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-sm text-ink">{detail[f.key] || '—'}</dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>

      {/* Alta / edición */}
      <RecordFormModal
        open={editing !== null}
        fields={section.fields}
        slug={section.slug}
        record={editing && editing !== 'new' ? editing : null}
        onClose={() => setEditing(null)}
        onSubmit={(rec) => {
          if (editing && editing !== 'new') {
            kbEditRecord(section.slug, rec)
            notify('Registro actualizado (acción simulada).', 'success')
          } else {
            kbAddRecord(section.slug, rec)
            notify('Registro creado (acción simulada).', 'success')
          }
          setEditing(null)
        }}
      />

      {/* Eliminar */}
      <ConfirmDialog
        open={!!deleteRec}
        onClose={() => setDeleteRec(null)}
        onConfirm={() => {
          if (deleteRec) {
            kbDeleteRecord(section.slug, deleteRec.id)
            notify('Registro eliminado (acción simulada).', 'warning')
          }
        }}
        title="Eliminar registro"
        tone="danger"
        confirmLabel="Eliminar"
        icon={<Trash2 size={15} />}
      >
        Esta acción es simulada y se representa en el historial de la base.
      </ConfirmDialog>

      {/* Aceptar sugerencia (proyectos históricos) */}
      <Modal
        open={!!accepting}
        onClose={() => setAccepting(null)}
        title="Aceptar sugerencia"
        description="La aceptación es una sugerencia; no sobrescribe el itemizado."
        size="sm"
        footer={
          <>
            <Button variant="default" onClick={() => setAccepting(null)}>Cancelar</Button>
            <Button
              variant="primary"
              icon={<ThumbsUp size={14} />}
              onClick={() => {
                notify('Sugerencia aceptada. Representada en logs; no sobrescribe el itemizado.', 'success')
                setAccepting(null)
              }}
            >
              Aceptar sugerencia
            </Button>
          </>
        }
      >
        {accepting && (
          <div className="space-y-3">
            <p className="text-sm text-ink-subtle">
              Proyecto: <span className="font-medium text-ink">{accepting.nombre}</span>
            </p>
            <FieldWrap label="Comentario (opcional)">
              <TextArea value={acceptComment} onChange={(e) => setAcceptComment(e.target.value)} />
            </FieldWrap>
          </div>
        )}
      </Modal>
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
      className={
        'rounded p-1.5 transition-colors hover:bg-surface-hover ' +
        (danger ? 'text-danger-fg hover:bg-danger-bg' : 'text-ink-muted')
      }
    >
      {children}
    </button>
  )
}

function RecordFormModal({
  open,
  fields,
  slug,
  record,
  onClose,
  onSubmit,
}: {
  open: boolean
  fields: KBField[]
  slug: string
  record: KBRecord | null
  onClose: () => void
  onSubmit: (rec: KBRecord) => void
}) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  // Reinicia los valores cuando se abre/cambia el registro
  const recordId = record?.id ?? '__new__'
  useEffect(() => {
    const base: Record<string, string> = {}
    fields.forEach((f) => (base[f.key] = record?.[f.key] ?? ''))
    setValues(base)
    setErrors({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId, open])

  const submit = () => {
    const errs: Record<string, boolean> = {}
    fields.forEach((f) => {
      if (f.required && !values[f.key]?.trim()) errs[f.key] = true
    })
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const id = record?.id ?? `${slug.slice(0, 3).toUpperCase()}-N${Math.floor(Math.random() * 10000)}`
    const todayValues = { ...values }
    if ('fechaActualizacion' in todayValues && !record) {
      todayValues.fechaActualizacion = new Date().toISOString().slice(0, 10)
    }
    onSubmit({ id, ...todayValues } as KBRecord)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={record ? 'Editar registro' : 'Nuevo registro'}
      description="Acción simulada con validaciones visuales."
      size="lg"
      footer={
        <>
          <Button variant="default" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={submit}>
            {record ? 'Guardar cambios' : 'Crear registro'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
            <FieldWrap
              label={f.label}
              required={f.required}
              error={errors[f.key] ? 'Campo obligatorio.' : undefined}
            >
              {f.type === 'textarea' ? (
                <TextArea
                  value={values[f.key] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                />
              ) : (
                <TextInput
                  type={f.type === 'number' ? 'number' : 'text'}
                  value={values[f.key] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                />
              )}
            </FieldWrap>
          </div>
        ))}
      </div>
    </Modal>
  )
}
