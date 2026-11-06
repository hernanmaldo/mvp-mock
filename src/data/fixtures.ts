// ============================================================
// Fixtures de demostración. TODO es simulado: no proviene de un
// procesamiento real del pliego activo. Los materiales son una
// MUESTRA tomada del Excel de referencia (iluminación exterior),
// no del pliego del Acueducto San Javier.
// ============================================================

import type {
  Project,
  DetectedSection,
  Detection,
  MaterialItem,
  Intervencion,
  PotenciaRow,
  DescripcionAuxiliar,
  ManoObraGroup,
  HistorialEntry,
  MemoriaConfig,
  DatoFaltante,
} from '../types'

export const DEMO_PLIEGO = 'Pliego-Acu-SanJavier-EtapaTostado-VillaMinetti-v3.pdf'

// --- Proyecto precargado ---------------------------------------------------

export const INITIAL_PROJECT: Project = {
  id: 'PR-001',
  nombre: 'Acueducto San Javier · Etapa Tostado–Villa Minetti',
  clienteOrganismo: 'Por definir',
  tipo: 'Público',
  alcanceACotizar: 'Alcance parcial a seleccionar por rangos y secciones',
  responsable: 'Equipo de Cotizaciones',
  fechaLimite: null,
  estado: 'Pendiente de procesamiento',
  documentos: {
    pliego: DEMO_PLIEGO,
    excelReferencia: 'MATERIALES Y GASTOS ILUMINACIÓN EXTERIOR COOP GANADERA.XLSX',
    memoriaReferencia: 'MEMORIA DESCRIPTIVA PLANTA DE TRATAMIENTO CONCEPCIÓN DEL URUGUAY-REV1.pdf',
  },
}

// --- Secciones detectadas (fixtures) ---------------------------------------

export function buildSections(): DetectedSection[] {
  return [
    {
      id: 'SEC-1',
      titulo: 'Especificaciones técnicas de equipamiento electromecánico',
      descripcion:
        'Requisitos de bombas, motores y accesorios electromecánicos para estaciones de bombeo.',
      paginaDesde: 12,
      paginaHasta: 28,
      incluida: true,
      simulada: true,
    },
    {
      id: 'SEC-2',
      titulo: 'Suministro de energía y tableros',
      descripcion:
        'Alimentación eléctrica, tableros seccionales, protecciones y tendidos asociados.',
      paginaDesde: 29,
      paginaHasta: 41,
      incluida: true,
      simulada: true,
    },
    {
      id: 'SEC-3',
      titulo: 'Automatismo, control y telemetría',
      descripcion:
        'Lógica de control, instrumentación, caudalímetros y comunicación de la estación.',
      paginaDesde: 42,
      paginaHasta: 53,
      incluida: true,
      simulada: true,
    },
    {
      id: 'SEC-4',
      titulo: 'Obra civil complementaria',
      descripcion:
        'Tareas civiles de apoyo no electromecánicas. Fuera del foco de cotización electromecánica.',
      paginaDesde: 54,
      paginaHasta: 60,
      incluida: true,
      simulada: true,
    },
  ]
}

// --- Detecciones y alertas (fixtures) --------------------------------------
// Las secciones excluidas no aportan alertas al escenario mostrado. El filtro
// por alcance se aplica en el store según las secciones incluidas.

