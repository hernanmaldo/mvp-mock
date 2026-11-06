import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, FileText, FileSpreadsheet, FileType2, Send, Files,
} from 'lucide-react'
import { useDemo } from '../store/DemoContext'
import { PageHeader, DemoNote } from '../components/ui/Misc'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge, type Tone } from '../components/ui/Badge'
import { Table, TableScroll, Td, Th, Tr } from '../components/ui/Table'
import { Modal } from '../components/ui/Modal'
import type { ProjectStatus } from '../types'

const statusTone: Record<ProjectStatus, Tone> = {
  'Pendiente de procesamiento': 'neutral',
  'En procesamiento': 'info',
  'Con procesamientos': 'success',
}

export function ProjectsList() {
  const { project, processings, notify } = useDemo()
  const navigate = useNavigate()
  const [docsOpen, setDocsOpen] = useState(false)

  const projProcessings = processings.filter((p) => p.projectId === project.id)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Proyectos"
        subtitle="Punto de acceso. En esta demostración existe un único proyecto precargado."
      />

      <DemoNote>
        El proyecto ya existe; no se implementa la creación de proyectos. Ingresá al proyecto para
        iniciar un procesamiento del pliego.
      </DemoNote>

      <Card>
        <TableScroll>
          <Table>
            <thead>
              <Tr>
                <Th>Proyecto</Th>
                <Th>Cliente / organismo</Th>
                <Th>Tipo</Th>
                <Th>Responsable</Th>
                <Th>Fecha límite</Th>
                <Th>Estado</Th>
                <Th align="right">Acciones</Th>
              </Tr>
            </thead>
            <tbody>
              <Tr hover>
                <Td>
                  <button
                    onClick={() => navigate(`/proyectos/${project.id}`)}
                    className="text-left font-medium text-brand-600 hover:underline"
                  >
                    {project.nombre}
                  </button>
                  <div className="mt-0.5 text-2xs text-ink-muted">
                    {project.id} · {projProcessings.length} procesamiento(s) en la sesión
                  </div>
                </Td>
                <Td className="text-ink-subtle">{project.clienteOrganismo}</Td>
                <Td>
                  <Badge tone="neutral">{project.tipo}</Badge>
                </Td>
                <Td className="text-ink-subtle">{project.responsable}</Td>
                <Td className="text-ink-subtle">{project.fechaLimite ?? 'Sin definir'}</Td>
                <Td>
                  <Badge tone={statusTone[project.estado]}>{project.estado}</Badge>
                </Td>
                <Td align="right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Files size={14} />}
                      onClick={() => setDocsOpen(true)}
                    >
                      Documentos
                    </Button>
                    <Button
                      variant="subtle"
                      size="sm"
                      icon={<Send size={14} />}
                      onClick={() => notify('Acción fuera del alcance de esta demo.', 'info')}
                    >
                      Enviar a Ingeniería
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      iconRight={<ArrowRight size={14} />}
                      onClick={() => navigate(`/proyectos/${project.id}`)}
                    >
                      Abrir
                    </Button>
                  </div>
                </Td>
              </Tr>
            </tbody>
          </Table>
        </TableScroll>
      </Card>

      <Modal
        open={docsOpen}
        onClose={() => setDocsOpen(false)}
        title="Documentos disponibles"
        description="Accesos rápidos a los documentos del proyecto (vista de demostración)."
      >
        <ul className="space-y-2">
          {[
            { icon: FileText, label: 'Pliego', name: project.documentos.pliego, tone: 'brand' },
            { icon: FileSpreadsheet, label: 'Excel de referencia', name: project.documentos.excelReferencia, tone: 'success' },
            { icon: FileType2, label: 'Memoria de referencia', name: project.documentos.memoriaReferencia, tone: 'info' },
          ].map(({ icon: Icon, label, name }) => (
            <li
              key={label}
              className="flex items-center gap-3 rounded-md border border-line px-3 py-2"
            >
              <Icon size={18} className="shrink-0 text-ink-muted" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-ink-subtle">{label}</div>
                <div className="truncate text-sm text-ink" title={name}>
                  {name}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => notify(`Vista de demostración de «${label}».`, 'info')}
              >
                Ver
              </Button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-muted">
          El Excel y la memoria son referencias independientes de estructura y contenido. No se
          atribuyen sus materiales o especificaciones al pliego activo.
        </p>
      </Modal>
    </div>
  )
}
