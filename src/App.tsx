import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ToastHost } from './components/ToastHost'
import { ProjectsList } from './pages/ProjectsList'
import { ProjectHome } from './pages/ProjectHome'
import { NewProcessing } from './pages/NewProcessing'
import { ConfirmSections } from './pages/ConfirmSections'
import { ReviewDetections } from './pages/ReviewDetections'
import { Itemizado } from './pages/Itemizado'
import { Memoria } from './pages/Memoria'
import { KBIndex } from './pages/KBIndex'
import { KBSectionPage } from './pages/KBSectionPage'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/proyectos" replace />} />
          <Route path="/proyectos" element={<ProjectsList />} />
          <Route path="/proyectos/:projectId" element={<ProjectHome />} />
          <Route path="/proyectos/:projectId/procesamiento/nuevo" element={<NewProcessing />} />
          <Route
            path="/proyectos/:projectId/procesamiento/:pid/secciones"
            element={<ConfirmSections />}
          />
          <Route
            path="/proyectos/:projectId/procesamiento/:pid/detecciones"
            element={<ReviewDetections />}
          />
          <Route
            path="/proyectos/:projectId/procesamiento/:pid/itemizado"
            element={<Itemizado />}
          />
          <Route path="/proyectos/:projectId/procesamiento/:pid/memoria" element={<Memoria />} />
          <Route path="/base-conocimiento" element={<KBIndex />} />
          <Route path="/base-conocimiento/:slug" element={<KBSectionPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <ToastHost />
    </>
  )
}