export function buildDetections(): Detection[] {
  return [
    {
      id: 'ALT-01',
      tipo: 'Posible pieza',
      origen: 'Texto',
      seccionId: 'SEC-1',
      seccionTitulo: 'Especificaciones técnicas de equipamiento electromecánico',
      pagina: 14,
      fragmento:
        '«… se proveerá una electrobomba sumergible de eje vertical, acople directo, apta para servicio continuo …»',
      descripcionPieza: 'Electrobomba sumergible de eje vertical (servicio continuo)',
      cantidad: null,
      unidad: null,
      confianza: 0.88,
      estado: 'Pendiente',
      comentario: '',
    },
    {
      id: 'ALT-02',
      tipo: 'Cantidad no indicada',
      origen: 'Texto',
      seccionId: 'SEC-1',
      seccionTitulo: 'Especificaciones técnicas de equipamiento electromecánico',
      pagina: 15,
      fragmento:
        '«… se instalarán válvulas de retención en la impulsión, según corresponda al diseño …»',
      descripcionPieza: 'Válvula de retención para impulsión',
      cantidad: null,
      unidad: null,
      confianza: 0.72,
      estado: 'Pendiente',
      comentario: '',
    },
    {
      id: 'ALT-03',
      tipo: 'Posible pieza',
      origen: 'Tabla',
      seccionId: 'SEC-2',
      seccionTitulo: 'Suministro de energía y tableros',
      pagina: 31,
      fragmento:
        'Tabla 4.2 — Tablero seccional: interruptor termomagnético tetrapolar 4×25 A, poder de corte 4,5 kA.',
      descripcionPieza: 'Interruptor termomagnético 4×25 A, 4,5 kA',
      cantidad: 3,
      unidad: 'UDS',
      confianza: 0.81,
      estado: 'Pendiente',
      comentario: '',
    },
    {
      id: 'ALT-04',
      tipo: 'Posible referencia repetida',
      origen: 'Tabla',
      seccionId: 'SEC-2',
      seccionTitulo: 'Suministro de energía y tableros',
      pagina: 33,
      fragmento:
        'La protección diferencial 4×25 A 30 mA aparece referida en el tablero seccional y nuevamente en el detalle de montaje.',
      descripcionPieza: 'Interruptor diferencial 4×25 A 30 mA',
      cantidad: 1,
      unidad: 'UDS',
      confianza: 0.6,
      estado: 'Pendiente',
      comentario: '',
    },
    {
      id: 'ALT-05',
      tipo: 'Ambigüedad técnica',
      origen: 'Texto',
      seccionId: 'SEC-2',
      seccionTitulo: 'Suministro de energía y tableros',
      pagina: 37,
      fragmento:
        '«… conductor subterráneo de cobre de sección adecuada …» sin especificar mm² para el tramo de alimentación.',
      descripcionPieza: 'Cable subterráneo de cobre (sección a definir)',
      cantidad: null,
      unidad: null,
      confianza: 0.55,
      estado: 'Pendiente',
      comentario: '',
    },
    {
      id: 'ALT-06',
      tipo: 'Posibles unidades adicionales',
      origen: 'Imagen o plano',
      seccionId: 'SEC-3',
      seccionTitulo: 'Automatismo, control y telemetría',
      pagina: 45,
      fragmento:
        'Plano E-03 (vista de demostración): se observan dos posiciones de caudalímetro no reflejadas en el texto.',
      descripcionPieza: 'Caudalímetro electromagnético',
      cantidad: 2,
      unidad: 'UDS',
      confianza: 0.49,
      estado: 'Pendiente',
      comentario: '',
    },
    {
      id: 'ALT-07',
      tipo: 'Requisito especial',
      origen: 'Texto',
      seccionId: 'SEC-3',
      seccionTitulo: 'Automatismo, control y telemetría',
      pagina: 49,
      fragmento:
        '«… el oferente deberá garantizar grado de protección IP65 en los gabinetes a la intemperie …»',
      descripcionPieza: 'Requisito: gabinetes IP65 a la intemperie',
      cantidad: null,
      unidad: null,
      confianza: 0.9,
      estado: 'Pendiente',
      comentario: '',
    },
    {
      id: 'ALT-08',
      tipo: 'Posible pieza',
      origen: 'Imagen o plano',
      seccionId: 'SEC-3',
      seccionTitulo: 'Automatismo, control y telemetría',
      pagina: 51,
      fragmento:
        'Plano E-05 (vista de demostración): tablero de automatismo con contactor y guardamotor.',
      descripcionPieza: 'Contactor 25 A 3P + guardamotor',
      cantidad: 1,
      unidad: 'UDS',
      confianza: 0.77,
      estado: 'Pendiente',
      comentario: '',
    },
  ]
}

