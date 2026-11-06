# Cotizaciones | MVP — Mockup navegable

Prototipo **visual e interactivo** (frontend) para asistir la lectura de pliegos, la elaboración
de itemizados y memorias descriptivas, y la administración de una base de conocimiento.
Pensado para debatir funcionalidades en una reunión.

> ⚠️ **Demo con datos simulados.** No hay backend, autenticación, base de datos, IA, OCR, lectura
> de Excel, generación de Word, descargas reales ni integraciones. Todas las acciones revelan
> escenarios preparados; nada se procesa ni se envía realmente. Al recargar, el estado vuelve al
> inicial (sin `localStorage` ni persistencia).

## Stack

- React + TypeScript
- Vite (build y dev server)
- Tailwind CSS (estilo inspirado en Atlassian Design System)
- React Router (navegación)
- Lucide React (íconos)
- Estado en memoria (React Context) — se reinicia al recargar

## Cómo ejecutar

```bash
npm install
npm run dev
```

Luego abrir la URL que indica Vite (por defecto `http://localhost:5178`).

Otros comandos:

```bash
npm run build     # compila TypeScript y genera el bundle de producción
npm run preview   # sirve el build de producción
```

## Alcance incluido

- **Listado de proyectos** con un único proyecto precargado (`PR-001`) y botón *Enviar a Ingeniería*
  (solo visual, sin requisitos).
- **Módulo 1 — Lectura asistida del pliego:** nuevo procesamiento con rangos de páginas,
  confirmación de secciones (incluir/excluir), revisión de detecciones con pestañas
  (Resumen · Requisitos · Normas · Detecciones) y visor documental simulado.
- **Módulo 2 — Itemizado:** materiales por capítulos/intervenciones, M.O y resumen, potencia,
  descripciones auxiliares e historial, con importación/exportación simuladas, deshacer y
  restablecer.
- **Memoria descriptiva:** plantilla, configuración, faltantes (búsqueda web simulada / ABM /
  continuar con faltantes), vista previa de solo lectura y descarga Word simulada.
- **Módulo 3 — Base de conocimiento:** ABM visual completo (consulta, alta, edición, eliminación)
  en todas sus secciones.
- **Reiniciar demo** (global) restaura el estado inicial.

## Recorrido sugerido para la reunión

Proyectos → abrir proyecto → *Nuevo procesamiento* → *Usar pliego de demostración* → indicar
rangos → *Identificar secciones* → excluir una sección y confirmar → revisar/confirmar/descartar
alertas → *Generar itemizado* → recorrer pestañas, importar/deshacer/restablecer →
*Continuar a memoria* → generar memoria → recorrer la base de conocimiento → *Reiniciar demo*.

## Notas sobre los datos

- Los materiales del itemizado son una **muestra** tomada del Excel de referencia de iluminación
  exterior; **no** son materiales extraídos del pliego activo.
- El Excel y la memoria de referencia son documentos **independientes** de estructura y contenido.
- Los valores se muestran con formato `es-AR` y **no** representan precios vigentes.
