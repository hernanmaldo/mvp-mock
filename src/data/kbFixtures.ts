// ============================================================
// Base de conocimiento — ABM visual. Registros de demostración.
// ============================================================

import type { LucideIcon } from 'lucide-react'
import {
  Boxes, Tags, DollarSign, Shuffle, Clock, Truck, Wrench,
  Briefcase, History, BookMarked, FileText, Library, ScrollText,
} from 'lucide-react'

export type KBFieldType = 'text' | 'textarea' | 'number'

export interface KBField {
  key: string
  label: string
  type: KBFieldType
  primary?: boolean // aparece como columna de la tabla
  required?: boolean
}

export interface KBRecord {
  id: string
  [key: string]: string
}

export interface KBSectionDef {
  slug: string
  titulo: string
  descripcion: string
  icon: LucideIcon
  readonly?: boolean // p. ej. historial de modificaciones
  fields: KBField[]
  records: KBRecord[]
  nota?: string
}

let n = 0
const rid = (p: string) => `${p}-${(++n).toString().padStart(3, '0')}`

export const KB_SECTIONS: KBSectionDef[] = [
  {
    slug: 'materiales',
    titulo: 'Materiales y características técnicas',
    descripcion: 'Fichas de materiales con datos técnicos y documentación de fabricantes.',
    icon: Boxes,
    nota: 'No hay conexión con Schneider Electric ni se solicitan credenciales. No se presenta una marca como proveedor comercial cuando esa relación no está definida.',
    fields: [
      { key: 'codigoInterno', label: 'Código interno', type: 'text', primary: true, required: true },
      { key: 'referenciaComercial', label: 'Referencia comercial', type: 'text', primary: true },
      { key: 'descripcion', label: 'Descripción', type: 'textarea', primary: true, required: true },
      { key: 'marca', label: 'Marca', type: 'text', primary: true },
      { key: 'unidad', label: 'Unidad', type: 'text' },
      { key: 'caracteristicas', label: 'Características técnicas', type: 'textarea' },
      { key: 'dimensiones', label: 'Dimensiones', type: 'text' },
      { key: 'clasificacion', label: 'Clasificación', type: 'text' },
      { key: 'documentos', label: 'Documentos e imágenes', type: 'text' },
      { key: 'fuente', label: 'Fuente', type: 'text' },
      { key: 'fechaActualizacion', label: 'Fecha de actualización', type: 'text' },
    ],
    records: [
      {
        id: rid('MAT'), codigoInterno: 'INT-TM-0425', referenciaComercial: 'EZ9F34425',
        descripcion: 'Interruptor termomagnético 4×25 A, 4,5 kA, curva C',
        marca: 'Schneider', unidad: 'UDS',
        caracteristicas: '4 polos · In 25 A · Icn 4,5 kA · curva C',
        dimensiones: '72 × 85 × 72 mm', clasificacion: 'Protección eléctrica',
        documentos: 'ficha-ez9f34425.pdf', fuente: 'Catálogo fabricante',
        fechaActualizacion: '2026-09-12',
      },
      {
        id: rid('MAT'), codigoInterno: 'GAB-IP65-45', referenciaComercial: 'E454515',
        descripcion: 'Gabinete estanco IP65 450×450×150',
        marca: 'Forli', unidad: 'UDS',
        caracteristicas: 'IP65 · policarbonato · a la intemperie',
        dimensiones: '450 × 450 × 150 mm', clasificacion: 'Envolventes',
        documentos: '—', fuente: 'Relevamiento interno',
        fechaActualizacion: '2026-08-30',
      },
      {
        id: rid('MAT'), codigoInterno: 'CBL-SUBT-44', referenciaComercial: '-',
        descripcion: 'Cable subterráneo de cobre 4×4 mm²',
        marca: '-', unidad: 'MTS',
        caracteristicas: '0,6/1 kV · aislación XLPE · 4 conductores',
        dimensiones: 'Ø ext. 14 mm aprox.', clasificacion: 'Conductores',
        documentos: '—', fuente: 'Especificación genérica',
        fechaActualizacion: '2026-10-01',
      },
    ],
  },
  {
    slug: 'marcas',
    titulo: 'Marcas y proveedores',
    descripcion: 'Registro de marcas y proveedores conocidos.',
    icon: Tags,
    nota: 'La relación marca–proveedor comercial solo se registra cuando está definida.',
    fields: [
      { key: 'nombre', label: 'Nombre', type: 'text', primary: true, required: true },
      { key: 'tipo', label: 'Tipo', type: 'text', primary: true },
      { key: 'rubro', label: 'Rubro', type: 'text', primary: true },
      { key: 'contacto', label: 'Contacto', type: 'text', primary: true },
      { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
      { key: 'fechaActualizacion', label: 'Fecha de actualización', type: 'text' },
    ],
    records: [
      { id: rid('MAR'), nombre: 'Schneider', tipo: 'Marca', rubro: 'Aparamenta eléctrica', contacto: '—', observaciones: 'Relación comercial no definida.', fechaActualizacion: '2026-09-10' },
      { id: rid('MAR'), nombre: 'Conextube', tipo: 'Marca', rubro: 'Cajas y canalizaciones', contacto: '—', observaciones: '', fechaActualizacion: '2026-07-22' },
      { id: rid('MAR'), nombre: 'Distribuidora Litoral', tipo: 'Proveedor', rubro: 'Mayorista eléctrico', contacto: 'ventas@demo.example', observaciones: 'Proveedor habitual (ejemplo de demostración).', fechaActualizacion: '2026-10-15' },
    ],
  },
  {
    slug: 'precios',
    titulo: 'Precios de referencia',
    descripcion: 'Valores de referencia. No se presentan como precios vigentes.',
    icon: DollarSign,
    nota: 'Los valores son de referencia y no representan precios vigentes. La moneda se indica solo cuando está identificada.',
    fields: [
      { key: 'material', label: 'Material', type: 'text', primary: true, required: true },
      { key: 'valor', label: 'Valor de referencia', type: 'text', primary: true },
      { key: 'moneda', label: 'Moneda', type: 'text', primary: true },
      { key: 'fuente', label: 'Fuente', type: 'text', primary: true },
      { key: 'fechaActualizacion', label: 'Fecha de actualización', type: 'text', primary: true },
      { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
    ],
    records: [
      { id: rid('PRE'), material: 'Interruptor termomagnético 4×25 A', valor: '19,87', moneda: 'USD', fuente: 'Lista referencia', fechaActualizacion: '2026-09-01', observaciones: 'Valor de referencia, no vigente.' },
      { id: rid('PRE'), material: 'Cable subterráneo Cu 4×4 mm²', valor: '3,20', moneda: 'USD / m', fuente: 'Lista referencia', fechaActualizacion: '2026-09-01', observaciones: '' },
      { id: rid('PRE'), material: 'Caño corrugado PVC 3/4"', valor: 'Sin identificar', moneda: 'Sin identificar', fuente: 'Relevamiento', fechaActualizacion: '2026-10-05', observaciones: 'Moneda no identificada en la fuente.' },
    ],
  },
  {
    slug: 'equivalencias',
    titulo: 'Equivalencias',
    descripcion: 'Equivalencias entre referencias de distintas marcas.',
    icon: Shuffle,
    fields: [
      { key: 'origen', label: 'Referencia origen', type: 'text', primary: true, required: true },
      { key: 'equivalente', label: 'Referencia equivalente', type: 'text', primary: true, required: true },
      { key: 'marcaOrigen', label: 'Marca origen', type: 'text', primary: true },
      { key: 'marcaEquivalente', label: 'Marca equivalente', type: 'text', primary: true },
      { key: 'nivel', label: 'Nivel de equivalencia', type: 'text', primary: true },
      { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
      { key: 'fechaActualizacion', label: 'Fecha de actualización', type: 'text' },
    ],
    records: [
      { id: rid('EQV'), origen: 'EZ9F34425', equivalente: 'BMS412525', marcaOrigen: 'Schneider', marcaEquivalente: 'Genérica', nivel: 'Funcional', observaciones: 'Equivalencia de demostración.', fechaActualizacion: '2026-08-18' },
      { id: rid('EQV'), origen: 'E454515', equivalente: 'GAB-45X45', marcaOrigen: 'Forli', marcaEquivalente: 'Genérica', nivel: 'Dimensional', observaciones: '', fechaActualizacion: '2026-08-18' },
    ],
  },
  {
    slug: 'mano-obra',
    titulo: 'Mano de obra y tiempos estándar',
    descripcion: 'Rendimientos y valores de referencia de mano de obra.',
    icon: Clock,
    fields: [
      { key: 'tarea', label: 'Tarea', type: 'text', primary: true, required: true },
      { key: 'unidad', label: 'Unidad', type: 'text', primary: true },
      { key: 'rendimiento', label: 'Rendimiento estándar', type: 'text', primary: true },
      { key: 'categoria', label: 'Categoría', type: 'text', primary: true },
      { key: 'valorHora', label: 'Valor hora (referencia)', type: 'text', primary: true },
      { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
      { key: 'fechaActualizacion', label: 'Fecha de actualización', type: 'text' },
    ],
    records: [
      { id: rid('MOB'), tarea: 'Tendido de cable subterráneo', unidad: 'm', rendimiento: '25 m/h (cuadrilla)', categoria: 'Oficial + ayudante', valorHora: '$ 4.443', observaciones: 'Valor de referencia.', fechaActualizacion: '2026-09-20' },
      { id: rid('MOB'), tarea: 'Montaje de tablero seccional', unidad: 'ud', rendimiento: '8 h/ud', categoria: 'Oficial especializado', valorHora: '$ 5.100', observaciones: '', fechaActualizacion: '2026-09-20' },
      { id: rid('MOB'), tarea: 'Canalización subterránea', unidad: 'm', rendimiento: '15 m/h (cuadrilla)', categoria: 'Cuadrilla', valorHora: '$ 4.443', observaciones: '', fechaActualizacion: '2026-09-20' },
    ],
  },
  {
    slug: 'logistica',
    titulo: 'Logística y vehículos',
    descripcion: 'Vehículos, kilometrajes y costos logísticos de referencia.',
    icon: Truck,
    fields: [
      { key: 'vehiculo', label: 'Vehículo', type: 'text', primary: true, required: true },
      { key: 'valorVehiculo', label: 'Valor del vehículo', type: 'text', primary: true },
      { key: 'kmEsperado', label: 'Kilometraje esperado', type: 'text', primary: true },
      { key: 'combustible', label: 'Combustible', type: 'text', primary: true },
      { key: 'amortizacion', label: 'Amortización', type: 'text', primary: true },
      { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
      { key: 'fechaActualizacion', label: 'Fecha de actualización', type: 'text' },
    ],
    records: [
      { id: rid('LOG'), vehiculo: 'Camioneta utilitaria', valorVehiculo: '$ 35.000.000', kmEsperado: '120.000 km', combustible: '$ 1.720 / l', amortizacion: '$ 290 / km', observaciones: 'Referencia de demostración.', fechaActualizacion: '2026-10-02' },
      { id: rid('LOG'), vehiculo: 'Camión con hidrogrúa', valorVehiculo: '$ 120.000.000', kmEsperado: '200.000 km', combustible: '$ 1.720 / l', amortizacion: '$ 600 / km', observaciones: '', fechaActualizacion: '2026-10-02' },
    ],
  },
  {
    slug: 'equipos',
    titulo: 'Equipos y alquileres',
    descripcion: 'Equipos propios y de alquiler con valores de referencia.',
    icon: Wrench,
    fields: [
      { key: 'equipo', label: 'Equipo', type: 'text', primary: true, required: true },
      { key: 'modalidad', label: 'Modalidad', type: 'text', primary: true },
      { key: 'valor', label: 'Valor de referencia', type: 'text', primary: true },
      { key: 'unidad', label: 'Unidad', type: 'text', primary: true },
      { key: 'proveedor', label: 'Proveedor', type: 'text', primary: true },
      { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
      { key: 'fechaActualizacion', label: 'Fecha de actualización', type: 'text' },
    ],
    records: [
      { id: rid('EQP'), equipo: 'Retroexcavadora', modalidad: 'Alquiler', valor: '$ 450.000 / día', unidad: 'día', proveedor: 'Por definir', observaciones: 'Referencia.', fechaActualizacion: '2026-09-28' },
      { id: rid('EQP'), equipo: 'Grupo electrógeno 60 kVA', modalidad: 'Alquiler', valor: '$ 180.000 / día', unidad: 'día', proveedor: 'Por definir', observaciones: '', fechaActualizacion: '2026-09-28' },
    ],
  },
  {
    slug: 'administracion',
    titulo: 'Administración, ingeniería y puesta en marcha',
    descripcion: 'Parámetros de administración, ingeniería y puesta en marcha.',
    icon: Briefcase,
    fields: [
      { key: 'concepto', label: 'Concepto', type: 'text', primary: true, required: true },
      { key: 'base', label: 'Base de cálculo', type: 'text', primary: true },
      { key: 'asignacion', label: 'Asignación', type: 'text', primary: true },
      { key: 'valor', label: 'Valor de referencia', type: 'text', primary: true },
      { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
      { key: 'fechaActualizacion', label: 'Fecha de actualización', type: 'text' },
    ],
    records: [
      { id: rid('ADM'), concepto: 'Administración de obra', base: 'Sueldo administrativo', asignacion: '5 %', valor: '$ 1.500.000', observaciones: 'Referencia.', fechaActualizacion: '2026-10-10' },
      { id: rid('ADM'), concepto: 'Proyecto eléctrico y planimetría', base: 'Sueldo profesional', asignacion: '40 %', valor: '$ 1.500.000', observaciones: '', fechaActualizacion: '2026-10-10' },
      { id: rid('ADM'), concepto: 'Puesta en marcha', base: 'Jornadas', asignacion: '3 jornadas', valor: 'A definir', observaciones: '', fechaActualizacion: '2026-10-10' },
    ],
  },
  {
    slug: 'normas',
    titulo: 'Normas y reglas',
    descripcion: 'Normas técnicas y reglas aplicables de referencia.',
    icon: ScrollText,
    fields: [
      { key: 'codigo', label: 'Código', type: 'text', primary: true, required: true },
      { key: 'nombre', label: 'Nombre', type: 'text', primary: true, required: true },
      { key: 'ambito', label: 'Ámbito', type: 'text', primary: true },
      { key: 'estado', label: 'Estado', type: 'text', primary: true },
      { key: 'detalle', label: 'Detalle', type: 'textarea' },
      { key: 'fechaActualizacion', label: 'Fecha de actualización', type: 'text' },
    ],
    records: [
      { id: rid('NOR'), codigo: 'AEA 90364', nombre: 'Reglamentación para instalaciones eléctricas', ambito: 'Baja tensión', estado: 'Vigente (referencia)', detalle: 'Referencia general de demostración.', fechaActualizacion: '2026-06-15' },
      { id: rid('NOR'), codigo: 'IEC 60529', nombre: 'Grados de protección (IP)', ambito: 'Envolventes', estado: 'Vigente (referencia)', detalle: 'Clasificación IP de envolventes.', fechaActualizacion: '2026-06-15' },
    ],
  },
  {
    slug: 'plantillas',
    titulo: 'Plantillas de documentos',
    descripcion: 'Plantillas para memorias y documentos. Configuración visual determinista.',
    icon: Library,
    nota: 'La configuración visual de la plantilla es determinista y no requiere IA.',
    fields: [
      { key: 'nombre', label: 'Nombre', type: 'text', primary: true, required: true },
      { key: 'titulo', label: 'Título', type: 'text', primary: true },
      { key: 'logo', label: 'Logo', type: 'text', primary: true },
      { key: 'encabezado', label: 'Encabezado', type: 'text' },
      { key: 'pie', label: 'Pie', type: 'text' },
      { key: 'secciones', label: 'Secciones incluidas', type: 'textarea' },
      { key: 'orden', label: 'Orden de secciones', type: 'text' },
      { key: 'fechaActualizacion', label: 'Fecha de actualización', type: 'text' },
    ],
    records: [
      { id: 'PL-ELECTRO', nombre: 'Memoria electromecánica', titulo: 'Memoria descriptiva — Instalación electromecánica', logo: 'Tecnowatt (isologo)', encabezado: 'Tecnowatt · Ingeniería electromecánica', pie: 'Documento de demostración', secciones: 'Portada, Introducción, Normativa, Envolventes, Unidades funcionales, Tableros, Ingeniería de detalle, Ensayos, Montaje, Conclusión', orden: 'Secuencial', fechaActualizacion: '2026-10-20' },
      { id: 'PL-SIMPLE', nombre: 'Memoria resumida', titulo: 'Memoria descriptiva — Resumen técnico', logo: 'Tecnowatt (isologo)', encabezado: 'Tecnowatt', pie: 'Documento de demostración', secciones: 'Portada, Introducción, Descripción general, Conclusión', orden: 'Secuencial', fechaActualizacion: '2026-10-20' },
    ],
  },
  {
    slug: 'contenido-memorias',
    titulo: 'Contenido técnico para memorias',
    descripcion: 'Bloques de texto técnico reutilizables en memorias.',
    icon: FileText,
    fields: [
      { key: 'titulo', label: 'Título del bloque', type: 'text', primary: true, required: true },
      { key: 'seccion', label: 'Sección de destino', type: 'text', primary: true },
      { key: 'texto', label: 'Texto', type: 'textarea', primary: true, required: true },
      { key: 'etiquetas', label: 'Etiquetas', type: 'text' },
      { key: 'fechaActualizacion', label: 'Fecha de actualización', type: 'text' },
    ],
    records: [
      { id: rid('CMT'), titulo: 'Alcance técnico — estación de bombeo', seccion: 'Introducción y alcance técnico', texto: 'La presente memoria describe la provisión y montaje del equipamiento electromecánico de la estación de bombeo (contenido de demostración).', etiquetas: 'alcance, bombeo', fechaActualizacion: '2026-10-11' },
      { id: rid('CMT'), titulo: 'Base normativa', seccion: 'Normativa y base de diseño', texto: 'El diseño toma como referencia la reglamentación AEA 90364 y la clasificación IP según IEC 60529 (contenido de demostración, sin afirmar cumplimiento verificado).', etiquetas: 'normas', fechaActualizacion: '2026-10-11' },
    ],
  },
  {
    slug: 'proyectos-historicos',
    titulo: 'Proyectos históricos',
    descripcion: 'Proyectos anteriores sugeridos por similitud. Son sugerencias, no reutilización automática.',
    icon: BookMarked,
    nota: 'Las sugerencias no sobrescriben el itemizado. No se presentan porcentajes de similitud calculados.',
    fields: [
      { key: 'nombre', label: 'Proyecto', type: 'text', primary: true, required: true },
      { key: 'motivo', label: 'Motivo de similitud', type: 'textarea', primary: true },
      { key: 'informacion', label: 'Información disponible', type: 'text', primary: true },
      { key: 'estado', label: 'Estado', type: 'text', primary: true },
      { key: 'comentario', label: 'Comentario', type: 'textarea' },
      { key: 'fechaActualizacion', label: 'Fecha de actualización', type: 'text' },
    ],
    records: [
      { id: rid('PRH'), nombre: 'Estación de bombeo Reconquista', motivo: 'Equipamiento electromecánico y tableros de alimentación comparables.', informacion: 'Itemizado, memoria, mano de obra', estado: 'Sugerido', comentario: '', fechaActualizacion: '2026-05-04' },
      { id: rid('PRH'), nombre: 'Iluminación exterior Coop. Ganadera', motivo: 'Tableros seccionales y canalizaciones subterráneas similares.', informacion: 'Itemizado (Excel de referencia)', estado: 'Sugerido', comentario: '', fechaActualizacion: '2026-03-19' },
    ],
  },
  {
    slug: 'historial',
    titulo: 'Historial de modificaciones',
    descripcion: 'Registro de cambios de la base de conocimiento (representativo).',
    icon: History,
    readonly: true,
    fields: [
      { key: 'fechaActualizacion', label: 'Fecha y hora', type: 'text', primary: true },
      { key: 'accion', label: 'Acción', type: 'text', primary: true },
      { key: 'elemento', label: 'Elemento', type: 'text', primary: true },
      { key: 'usuario', label: 'Usuario', type: 'text', primary: true },
      { key: 'comentario', label: 'Comentario', type: 'textarea', primary: true },
    ],
    records: [
      { id: rid('HKB'), fechaActualizacion: '2026-10-20 10:14', accion: 'Alta', elemento: 'Plantilla "Memoria electromecánica"', usuario: 'Equipo de Cotizaciones', comentario: 'Registro de demostración.' },
      { id: rid('HKB'), fechaActualizacion: '2026-10-15 16:40', accion: 'Edición', elemento: 'Proveedor "Distribuidora Litoral"', usuario: 'Equipo de Cotizaciones', comentario: 'Actualización de contacto.' },
      { id: rid('HKB'), fechaActualizacion: '2026-10-01 09:05', accion: 'Alta', elemento: 'Material "Cable subterráneo Cu 4×4"', usuario: 'Equipo de Cotizaciones', comentario: '' },
    ],
  },
]

export function cloneKBSections(): KBSectionDef[] {
  return KB_SECTIONS.map((s) => ({
    ...s,
    fields: s.fields.map((f) => ({ ...f })),
    records: s.records.map((r) => ({ ...r })),
  }))
}