// --- Itemizado: intervenciones y materiales base ---------------------------

export const INTERVENCIONES: Intervencion[] = [
  { codigo: '1.1', titulo: 'INTERVENCIÓN EN TABLERO SECCIONAL NORTE EXISTENTE' },
  { codigo: '1.2', titulo: 'PROVISIÓN E INSTALACIÓN DE TABLERO SECCIONAL DE ILUMINACIÓN EXTERIOR' },
  { codigo: '1.3', titulo: 'TENDIDO DE CONDUCTORES Y CANALIZACIONES SUBTERRÁNEAS' },
  { codigo: '1.4', titulo: 'CANALIZACIONES EN SECTOR DE ESTACIONAMIENTO' },
  { codigo: '1.5', titulo: 'CANALIZACIONES EN SECTOR INGRESO' },
]

let _mid = 0
const mid = () => `MAT-${(++_mid).toString().padStart(3, '0')}`

function baseMaterials(): MaterialItem[] {
  _mid = 0
  return [
    {
      id: mid(), intervencion: '1.1', item: 1, cantidad: 1, unidad: 'UDS',
      descripcion: 'CAJA EMB P/TERMOMAG 20(24) MOD C/PUERTA FUME 344X272X61mm BOMBE - 45000074',
      codigo: '-', marca: 'CONEXTUBE', valorUnitario: 10.641006921122566, importe: 10.641006921122566,
    },
    {
      id: mid(), intervencion: '1.1', item: 2, cantidad: 1, unidad: 'UDS',
      descripcion: 'INT. TERMOMAG. EASY9 4X25A 4,5KA C',
      codigo: 'EZ9F34425', marca: 'SCHNEIDER', valorUnitario: 19.87, importe: 19.87,
    },
    {
      id: mid(), intervencion: '1.1', item: 3, cantidad: 10, unidad: 'MTS',
      descripcion: 'CABLE CU/PVC FLEX 1X 6MM2 NEGRO',
      codigo: '1011', marca: 'FONSECA', valorUnitario: 1.1184767689746811, importe: 11.18476768974681,
    },
    {
      id: mid(), intervencion: '1.2', item: 1, cantidad: 1, unidad: 'UDS',
      descripcion: 'Gabinete estanco F60 IP65 450X450X150',
      codigo: 'E454515', marca: 'FORLI', valorUnitario: 59.27519434628976, importe: 59.27519434628976,
    },
    {
      id: mid(), intervencion: '1.2', item: 3, cantidad: 1, unidad: 'UDS',
      descripcion: 'INT. DIFERENCIAL EASY9 4X25A 30MA AC',
      codigo: 'EZ9R36425', marca: 'SCHNEIDER', valorUnitario: 56.39, importe: 56.39,
    },
    {
      id: mid(), intervencion: '1.2', item: 4, cantidad: 1, unidad: 'UDS',
      descripcion: 'CONT. 25A 3P 220VCA 50/60HZ AUX NC',
      codigo: 'LC1E2501M7', marca: 'SCHNEIDER', valorUnitario: 35.14, importe: 35.14,
    },
    {
      id: mid(), intervencion: '1.2', item: 5, cantidad: 2, unidad: 'UDS',
      descripcion: 'INT. TERMOMAG. EASY9 2X10A 4,5KA C',
      codigo: 'EZ9F34210', marca: 'SCHNEIDER', valorUnitario: 9.08, importe: 18.16,
    },
    {
      id: mid(), intervencion: '1.3', item: 1, cantidad: 80, unidad: 'MTS',
      descripcion: 'CABLE SUBT CU 4X 4MM2',
      codigo: '-', marca: '-', valorUnitario: 3.1980842799988318, importe: 255.84674239990653,
    },
    {
      id: mid(), intervencion: '1.3', item: 3, cantidad: 200, unidad: 'MTS',
      descripcion: 'CABLE SUBT CU 3X 2.5MM2',
      codigo: '-', marca: '-', valorUnitario: 1.6447741144175452, importe: 328.95482288350905,
    },
    {
      id: mid(), intervencion: '1.4', item: 1, cantidad: 30, unidad: 'MTS',
      descripcion: 'KSRV100L CAÑO FE LIVIANO GALV CALIENTE RIG 1 PULGADA X MT',
      codigo: 'KSRV 100 L', marca: 'MICROCONTROL', valorUnitario: 2.835031977338434, importe: 85.05095932015303,
    },
    // Ítem sintético de demostración (muestra ampliada para 1.5)
    {
      id: mid(), intervencion: '1.5', item: 1, cantidad: 25, unidad: 'MTS',
      descripcion: 'CAÑO CORRUGADO PVC 3/4" (fila de demostración)',
      codigo: '-', marca: '-', valorUnitario: 0.9123456789, importe: 22.80864197,
    },
  ]
}

