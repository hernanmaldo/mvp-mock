import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useDemo } from '../store/DemoContext'
import { PageHeader, DemoNote } from '../components/ui/Misc'
import { Badge } from '../components/ui/Badge'

export function KBIndex() {
  const { kbSections } = useDemo()

  return (
    <div className="space-y-5">
      <PageHeader
        title="Base de conocimiento"
        subtitle="ABM visual. Consulta, alta, edición y eliminación con datos de demostración."
      />

      <DemoNote>
        Todas las operaciones son simuladas. No hay conexión con proveedores ni se solicitan
        credenciales. Importar y exportar muestran feedback simulado, sin archivos reales.
      </DemoNote>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kbSections.map((sec) => {
          const Icon = sec.icon
          return (
            <Link
              key={sec.slug}
              to={`/base-conocimiento/${sec.slug}`}
              className="group flex flex-col rounded-lg border border-line bg-white p-4 shadow-card transition-colors hover:border-brand-200 hover:bg-surface-selected/40"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                  <Icon size={18} />
                </span>
                <Badge tone="neutral">{sec.records.length} registro(s)</Badge>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-ink">{sec.titulo}</h3>
              <p className="mt-1 flex-1 text-xs text-ink-muted">{sec.descripcion}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600">
                Abrir
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
