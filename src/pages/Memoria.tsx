import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FileType2, Globe, Database, Download, Sparkles, CheckCircle2,
  AlertCircle, ArrowRight,
} from 'lucide-react'
import { useDemo } from '../store/DemoContext'
import { ProcessingHeader } from '../components/ProcessingHeader'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge, type Tone } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { FieldWrap, TextInput, Checkbox } from '../components/ui/Field'
import { DemoNote } from '../components/ui/Misc'
import type { DatoFaltante, DatoFaltanteEstado } from '../types'
import { NotFound } from './NotFound'

const faltanteMeta: Record<DatoFaltanteEstado, { tone: Tone; label: string }> = {
  faltante: { tone: 'warning', label: 'Faltante' },
  'completado-web': { tone: 'info', label: 'Completado (web)' },
  'completado-abm': { tone: 'success', label: 'Completado (base)' },
  omitido: { tone: 'neutral', label: 'Continuado con faltante' },
}

// Resultados web preparados y claramente simulados
const webResults: Record<string, string[]> = {
  'FAL-1': ['Tensión nominal 3×380 V + N (resultado simulado)', 'Alimentación trifásica 400 V (resultado simulado)'],
  'FAL-2': ['Grado de protección IP65 para intemperie (resultado simulado)', 'IP54 en ambientes interiores (resultado simulado)'],
  'FAL-3': ['Caudalímetro electromagnético DN100 (resultado simulado)', 'Caudalímetro ultrasónico de inserción (resultado simulado)'],
}

