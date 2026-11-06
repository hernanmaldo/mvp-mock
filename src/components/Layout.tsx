import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FolderKanban, Database, RotateCcw, FlaskConical } from 'lucide-react'
import { cn } from '../lib/cn'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'
import { useDemo } from '../store/DemoContext'

const navItems = [
  { to: '/proyectos', label: 'Proyectos', icon: FolderKanban },
  { to: '/base-conocimiento', label: 'Base de conocimiento', icon: Database },
]

export function Layout() {
  const { resetDemo, notify } = useDemo()
  const navigate = useNavigate()
  const [confirmReset, setConfirmReset] = useState(false)

  const doReset = () => {
    resetDemo()
    setConfirmReset(false)
    navigate('/proyectos')
    notify('Demo reiniciada. Estado inicial restaurado.', 'success')
  }

  return (
    <div className="flex min-h-screen bg-surface-sunken">
      {/* Navegación lateral persistente */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-white md:flex">
        <div className="flex h-14 items-center gap-2 border-b border-line px-4">
          <img src="/favicon.svg" alt="Tecnowatt" className="h-7 w-7" />
          <div className="leading-tight">
            <div className="text-sm font-semibold text-ink">Cotizaciones</div>
            <div className="text-2xs font-medium uppercase tracking-wider text-ink-muted">MVP</div>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 p-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded px-2.5 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-surface-selected text-brand-600'
                    : 'text-ink-subtle hover:bg-surface-hover',
                )
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-line p-3">
          <Button
            variant="subtle"
            size="sm"
            className="w-full"
            icon={<RotateCcw size={14} />}
            onClick={() => setConfirmReset(true)}
          >
            Reiniciar demo
          </Button>
          <p className="mt-2 px-1 text-2xs leading-relaxed text-ink-disabled">
            Tecnowatt · prototipo de debate interno
          </p>
        </div>
      </aside>

      {/* Columna principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Encabezado compacto */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-line bg-white/95 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <img src="/favicon.svg" alt="Tecnowatt" className="h-6 w-6" />
            <span className="text-sm font-semibold">Cotizaciones · MVP</span>
          </div>
          <img src="/logo.svg" alt="Tecnowatt" className="hidden h-6 md:block" />
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-warning-border bg-warning-bg px-2.5 py-1 text-2xs font-semibold text-warning-fg">
              <FlaskConical size={12} />
              Demo con datos simulados
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              icon={<RotateCcw size={14} />}
              onClick={() => setConfirmReset(true)}
            >
              Reiniciar
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 md:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reiniciar demostración"
        description="Se restaurará el estado inicial de la demo."
        size="sm"
        footer={
          <>
            <Button variant="default" onClick={() => setConfirmReset(false)}>
              Cancelar
            </Button>
            <Button variant="primary" icon={<RotateCcw size={15} />} onClick={doReset}>
              Reiniciar demo
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-ink-subtle">
          <p>Se eliminarán de esta sesión:</p>
          <ul className="ml-4 list-disc space-y-1 text-ink-muted">
            <li>Archivos seleccionados y procesamientos de la sesión</li>
            <li>Progreso visual y escenarios de cambios</li>
            <li>Comentarios y registros (logs) de la sesión</li>
          </ul>
          <p>
            Se conservan el proyecto precargado, los datos de referencia iniciales y los fixtures
            necesarios para volver a realizar la demostración.
          </p>
        </div>
      </Modal>
    </div>
  )
}
