// ============================================================
// Tipos del dominio — prototipo visual (datos simulados)
// ============================================================

export type ProjectStatus = 'Pendiente de procesamiento' | 'En procesamiento' | 'Con procesamientos'

export interface Project {
  id: string
  nombre: string
  clienteOrganismo: string
  tipo: 'Público' | 'Privado'
  alcanceACotizar: string
  responsable: string
  fechaLimite: string | null
  estado: ProjectStatus
  documentos: {
    pliego: string
    excelReferencia: string
    memoriaReferencia: string
  }
}

// --- Procesamiento ---------------------------------------------------------

/** Pasos del flujo, en orden. El procesamiento guarda hasta dónde llegó. */
export type Stage = 'rangos' | 'secciones' | 'detecciones' | 'itemizado' | 'memoria'

export const STAGE_ORDER: Stage[] = ['rangos', 'secciones', 'detecciones', 'itemizado', 'memoria']

export const STAGE_LABEL: Record<Stage, string> = {
  rangos: 'Rangos y documento',
  secciones: 'Confirmación de secciones',
  detecciones: 'Revisión de detecciones',
  itemizado: 'Itemizado',
  memoria: 'Memoria descriptiva',
}

export interface PageRange {
  id: string
  desde: number
  hasta: number
}

export interface DetectedSection {
  id: string
  titulo: string
  descripcion: string
  paginaDesde: number
  paginaHasta: number
  incluida: boolean
  simulada: boolean
}

export type DetectionOrigin = 'Texto' | 'Tabla' | 'Imagen o plano'

export type DetectionType =
  | 'Posible pieza'
  | 'Cantidad no indicada'
  | 'Posible referencia repetida'
  | 'Posibles unidades adicionales'
  | 'Ambigüedad técnica'
  | 'Requisito especial'

export type DetectionStatus = 'Pendiente' | 'Confirmada' | 'Corregida' | 'Descartada'

export interface Detection {
  id: string
  tipo: DetectionType
  origen: DetectionOrigin
  seccionId: string
  seccionTitulo: string
  pagina: number
  fragmento: string
  descripcionPieza: string
  cantidad: number | null
  unidad: string | null
  confianza: number // 0..1 simulada
  estado: DetectionStatus
  comentario: string
}

// --- Itemizado -------------------------------------------------------------

export interface MaterialItem {
  id: string
  intervencion: string
  item: number
  cantidad: number
  unidad: string
  descripcion: string
  codigo: string
  marca: string
  valorUnitario: number
  importe: number
  observacion?: string
}

export interface Intervencion {
  codigo: string
  titulo: string
}

export interface PotenciaRow {
  id: string
  item: number
  cantidad: number
  unidad: string
  descripcion: string
  potenciaHP: number
  potenciaW: number
  corrienteA: number
}

export interface DescripcionAuxiliar {
  id: string
  material: string
  aplicacion: string
  descripcionCombinada: string
}

export interface ManoObraGroupRow {
  concepto: string
  valor: string
}

export interface ManoObraGroup {
  titulo: string
  descripcion?: string
  rows: ManoObraGroupRow[]
}

export type ItemizadoVersion = 'inicial' | 'modificado' | 'importado'

export interface HistorialEntry {
  id: string
  fechaHora: string
  accion: string
  elemento: string
  antes: string
  despues: string
  comentario: string
}

// --- Memoria ---------------------------------------------------------------

export interface MemoriaConfig {
  plantillaId: string
  logo: boolean
  titulo: string
  encabezado: string
  pie: string
  secciones: { id: string; nombre: string; incluida: boolean }[]
}

export type DatoFaltanteEstado = 'faltante' | 'completado-web' | 'completado-abm' | 'omitido'

export interface DatoFaltante {
  id: string
  campo: string
  descripcion: string
  estado: DatoFaltanteEstado
  valor?: string
}

export interface Processing {
  id: string
  projectId: string
  fechaHora: string
  pdfNombre: string
  rangos: PageRange[]
  numeracionImpresaDisponible: boolean
  stage: Stage // paso más avanzado alcanzado
  secciones: DetectedSection[]
  detecciones: Detection[]
  itemizadoGenerado: boolean
  itemizadoVersion: ItemizadoVersion
  materiales: MaterialItem[]
  undoStack: MaterialItem[][]
  preImport: MaterialItem[] | null
  historial: HistorialEntry[]
  memoria: MemoriaConfig | null
  faltantes: DatoFaltante[]
  memoriaGenerada: boolean
}

// --- Base de conocimiento --------------------------------------------------

export interface KBRecordBase {
  id: string
  fechaActualizacion: string
}

export interface KBMaterial extends KBRecordBase {
  codigoInterno: string
  referenciaComercial: string
  descripcion: string
  marca: string
  unidad: string
  caracteristicas: string
  dimensiones: string
  clasificacion: string
  documentos: string
  fuente: string
}

export interface KBGenericRecord extends KBRecordBase {
  nombre: string
  detalle: string
  [key: string]: string
}