export function Memoria() {
  const { projectId, pid } = useParams()
  const { project, getProcessing, initMemoria, updateMemoria, setFaltanteEstado, generateMemoria, notify } = useDemo()
  const navigate = useNavigate()

  const processing = getProcessing(pid!)
  const [plantilla, setPlantilla] = useState('PL-ELECTRO')
  const [webFor, setWebFor] = useState<DatoFaltante | null>(null)

  useEffect(() => {
    if (processing && !processing.memoria) {
      initMemoria(processing.id, plantilla)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processing?.id])

  if (!processing) return <NotFound />
  const { memoria, faltantes } = processing
  if (!memoria) return null

  const pendientes = faltantes.filter((f) => f.estado === 'faltante').length

  return (
    <div className="space-y-5">
      <ProcessingHeader projectName={project.nombre} processing={processing} current="memoria" />

      <DemoNote>
        Última etapa del flujo. La generación nunca se bloquea por faltantes. La vista previa
        identifica los faltantes sin inventar características. La descarga es una interacción
        simulada.
      </DemoNote>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* Configuración */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Plantilla y configuración" icon={<FileType2 size={18} />} />
            <CardBody className="space-y-3">
              <FieldWrap label="Plantilla">
                <select
                  className="w-full appearance-none rounded border border-line bg-white px-2.5 py-1.5 text-sm"
                  value={memoria.plantillaId}
                  onChange={(e) => {
                    setPlantilla(e.target.value)
                    updateMemoria(processing.id, { plantillaId: e.target.value })
                  }}
                >
                  <option value="PL-ELECTRO">Memoria electromecánica</option>
                  <option value="PL-SIMPLE">Memoria resumida</option>
                </select>
              </FieldWrap>

              <Checkbox
                checked={memoria.logo}
                onChange={(e) => updateMemoria(processing.id, { logo: e.target.checked })}
                label="Incluir logo en portada"
              />

              <FieldWrap label="Título">
                <TextInput
                  value={memoria.titulo}
                  onChange={(e) => updateMemoria(processing.id, { titulo: e.target.value })}
                />
              </FieldWrap>
              <FieldWrap label="Encabezado">
                <TextInput
                  value={memoria.encabezado}
                  onChange={(e) => updateMemoria(processing.id, { encabezado: e.target.value })}
                />
              </FieldWrap>
              <FieldWrap label="Pie de página">
                <TextInput
                  value={memoria.pie}
                  onChange={(e) => updateMemoria(processing.id, { pie: e.target.value })}
                />
              </FieldWrap>

              <div>
                <div className="mb-1.5 text-xs font-semibold text-ink-subtle">Secciones incluidas</div>
                <div className="space-y-1.5">
                  {memoria.secciones.map((s) => (
                    <Checkbox
                      key={s.id}
                      checked={s.incluida}
                      onChange={() =>
                        updateMemoria(processing.id, {
                          secciones: memoria.secciones.map((x) =>
                            x.id === s.id ? { ...x, incluida: !x.incluida } : x,
                          ),
                        })
                      }
                      label={s.nombre}
                    />
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Datos disponibles y faltantes"
              description={`${pendientes} faltante(s) sin resolver. La generación no se bloquea.`}
            />
            <CardBody className="space-y-2.5">
              {faltantes.map((f) => {
                const meta = faltanteMeta[f.estado]
                return (
                  <div key={f.id} className="rounded-md border border-line p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-ink">{f.campo}</span>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-muted">{f.descripcion}</p>
                    {f.valor && (
                      <p className="mt-1 rounded bg-surface-sunken px-2 py-1 text-xs text-ink-subtle">
                        {f.valor}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Button variant="ghost" size="sm" icon={<Globe size={13} />} onClick={() => setWebFor(f)}>
                        Buscar en la web con IA
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Database size={13} />}
                        onClick={() => {
                          setFaltanteEstado(processing.id, f.id, 'completado-abm', 'Completado desde la base de conocimiento (demostración).')
                          notify('Se abrió el ABM correspondiente; podés regresar a la memoria.', 'info')
                          navigate('/base-conocimiento/contenido-memorias')
                        }}
                      >
                        Completar en base
                      </Button>
                    </div>
                  </div>
                )
              })}

              <Button
                variant="default"
                size="sm"
                className="w-full"
                onClick={() => {
                  faltantes
                    .filter((f) => f.estado === 'faltante')
                    .forEach((f) => setFaltanteEstado(processing.id, f.id, 'omitido'))
                  generateMemoria(processing.id)
                }}
              >
                Continuar con faltantes
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Vista previa */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                icon={<Sparkles size={15} />}
                onClick={() => generateMemoria(processing.id)}
              >
                Generar memoria descriptiva
              </Button>
              <Button
                variant="default"
                icon={<Download size={15} />}
                disabled={!processing.memoriaGenerada}
                onClick={() => notify('Descarga Word simulada: no se generó ningún archivo.', 'info')}
              >
                Descargar Word
              </Button>
            </div>
            {processing.memoriaGenerada && (
              <Badge tone="success">
                <CheckCircle2 size={12} className="mr-1" />
                Vista previa generada
              </Badge>
            )}
          </div>

          {processing.memoriaGenerada ? (
            <MemoriaPreview
              memoria={memoria}
              faltantes={faltantes}
              projectName={project.nombre}
            />
          ) : (
            <Card>
              <CardBody>
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <FileType2 size={30} className="text-ink-disabled" />
                  <p className="text-sm font-medium text-ink">Vista previa no generada</p>
                  <p className="max-w-sm text-xs text-ink-muted">
                    Generá la memoria descriptiva para ver la vista previa documental de solo lectura.
                    El formato previsto es Word .docx, convertible a PDF fuera del mock.
                  </p>
                </div>
              </CardBody>
            </Card>
          )}

          <div className="flex justify-end">
            <Button
              variant="default"
              iconRight={<ArrowRight size={14} />}
              onClick={() => navigate(`/proyectos/${projectId}`)}
            >
              Volver al proyecto
            </Button>
          </div>
        </div>
      </div>

      {/* Modal búsqueda web simulada */}
      <Modal
        open={!!webFor}
        onClose={() => setWebFor(null)}
        title="Búsqueda en la web con IA (simulada)"
        description="Resultados preparados y claramente simulados. No se consulta internet."
      >
        {webFor && (
          <div className="space-y-2">
            <p className="text-sm text-ink-subtle">
              Dato: <span className="font-medium text-ink">{webFor.campo}</span>
            </p>
            {(webResults[webFor.id] ?? ['Resultado simulado genérico']).map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-md border border-line px-3 py-2"
              >
                <span className="text-sm text-ink">{r}</span>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setFaltanteEstado(processing.id, webFor.id, 'completado-web', r)
                    notify('Resultado aceptado. No se guardó automáticamente en la base.', 'info')
                    setWebFor(null)
                  }}
                >
                  Aceptar
                </Button>
              </div>
            ))}
            <p className="pt-1 text-xs text-ink-muted">
              Aceptar un resultado completa el dato en la memoria sin consultar internet y sin
              guardarlo automáticamente en la base de conocimiento.
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}

function MemoriaPreview({
  memoria,
  faltantes,
  projectName,
}: {
  memoria: NonNullable<ReturnType<typeof useDemo>['processings'][number]['memoria']>
  faltantes: DatoFaltante[]
  projectName: string
}) {
  const incluidas = memoria.secciones.filter((s) => s.incluida)
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line bg-surface-sunken px-4 py-2 text-2xs uppercase tracking-wide text-ink-disabled">
        Vista previa de solo lectura · documento de demostración (datos simulados)
      </div>
      <div className="max-h-[640px] overflow-auto scroll-thin bg-surface-sunken p-5">
        <article className="mx-auto max-w-[640px] space-y-5 bg-white p-8 shadow-raised">
          {/* Portada */}
          <header className="border-b border-line pb-5 text-center">
            {memoria.logo && <img src="/mvp-mock/logo.svg" alt="Tecnowatt" className="mx-auto mb-4 h-7" />}
            <h2 className="text-lg font-semibold text-ink">{memoria.titulo}</h2>
            <p className="mt-1 text-xs text-ink-muted">{memoria.encabezado}</p>
            <p className="mt-3 text-sm text-ink-subtle">{projectName}</p>
          </header>

          {incluidas.map((s, idx) => (
            <section key={s.id} className="space-y-1.5">
              <h3 className="text-sm font-semibold text-ink">
                {idx + 1}. {s.nombre}
              </h3>
              <p className="text-[13px] leading-relaxed text-ink-subtle">
                {sectionDemoText(s.nombre)}
              </p>
            </section>
          ))}

          {faltantes.some((f) => f.estado !== 'completado-web' && f.estado !== 'completado-abm') && (
            <section className="rounded-md border border-warning-border bg-warning-bg px-3 py-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-warning-fg">
                <AlertCircle size={13} />
                Datos pendientes identificados (no inventados)
              </div>
              <ul className="mt-1 list-disc pl-5 text-xs text-warning-fg">
                {faltantes
                  .filter((f) => f.estado !== 'completado-web' && f.estado !== 'completado-abm')
                  .map((f) => (
                    <li key={f.id}>
                      {f.campo}: <span className="italic">[dato pendiente]</span>
                    </li>
                  ))}
              </ul>
            </section>
          )}

          <footer className="border-t border-line pt-3 text-center text-2xs text-ink-disabled">
            {memoria.pie}
          </footer>
        </article>
      </div>
    </Card>
  )
}

function sectionDemoText(nombre: string): string {
  const map: Record<string, string> = {
    'Portada': 'Página de portada con los datos generales del proyecto.',
    'Introducción y alcance técnico': 'Descripción breve del alcance electromecánico de la obra (contenido de demostración). No se atribuyen al proyecto activo especificaciones de otra obra.',
    'Normativa y base de diseño': 'Referencias normativas de contexto. No se afirma cumplimiento normativo verificado.',
    'Descripción de envolventes': 'Envolventes y gabinetes con grado de protección a la intemperie (contenido de demostración).',
    'Descripción de unidades funcionales': 'Unidades funcionales de la instalación descritas de forma resumida (demostración).',
    'Tableros seccionales': 'Tableros seccionales con su aparamenta de protección y maniobra (demostración).',
    'Ingeniería de detalle y documentación técnica': 'Documentación técnica prevista; contenido breve de demostración.',
    'Ensayos y pruebas': 'Ensayos previstos. No se afirma que se hayan realizado ensayos ni se otorgan garantías verificadas.',
    'Especificaciones de montaje e infraestructura': 'Lineamientos de montaje e infraestructura asociada (demostración).',
    'Conclusión': 'Cierre del documento con observaciones finales (demostración).',
  }
  return map[nombre] ?? 'Contenido breve de demostración para esta sección.'
}
