import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { EmptyState } from '../components/ui/Misc'
import { Button } from '../components/ui/Button'

export function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-12">
      <EmptyState
        icon={<Compass size={30} />}
        title="No encontramos esta pantalla"
        description="La ruta no existe o el procesamiento ya no está disponible en esta sesión."
        action={
          <Link to="/proyectos">
            <Button variant="primary">Ir a Proyectos</Button>
          </Link>
        }
      />
    </div>
  )
}
