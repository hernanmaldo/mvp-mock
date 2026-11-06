import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  Project,
  Processing,
  PageRange,
  Detection,
  DetectionStatus,
  MaterialItem,
  HistorialEntry,
  Stage,
  MemoriaConfig,
  DatoFaltante,
} from '../types'
import { STAGE_ORDER } from '../types'
import {
  INITIAL_PROJECT,
  buildSections,
  buildDetections,
  materialsFor,
  historialInicial,
  defaultMemoriaConfig,
  buildFaltantes,
} from '../data/fixtures'
import { cloneKBSections, type KBSectionDef, type KBRecord } from '../data/kbFixtures'

// ---------------------------------------------------------------------------

export interface Toast {
  id: number
  message: string
  tone: 'info' | 'success' | 'warning'
}

interface DemoState {
  project: Project
  processings: Processing[]
  kbSections: KBSectionDef[]
  toasts: Toast[]
}

interface DemoContextValue extends DemoState {
  notify: (message: string, tone?: Toast['tone']) => void
  dismissToast: (id: number) => void
  resetDemo: () => void

  // Procesamientos
  getProcessing: (pid: string) => Processing | undefined
  createProcessing: (input: {
    pdfNombre: string
    rangos: PageRange[]
    numeracionImpresaDisponible: boolean
  }) => string
  toggleSection: (pid: string, sectionId: string) => void
  confirmSections: (pid: string) => void

  // Detecciones
  setDetectionStatus: (pid: string, did: string, estado: DetectionStatus) => void
  correctDetection: (pid: string, did: string, patch: Partial<Detection>) => void
  commentDetection: (pid: string, did: string, comentario: string) => void
  generateItemizado: (pid: string) => void

  // Itemizado
  addMaterial: (pid: string, item: Omit<MaterialItem, 'id' | 'importe'>) => void
  editMaterial: (pid: string, item: MaterialItem) => void
  deleteMaterial: (pid: string, matId: string) => void
  moveMaterial: (pid: string, matId: string, intervencion: string) => void
  addObservacion: (pid: string, matId: string, observacion: string) => void
  importItemizado: (pid: string) => void
  exportItemizado: (pid: string) => void
  undoLast: (pid: string) => void
  undoImport: (pid: string) => void
  resetItemizado: (pid: string) => void

  // Memoria
  initMemoria: (pid: string, plantillaId: string) => void
  updateMemoria: (pid: string, patch: Partial<MemoriaConfig>) => void
  setFaltanteEstado: (pid: string, falId: string, estado: DatoFaltante['estado'], valor?: string) => void
  generateMemoria: (pid: string) => void

  // Base de conocimiento
  kbAddRecord: (slug: string, record: KBRecord) => void
  kbEditRecord: (slug: string, record: KBRecord) => void
  kbDeleteRecord: (slug: string, recordId: string) => void
}

const DemoContext = createContext<DemoContextValue | null>(null)

// ---------------------------------------------------------------------------

function initialState(): DemoState {
  return {
    project: { ...INITIAL_PROJECT },
    processings: [],
    kbSections: cloneKBSections(),
    toasts: [],
  }
}

let procSeq = 0
let histSeq = 0
const nowISO = () => new Date().toISOString()

