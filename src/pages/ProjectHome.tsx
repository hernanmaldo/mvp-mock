import { useNavigate, useParams } from 'react-router-dom'
import {
  Plus, FileText, ArrowRight, Boxes, FileSpreadsheet, FileType2, Layers,
} from 'lucide-react'
import { useDemo, pendingAlerts } from '../store/DemoContext'
import { Breadcrumbs, PageHeader, DefinitionList, EmptyState } from '../components/ui/Misc'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Table, TableScroll, Td, Th, Tr } from '../components/ui/Table'
import { STAGE_LABEL, type Processing, type Stage } from '../types'
import { fechaHora } from '../lib/format'

const stageRoute: Record<Stage, string> = {
  rangos: 'nuevo',
  secciones: 'secciones',
  detecciones: 'detecciones',
  itemizado: 'itemizado',
  memoria: 'memoria',
}

export function ProjectHome() {
  const { projectId } = useParams()
  const { project, processings, notify } = useDemo()
  const navigate = useNavigate()

  const projProcessings = processings.filter((p) => p.projectId === project.id)
  const hasItemizado = projProcessings.some((p) => p.itemizadoGenerado)
  const hasMemoria = projProcessings.some((p) => p.memoriaGenerada)

  const openProcessing = (p: Processing) =>
    navigate(`/proyectos/${project.id}/procesamiento/${p.id}/${stageRoute[p.stage]}`)

  return (
    <div className="space-y-5">
      <Breadcrumbs items={[{ label: 'Proyectos', to: '/proyectos' }, { label: project.nombre }]} />

      <PageHeader
        title={project.nombre}
        subtitle={`${project.id} · ${project.tipo}`}
        actions={
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => navigate(`/proyectos/${projectId}/procesamiento/nuevo`)}
          >
            Nuevo procesamiento
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Datos generales" />
          <CardBody>
            <DefinitionList
              items={[
                { label: 'Cliente / organismo', value: project.clienteOrganismo },
                { label: 'Tipo', value: <Badge tone="neutral">{project.tipo}</Badge> },
                { label: 'Responsable', value: project.responsable },
                { label: 'Alcance a cotizar', value: project.alcanceACotizar },
                { label: 'Fecha límite', value: project.fechaLimite ?? 'Sin definir' },
                { label: 'Estado', value: <Badge tone="success">{project.estado}</Badge> },
              ]}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Accesos rápidos" />
          <CardBody className="space-y-2">
            <QuickDoc
              icon={<FileText size={16} />}
              label="Pliego"
              name={project.documentos.pliego}
              onClick={() => notify('Vista de demostración del pliego.', 'info')}
            />
            <QuickDoc
              icon={<Boxes size={16} />}
              label="Itemizado"
              name={hasItemizado ? 'Disponible en procesamientos' : 'Aún no generado'}
              disabled={!hasItemizado}
              onClick={() => {
                const p = projProcessings.find((x) => x.itemizadoGenerado)
                if (p) navigate(`/proyectos/${project.id}/procesamiento/${p.id}/itemizado`)
              }}
            />
            <QuickDoc
              icon={<FileType2 size={16} />}
              label="Memoria descriptiva"
              name={hasMemoria ? 'Vista previa disponible' : 'Aún no generada'}
              disabled={!hasMemoria}
              onClick={() => {
                const p = projProcessings.find((x) => x.memoriaGenerada)
                if (p) navigate(`/proyectos/${project.id}/procesamiento/${p.id}/memoria`)
              }}
            />
            <QuickDoc
              icon={<FileSpreadsheet size={16} />}
              label="Excel de referencia"
              name={project.documentos.excelReferencia}
              onClick={() => notify('Referencia independiente (vista de demostración).', 'info')}
            />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Procesamientos de la sesión"
          description="Cada procesamiento es independiente y conserva su progreso visual mientras dure la sesión."
          icon={<Layers size={18} />}
          actions={
            <Button
              variant="default"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => navigate(`/proyectos/${projectId}/procesamiento/nuevo`)}
            >
              Nuevo procesamiento
            </Button>
          }
        />
        <CardBody className="p-0">
          {projProcessings.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={<Layers size={28} />}
                title="Todavía no hay procesamientos en esta sesión"
                description="Iniciá un nuevo procesamiento para leer el pliego por rangos de páginas y revisar las detecciones."
                action={
                  <Button
                    variant="primary"
                    icon={<Plus size={15} />}
                    onClick={() => navigate(`/proyectos/${projectId}/procesamiento/nuevo`)}
                  >
                    Nuevo procesamiento
                  </Button>
                }
              />
            </div>
          ) : (
            <TableScroll>
              <Table>
                <thead>
                  <Tr>
                    <Th>Identificador</Th>
                    <Th>Fecha y hora</Th>
                    <Th>Rangos seleccionados</Th>
                    <Th>Secciones incluidas</Th>
                    <Th>Etapa</Th>
                    <Th>Alertas pendientes</Th>
                    <Th align="right">Acción</Th>
                  </Tr>
                </thead>
                <tbody>
                  {projProcessings.map((p) => {
                    const incluidas = p.secciones.filter((s) => s.incluida).length
                    const pend = pendingAlerts(p)
                    return (
                      <Tr key={p.id} hover>
                        <Td className="font-medium">{p.id}</Td>
                        <Td className="text-ink-subtle">{fechaHora(p.fechaHora)}</Td>
                        <Td className="text-ink-subtle">
                          {p.rangos.map((r) => `${r.desde}–${r.hasta}`).join(', ')}
                        </Td>
                        <Td className="text-ink-subtle">
                          {incluidas} de {p.secciones.length}
                        </Td>
                        <Td>
                          <Badge tone="info">{STAGE_LABEL[p.stage]}</Badge>
                        </Td>
                        <Td>
                          {p.detecciones.length === 0 ? (
                            <span className="text-ink-muted">—</span>
                          ) : pend > 0 ? (
                            <Badge tone="warning">{pend} pendiente(s)</Badge>
                          ) : (
                            <Badge tone="success">Resueltas</Badge>
                          )}
                        </Td>
                        <Td align="right">
                          <Button
                            variant="default"
                            size="sm"
                            iconRight={<ArrowRight size={14} />}
                            onClick={() => openProcessing(p)}
                          >
                            Abrir
                          </Button>
                        </Td>
                      </Tr>
                    )
                  })}
                </tbody>
              </Table>
            </TableScroll>
          )}
        </CardBody>
      </Card>
    </div>
  )
}

function QuickDoc({
  icon,
  label,
  name,
  onClick,
  disabled,
}: {
  icon: React.ReactNode
  label: string
  name: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-2.5 rounded-md border border-line px-3 py-2 text-left transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent"
    >
      <span className="text-ink-muted">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-ink-subtle">{label}</span>
        <span className="block truncate text-xs text-ink-muted" title={name}>
          {name}
        </span>
      </span>
      {!disabled && <ArrowRight size={14} className="shrink-0 text-ink-disabled" />}
    </button>
  )
}