/** Escenario alternativo de "itemizado importado" (reemplazo visual). */
function importedMaterials(): MaterialItem[] {
  _mid = 100
  return [
    {
      id: mid(), intervencion: '1.1', item: 1, cantidad: 1, unidad: 'UDS',
      descripcion: 'CAJA EMB P/TERMOMAG 20(24) MOD C/PUERTA FUME 344X272X61mm BOMBE',
      codigo: '45000074', marca: 'CONEXTUBE', valorUnitario: 11.20, importe: 11.20,
    },
    {
      id: mid(), intervencion: '1.1', item: 2, cantidad: 2, unidad: 'UDS',
      descripcion: 'INT. TERMOMAG. EASY9 4X25A 4,5KA C (cantidad ajustada en importación)',
      codigo: 'EZ9F34425', marca: 'SCHNEIDER', valorUnitario: 19.87, importe: 39.74,
    },
    {
      id: mid(), intervencion: '1.2', item: 1, cantidad: 1, unidad: 'UDS',
      descripcion: 'Gabinete estanco F60 IP65 450X450X150',
      codigo: 'E454515', marca: 'FORLI', valorUnitario: 59.28, importe: 59.28,
    },
    {
      id: mid(), intervencion: '1.2', item: 2, cantidad: 1, unidad: 'UDS',
      descripcion: 'BORNERA RIEL DIN 2.5MM2 (fila nueva de la importación)',
      codigo: 'BRD25', marca: 'ZOLODA', valorUnitario: 0.42, importe: 0.42,
    },
    {
      id: mid(), intervencion: '1.3', item: 1, cantidad: 120, unidad: 'MTS',
      descripcion: 'CABLE SUBT CU 4X 4MM2 (cantidad ajustada en importación)',
      codigo: '-', marca: 'PRYSMIAN', valorUnitario: 3.20, importe: 384.00,
    },
  ]
}

export function materialsFor(version: 'inicial' | 'modificado' | 'importado'): MaterialItem[] {
  if (version === 'importado') return importedMaterials()
  const base = baseMaterials()
  if (version === 'modificado') {
    // Escenario con una modificación manual representada
    base[2].cantidad = 15
    base[2].importe = 15 * base[2].valorUnitario
    base[2].observacion = 'Cantidad ajustada manualmente (escenario de demostración).'
  }
  return base
}

// --- Mano de obra y resumen (grupos representativos) -----------------------

export const DOLAR_REF = 1415