function maxStage(a: Stage, b: Stage): Stage {
  return STAGE_ORDER.indexOf(a) >= STAGE_ORDER.indexOf(b) ? a : b
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(initialState)
  const toastSeq = useRef(0)

  const notify = useCallback((message: string, tone: Toast['tone'] = 'info') => {
    const id = ++toastSeq.current
    setState((s) => ({ ...s, toasts: [...s.toasts, { id, message, tone }] }))
    window.setTimeout(() => {
      setState((s) => ({ ...s, toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 4200)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setState((s) => ({ ...s, toasts: s.toasts.filter((t) => t.id !== id) }))
  }, [])

  const resetDemo = useCallback(() => {
    procSeq = 0
    histSeq = 0
    setState(initialState())
  }, [])

  // -- helpers ---------------------------------------------------------------

  const patchProcessing = useCallback(
    (pid: string, fn: (p: Processing) => Processing) => {
      setState((s) => ({
        ...s,
        processings: s.processings.map((p) => (p.id === pid ? fn(p) : p)),
      }))
    },
    [],
  )

  const getProcessing = useCallback(
    (pid: string) => state.processings.find((p) => p.id === pid),
    [state.processings],
  )

  const createProcessing: DemoContextValue['createProcessing'] = useCallback(
    ({ pdfNombre, rangos, numeracionImpresaDisponible }) => {
      const id = `PROC-${(++procSeq).toString().padStart(2, '0')}`
      const proc: Processing = {
        id,
        projectId: INITIAL_PROJECT.id,
        fechaHora: nowISO(),
        pdfNombre,
        rangos,
        numeracionImpresaDisponible,
        stage: 'secciones',
        secciones: buildSections(),
        detecciones: [],
        itemizadoGenerado: false,
        itemizadoVersion: 'inicial',
        materiales: [],
        undoStack: [],
        preImport: null,
        historial: [],
        memoria: null,
        faltantes: [],
        memoriaGenerada: false,
      }
      setState((s) => ({
        ...s,
        processings: [...s.processings, proc],
        project: { ...s.project, estado: 'Con procesamientos' },
      }))
      return id
    },
    [],
  )

  const toggleSection = useCallback(
    (pid: string, sectionId: string) => {
      patchProcessing(pid, (p) => ({
        ...p,
        secciones: p.secciones.map((sec) =>
          sec.id === sectionId ? { ...sec, incluida: !sec.incluida } : sec,
        ),
      }))
    },
    [patchProcessing],
  )

  const confirmSections = useCallback(
    (pid: string) => {
      patchProcessing(pid, (p) => {
        const includedIds = new Set(p.secciones.filter((s) => s.incluida).map((s) => s.id))
        const detecciones = buildDetections().filter((d) => includedIds.has(d.seccionId))
        return {
          ...p,
          detecciones,
          stage: maxStage(p.stage, 'detecciones'),
        }
      })
    },
    [patchProcessing],
  )

  // -- detecciones -----------------------------------------------------------

  const setDetectionStatus = useCallback(
    (pid: string, did: string, estado: DetectionStatus) => {
      patchProcessing(pid, (p) => ({
        ...p,
        detecciones: p.detecciones.map((d) => (d.id === did ? { ...d, estado } : d)),
      }))
    },
    [patchProcessing],
  )

  const correctDetection = useCallback(
    (pid: string, did: string, patch: Partial<Detection>) => {
      patchProcessing(pid, (p) => ({
        ...p,
        detecciones: p.detecciones.map((d) =>
          d.id === did ? { ...d, ...patch, estado: 'Corregida' } : d,
        ),
      }))
    },
    [patchProcessing],
  )

  const commentDetection = useCallback(
    (pid: string, did: string, comentario: string) => {
      patchProcessing(pid, (p) => ({
        ...p,
        detecciones: p.detecciones.map((d) => (d.id === did ? { ...d, comentario } : d)),
      }))
    },
    [patchProcessing],
  )

  const generateItemizado = useCallback(
    (pid: string) => {
      patchProcessing(pid, (p) => {
        if (p.itemizadoGenerado) return p
        return {
          ...p,
          itemizadoGenerado: true,
          itemizadoVersion: 'inicial',
          materiales: materialsFor('inicial'),
          undoStack: [],
          preImport: null,
          historial: historialInicial(),
          stage: maxStage(p.stage, 'itemizado'),
        }
      })
      notify('Itemizado generado con el dataset preparado.', 'success')
    },
    [patchProcessing, notify],
  )

  // -- itemizado: materiales -------------------------------------------------

  const pushHistorial = (p: Processing, entry: Omit<HistorialEntry, 'id' | 'fechaHora'>): HistorialEntry[] => {
    const h: HistorialEntry = { id: `H-${++histSeq}`, fechaHora: nowISO(), ...entry }
    return [h, ...p.historial]
  }

  const recalcImporte = (m: { cantidad: number; valorUnitario: number }): number =>
    Number((m.cantidad * m.valorUnitario).toFixed(6))

  const addMaterial = useCallback(
    (pid: string, item: Omit<MaterialItem, 'id' | 'importe'>) => {
      patchProcessing(pid, (p) => {
        const id = `MATU-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`
        const nuevo: MaterialItem = { ...item, id, importe: recalcImporte(item) }
        const version = p.itemizadoVersion === 'inicial' ? 'modificado' : p.itemizadoVersion
        return {
          ...p,
          undoStack: [...p.undoStack, p.materiales],
          materiales: [...p.materiales, nuevo],
          itemizadoVersion: version,
          historial: pushHistorial(p, {
            accion: 'Alta de ítem',
            elemento: `${nuevo.intervencion} · ${nuevo.descripcion}`,
            antes: '—',
            despues: `${nuevo.cantidad} ${nuevo.unidad}`,
            comentario: 'Agregado manualmente (demostración).',
          }),
        }
      })
      notify('Ítem agregado al itemizado (registrado en el historial).', 'success')
    },
    [patchProcessing, notify],
  )

  const editMaterial = useCallback(
    (pid: string, item: MaterialItem) => {
      patchProcessing(pid, (p) => {
        const prev = p.materiales.find((m) => m.id === item.id)
        const updated: MaterialItem = { ...item, importe: recalcImporte(item) }
        const version = p.itemizadoVersion === 'inicial' ? 'modificado' : p.itemizadoVersion
        return {
          ...p,
          undoStack: [...p.undoStack, p.materiales],
          materiales: p.materiales.map((m) => (m.id === item.id ? updated : m)),
          itemizadoVersion: version,
          historial: pushHistorial(p, {
            accion: 'Edición de ítem',
            elemento: `${item.intervencion} · ${item.descripcion}`,
            antes: prev ? `${prev.cantidad} ${prev.unidad}` : '—',
            despues: `${updated.cantidad} ${updated.unidad}`,
            comentario: 'Modificación manual (demostración).',
          }),
        }
      })
      notify('Ítem actualizado (registrado en el historial).', 'success')
    },
    [patchProcessing, notify],
  )

  const deleteMaterial = useCallback(
    (pid: string, matId: string) => {
      patchProcessing(pid, (p) => {
        const prev = p.materiales.find((m) => m.id === matId)
        const version = p.itemizadoVersion === 'inicial' ? 'modificado' : p.itemizadoVersion
        return {
          ...p,
          undoStack: [...p.undoStack, p.materiales],
          materiales: p.materiales.filter((m) => m.id !== matId),
          itemizadoVersion: version,
          historial: pushHistorial(p, {
            accion: 'Eliminación de ítem',
            elemento: prev ? `${prev.intervencion} · ${prev.descripcion}` : matId,
            antes: prev ? `${prev.cantidad} ${prev.unidad}` : '—',
            despues: 'Eliminado (modificación registrada)',
            comentario: 'La eliminación se registra, no se pierde trazabilidad.',
          }),
        }
      })
      notify('Ítem eliminado. La modificación quedó registrada.', 'warning')
    },
    [patchProcessing, notify],
  )

  const moveMaterial = useCallback(
    (pid: string, matId: string, intervencion: string) => {
      patchProcessing(pid, (p) => {
        const prev = p.materiales.find((m) => m.id === matId)
        if (!prev) return p
        const version = p.itemizadoVersion === 'inicial' ? 'modificado' : p.itemizadoVersion
        return {
          ...p,
          undoStack: [...p.undoStack, p.materiales],
          materiales: p.materiales.map((m) => (m.id === matId ? { ...m, intervencion } : m)),
          itemizadoVersion: version,
          historial: pushHistorial(p, {
            accion: 'Mover de intervención',
            elemento: prev.descripcion,
            antes: prev.intervencion,
            despues: intervencion,
            comentario: 'Reubicación de ítem (demostración).',
          }),
        }
      })
      notify('Ítem movido de intervención (registrado).', 'success')
    },
    [patchProcessing, notify],
  )

  const addObservacion = useCallback(
    (pid: string, matId: string, observacion: string) => {
      patchProcessing(pid, (p) => {
        const prev = p.materiales.find((m) => m.id === matId)
        return {
          ...p,
          undoStack: [...p.undoStack, p.materiales],
          materiales: p.materiales.map((m) => (m.id === matId ? { ...m, observacion } : m)),
          historial: pushHistorial(p, {
            accion: 'Observación',
            elemento: prev ? prev.descripcion : matId,
            antes: prev?.observacion || '—',
            despues: observacion || '—',
            comentario: 'Observación agregada (demostración).',
          }),
        }
      })
      notify('Observación registrada.', 'success')
    },
    [patchProcessing, notify],
  )

  const importItemizado = useCallback(
    (pid: string) => {
      patchProcessing(pid, (p) => ({
        ...p,
        preImport: p.materiales,
        undoStack: [...p.undoStack, p.materiales],
        materiales: materialsFor('importado'),
        itemizadoVersion: 'importado',
        historial: pushHistorial(p, {
          accion: 'Importación de Excel',
          elemento: 'Itemizado completo',
          antes: 'Itemizado anterior',
          despues: 'Escenario importado (reemplazo)',
          comentario: 'La importación reemplazó el itemizado. Operación reversible.',
        }),
      }))
      notify('Importación simulada aplicada. El itemizado fue reemplazado.', 'warning')
    },
    [patchProcessing, notify],
  )

  const exportItemizado = useCallback(
    (_pid: string) => {
      notify('Exportación simulada: no se generó ningún archivo.', 'info')
    },
    [notify],
  )

  const undoLast = useCallback(
    (pid: string) => {
      patchProcessing(pid, (p) => {
        if (p.undoStack.length === 0) return p
        const prev = p.undoStack[p.undoStack.length - 1]
        return {
          ...p,
          materiales: prev,
          undoStack: p.undoStack.slice(0, -1),
          historial: pushHistorial(p, {
            accion: 'Deshacer último cambio',
            elemento: 'Itemizado',
            antes: 'Estado posterior',
            despues: 'Estado anterior restaurado',
            comentario: 'Deshacer (demostración).',
          }),
        }
      })
      notify('Se deshizo el último cambio.', 'info')
    },
    [patchProcessing, notify],
  )

  const undoImport = useCallback(
    (pid: string) => {
      patchProcessing(pid, (p) => {
        if (!p.preImport) return p
        return {
          ...p,
          materiales: p.preImport,
          preImport: null,
          itemizadoVersion: 'modificado',
          historial: pushHistorial(p, {
            accion: 'Deshacer importación',
            elemento: 'Itemizado completo',
            antes: 'Escenario importado',
            despues: 'Itemizado previo a la importación',
            comentario: 'Importación revertida (demostración).',
          }),
        }
      })
      notify('Importación deshecha. Se restauró el itemizado previo.', 'info')
    },
    [patchProcessing, notify],
  )

  const resetItemizado = useCallback(
    (pid: string) => {
      patchProcessing(pid, (p) => ({
        ...p,
        materiales: materialsFor('inicial'),
        itemizadoVersion: 'inicial',
        undoStack: [],
        preImport: null,
        historial: [
          {
            id: `H-${++histSeq}`,
            fechaHora: nowISO(),
            accion: 'Restablecer itemizado inicial',
            elemento: 'Itemizado completo',
            antes: 'Estado modificado',
            despues: 'Estado base tras resolver alertas',
            comentario: 'No se reprocesa el pliego ni se alteran las detecciones.',
          },
          ...historialInicial(),
        ],
      }))
      notify('Itemizado restablecido al estado inicial.', 'success')
    },
    [patchProcessing, notify],
  )

  // -- memoria ---------------------------------------------------------------

  const initMemoria = useCallback(
    (pid: string, plantillaId: string) => {
      patchProcessing(pid, (p) => ({
        ...p,
        memoria: p.memoria ?? defaultMemoriaConfig(plantillaId),
        faltantes: p.faltantes.length ? p.faltantes : buildFaltantes(),
        stage: maxStage(p.stage, 'memoria'),
      }))
    },
    [patchProcessing],
  )

  const updateMemoria = useCallback(
    (pid: string, patch: Partial<MemoriaConfig>) => {
      patchProcessing(pid, (p) =>
        p.memoria ? { ...p, memoria: { ...p.memoria, ...patch } } : p,
      )
    },
    [patchProcessing],
  )

  const setFaltanteEstado = useCallback(
    (pid: string, falId: string, estado: DatoFaltante['estado'], valor?: string) => {
      patchProcessing(pid, (p) => ({
        ...p,
        faltantes: p.faltantes.map((f) =>
          f.id === falId ? { ...f, estado, valor: valor ?? f.valor } : f,
        ),
      }))
    },
    [patchProcessing],
  )

  const generateMemoria = useCallback(
    (pid: string) => {
      patchProcessing(pid, (p) => ({ ...p, memoriaGenerada: true, stage: maxStage(p.stage, 'memoria') }))
      notify('Vista previa de memoria generada (solo lectura).', 'success')
    },
    [patchProcessing, notify],
  )

  // -- base de conocimiento --------------------------------------------------

  const kbAddRecord = useCallback((slug: string, record: KBRecord) => {
    setState((s) => ({
      ...s,
      kbSections: s.kbSections.map((sec) =>
        sec.slug === slug ? { ...sec, records: [record, ...sec.records] } : sec,
      ),
    }))
  }, [])

  const kbEditRecord = useCallback((slug: string, record: KBRecord) => {
    setState((s) => ({
      ...s,
      kbSections: s.kbSections.map((sec) =>
        sec.slug === slug
          ? { ...sec, records: sec.records.map((r) => (r.id === record.id ? record : r)) }
          : sec,
      ),
    }))
  }, [])

  const kbDeleteRecord = useCallback((slug: string, recordId: string) => {
    setState((s) => ({
      ...s,
      kbSections: s.kbSections.map((sec) =>
        sec.slug === slug ? { ...sec, records: sec.records.filter((r) => r.id !== recordId) } : sec,
      ),
    }))
  }, [])

  const value = useMemo<DemoContextValue>(
    () => ({
      ...state,
      notify,
      dismissToast,
      resetDemo,
      getProcessing,
      createProcessing,
      toggleSection,
      confirmSections,
      setDetectionStatus,
      correctDetection,
      commentDetection,
      generateItemizado,
      addMaterial,
      editMaterial,
      deleteMaterial,
      moveMaterial,
      addObservacion,
      importItemizado,
      exportItemizado,
      undoLast,
      undoImport,
      resetItemizado,
      initMemoria,
      updateMemoria,
      setFaltanteEstado,
      generateMemoria,
      kbAddRecord,
      kbEditRecord,
      kbDeleteRecord,
    }),
    [
      state, notify, dismissToast, resetDemo, getProcessing, createProcessing, toggleSection,
      confirmSections, setDetectionStatus, correctDetection, commentDetection, generateItemizado,
      addMaterial, editMaterial, deleteMaterial, moveMaterial, addObservacion, importItemizado,
      exportItemizado, undoLast, undoImport, resetItemizado, initMemoria, updateMemoria,
      setFaltanteEstado, generateMemoria, kbAddRecord, kbEditRecord, kbDeleteRecord,
    ],
  )

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

// ---------------------------------------------------------------------------

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo debe usarse dentro de <DemoProvider>')
  return ctx
}

/** Alertas pendientes dentro del alcance incluido. */
export function pendingAlerts(p: Processing): number {
  return p.detecciones.filter((d) => d.estado === 'Pendiente').length
}

export function allAlertsResolved(p: Processing): boolean {
  return p.detecciones.length > 0 && pendingAlerts(p) === 0
}
