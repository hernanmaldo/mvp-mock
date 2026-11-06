// Formateo con locale es-AR. No se presentan valores como precios vigentes.

const nf2 = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const nf0 = new Intl.NumberFormat('es-AR', {
  maximumFractionDigits: 0,
})

const nfFlexible = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/** Número con 2 decimales, es-AR. Etiqueta de interfaz; no representa precio vigente. */
export function num2(value: number): string {
  return nf2.format(value)
}

export function num0(value: number): string {
  return nf0.format(value)
}

export function numFlex(value: number): string {
  return nfFlexible.format(value)
}

/** Fecha y hora corta es-AR a partir de un ISO string. */
export function fechaHora(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function confianzaLabel(c: number): string {
  if (c >= 0.85) return 'Alta'
  if (c >= 0.65) return 'Media'
  return 'Baja'
}