export function manoObraGroups(): ManoObraGroup[] {
  return [
    {
      titulo: 'Resumen de costos',
      descripcion: 'Totales representativos de demostración. No son precios vigentes.',
      rows: [
        { concepto: 'Total materiales (muestra)', valor: 'USD 823,52' },
        { concepto: 'Total mano de obra', valor: 'USD 1.279.584,00' },
        { concepto: 'Costos asociados a operarios', valor: 'USD 184.360,00' },
        { concepto: 'Inspección', valor: 'USD 96.000,00' },
        { concepto: 'Administración de obra', valor: 'USD 75.000,00' },
        { concepto: 'Proyecto eléctrico y planimetría', valor: 'USD 120.000,00' },
      ],
    },
    {
      titulo: 'Mano de obra por intervención',
      rows: [
        { concepto: '1.1 — Tablero seccional norte', valor: '18 h · oficial' },
        { concepto: '1.2 — Tablero iluminación exterior', valor: '32 h · oficial + ayudante' },
        { concepto: '1.3 — Tendido y canalizaciones', valor: '96 h · cuadrilla' },
        { concepto: '1.4 — Canalizaciones estacionamiento', valor: '40 h · cuadrilla' },
        { concepto: '1.5 — Canalizaciones ingreso', valor: '24 h · cuadrilla' },
      ],
    },
    {
      titulo: 'Parámetros de cuadrilla y jornada',
      rows: [
        { concepto: 'Personas por cuadrilla', valor: '4' },
        { concepto: 'Días en obra', valor: '8' },
        { concepto: 'Horas diarias', valor: '9' },
        { concepto: 'Valor hora oficial (referencia)', valor: '$ 4.443,00' },
        { concepto: 'Dólar (referencia)', valor: '$ 1.415,00' },
      ],
    },
    {
      titulo: 'Horas extras normales',
      rows: [
        { concepto: 'Cantidad estimada', valor: '36 h' },
        { concepto: 'Recargo', valor: '50 %' },
        { concepto: 'Valor hora con recargo', valor: '$ 6.664,50' },
      ],
    },
    {
      titulo: 'Horas extras de fin de semana',
      rows: [
        { concepto: 'Cantidad estimada', valor: '12 h' },
        { concepto: 'Recargo', valor: '100 %' },
        { concepto: 'Valor hora con recargo', valor: '$ 8.886,00' },
      ],
    },
    {
      titulo: 'Costos asociados a los operarios',
      rows: [
        { concepto: 'Paritaria', valor: 'Aplicada' },
        { concepto: 'Presentismo', valor: '10 %' },
        { concepto: 'FDR', valor: 'Incluido' },
        { concepto: 'Comidas', valor: '$ 2.500 / día · persona' },
        { concepto: 'Tiempo de viaje', valor: '1,5 h / día' },
      ],
    },
    {
      titulo: 'Costos asociados a la inspección',
      rows: [
        { concepto: 'Visitas previstas', valor: '4' },
        { concepto: 'Costo por visita', valor: '$ 180.000' },
        { concepto: 'Kilómetros estimados', valor: '1.240 km' },
      ],
    },
    {
      titulo: 'Costos asociados a la administración de obra',
      rows: [
        { concepto: 'Sueldo administrativo', valor: '$ 1.500.000' },
        { concepto: 'Porcentaje de asignación', valor: '5 %' },
        { concepto: 'Asignación mensual', valor: '$ 75.000' },
      ],
    },
    {
      titulo: 'Proyecto eléctrico y planimetría',
      rows: [
        { concepto: 'Sueldo profesional', valor: '$ 1.500.000' },
        { concepto: 'Porcentaje de asignación', valor: '40 %' },
        { concepto: 'Asignación', valor: '$ 600.000' },
      ],
    },
    {
      titulo: 'Programación y puesta en marcha',
      rows: [
        { concepto: 'Jornadas de puesta en marcha', valor: '3' },
        { concepto: 'Programación de automatismo', valor: '24 h' },
      ],
    },
    {
      titulo: 'Alquiler de equipos',
      rows: [
        { concepto: 'Retroexcavadora', valor: '2 días' },
        { concepto: 'Grupo electrógeno', valor: '8 días' },
        { concepto: 'Combustible (referencia)', valor: '$ 1.720 / litro' },
      ],
    },
  ]
}

// --- Potencia --------------------------------------------------------------

export function potenciaRows(): PotenciaRow[] {
  return [
    { id: 'POT-1', item: 1, cantidad: 2, unidad: 'UDS', descripcion: 'Electrobomba sumergible estación principal', potenciaHP: 40, potenciaW: 29840, corrienteA: 59.9 },
    { id: 'POT-2', item: 2, cantidad: 1, unidad: 'UDS', descripcion: 'Electrobomba de respaldo', potenciaHP: 40, potenciaW: 29840, corrienteA: 59.9 },
    { id: 'POT-3', item: 3, cantidad: 1, unidad: 'UDS', descripcion: 'Bomba dosificadora', potenciaHP: 1.5, potenciaW: 1119, corrienteA: 2.25 },
    { id: 'POT-4', item: 4, cantidad: 4, unidad: 'UDS', descripcion: 'Iluminación exterior (tablero seccional)', potenciaHP: 0, potenciaW: 1600, corrienteA: 3.21 },
  ]
}

// --- Descripciones auxiliares ----------------------------------------------

export function descripcionesAux(): DescripcionAuxiliar[] {
  return [
    {
      id: 'DAX-1',
      material: 'CABLE SUBT CU 3X 2.5MM2',
      aplicacion: 'ALIMENTACIÓN CAUDALÍMETROS',
      descripcionCombinada: 'CABLE SUBT CU 3X 2.5MM2 - ALIMENTACIÓN CAUDALÍMETROS',
    },
    {
      id: 'DAX-2',
      material: 'CABLE SUBT CU 4X 4MM2',
      aplicacion: 'ALIMENTACIÓN TABLERO SECCIONAL',
      descripcionCombinada: 'CABLE SUBT CU 4X 4MM2 - ALIMENTACIÓN TABLERO SECCIONAL',
    },
    {
      id: 'DAX-3',
      material: 'GABINETE ESTANCO F60 IP65',
      aplicacion: 'TABLERO A LA INTEMPERIE',
      descripcionCombinada: 'GABINETE ESTANCO F60 IP65 - TABLERO A LA INTEMPERIE',
    },
  ]
}

// --- Historial de versiones (preparado) ------------------------------------

export function historialInicial(): HistorialEntry[] {
  return [
    {
      id: 'H-0',
      fechaHora: new Date().toISOString(),
      accion: 'Itemizado generado',
      elemento: 'Itemizado completo',
      antes: '—',
      despues: 'Estado base tras resolver alertas',
      comentario: 'Resultado inicial de detecciones y alertas (demostración).',
    },
  ]
}

// --- Memoria ---------------------------------------------------------------

export const MEMORIA_SECCIONES = [
  'Portada',
  'Introducción y alcance técnico',
  'Normativa y base de diseño',
  'Descripción de envolventes',
  'Descripción de unidades funcionales',
  'Tableros seccionales',
  'Ingeniería de detalle y documentación técnica',
  'Ensayos y pruebas',
  'Especificaciones de montaje e infraestructura',
  'Conclusión',
]

export function defaultMemoriaConfig(plantillaId = 'PL-ELECTRO'): MemoriaConfig {
  return {
    plantillaId,
    logo: true,
    titulo: 'Memoria descriptiva — Instalación electromecánica',
    encabezado: 'Tecnowatt · Ingeniería electromecánica',
    pie: 'Documento de demostración — datos simulados',
    secciones: MEMORIA_SECCIONES.map((nombre, i) => ({
      id: `MS-${i + 1}`,
      nombre,
      incluida: true,
    })),
  }
}

export function buildFaltantes(): DatoFaltante[] {
  return [
    {
      id: 'FAL-1',
      campo: 'Tensión de alimentación nominal',
      descripcion: 'No especificada explícitamente en el alcance seleccionado.',
      estado: 'faltante',
    },
    {
      id: 'FAL-2',
      campo: 'Grado de protección de tableros',
      descripcion: 'Mencionado como IP65 en un requisito; confirmar para todos los tableros.',
      estado: 'faltante',
    },
    {
      id: 'FAL-3',
      campo: 'Marca/modelo de caudalímetro',
      descripcion: 'Dato técnico a completar desde la base de conocimiento o búsqueda.',
      estado: 'faltante',
    },
  ]
}
