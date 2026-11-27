# Maestro Personal

Maestro digital de música norteña en español. El alumno abre su clase, practica y finaliza. Proyecto local, sin cuentas, backend ni servicios de pago.

## Estado: fase 1A, incremento 1

- React + TypeScript + Vite, con dominio, persistencia e interfaz separados.
- Primera clase de observación: 12 minutos activos y 2 minutos de pausa, con una tarea por pantalla.
- Comenzar, volver, repetir antes de avanzar, omitir con motivo, pausar, reanudar y finalizar.
- Guardado en IndexedDB después de cada resultado y transición. Recuperación tras recarga sin duplicar sesiones.
- Perfil inicial editable: edad, objetivo, instrumento, experiencia en bajo quinto y zona horaria.
- Referencia semanal de 915 minutos, sin asignación de horarios todavía.
- Historial real, autoevaluaciones explícitas y propuestas explicables para revisión del tutor.
- Exportación JSON versionada; importación aditiva con revisión previa, validación y rechazo de conflictos.

## Instalación y ejecución

Requiere Node.js 22.22 o posterior y npm. Desde el directorio del proyecto:

```bash
npm ci
npm run dev
```

Abrir la dirección local que muestra Vite. No es un servicio publicado.

```bash
npm run build
npm run preview
```

`dist/` contiene el resultado de producción. GitHub Actions compila y publica esta carpeta en GitHub Pages al subir cambios a `main`. La ruta de producción es `/maestro-personal/`; `npm run preview` permite verificar esa misma ruta localmente.

## Pruebas

```bash
npm test
npx playwright install chromium
npm run test:e2e
```

Las pruebas unitarias verifican suma semanal, fechas según zona horaria, resultados parciales, criterios de cierre, adaptación y validación/importación. La persistencia se verifica con fake-indexeddb. Playwright ejecuta el recorrido completo con Chromium en escritorio y emulación móvil, incluyendo recarga, pausa, reanudación y omisión justificada.

En el entorno de desarrollo de Codex se usa `PLAYWRIGHT_BROWSERS_PATH=/tmp/maestro-playwright` para instalar y ejecutar el navegador fuera del directorio personal.

## Datos y privacidad

No se incluyen sesiones de demostración en el historial. La primera clase recoge referencias personales; no constituye diagnóstico técnico validado. La finalización no acredita dominio. El mapa de botones, las horas de silencio y el diagnóstico permanecen pendientes.

Los datos se guardan únicamente en IndexedDB del navegador y origen actuales. Cambiar de navegador, dirección o puerto utiliza otro almacenamiento. El navegador puede eliminar datos; exporta copias periódicamente. No hay sincronización entre dispositivos.

La copia contiene perfil, clases y resultados, y declara explícitamente la exclusión de grabaciones (todavía no disponibles). La importación preserva el perfil local, añade sesiones nuevas y rechaza sesiones modificadas con el mismo ID o múltiples sesiones abiertas. Importar la misma copia dos veces no duplica resultados. No hay sobrescritura silenciosa.

El reloj muestra tiempo con la clase abierta; se guarda al registrar resultados, pausar, volver o cambiar de sección. No mide práctica efectiva. Si cierras o recargas sin guardar una transición, el tramo de tiempo y la observación aún no enviados se pierden, pero se conservan los ejercicios ya registrados. El tiempo fuera de la aplicación no se suma al reanudar. No usar varias pestañas para editar simultáneamente: aún no hay coordinación entre pestañas.

## Límites y siguientes incrementos

Este incremento no completa la fase 1A. Quedan pendientes:

1. Perfil completo de trabajo/desplazamientos, disponibilidad editable, silencio, descanso y vacaciones.
2. Calendario editable con ensayos que sustituyen la clase, instrumentos practicados y planificación sin solapamientos.
3. Diagnóstico revisado por el tutor, importación de nuevas clases asignadas y reglas que generen propuestas de refuerzo revisables. La clase inicial no se repite automáticamente ni genera un curso ficticio.
4. PWA instalable y service worker con funcionamiento sin conexión verificado.
5. Recuperación de borradores, coordinación entre pestañas y mayor cobertura de fallos de almacenamiento y accesibilidad.

Las herramientas de audio, grabaciones, afinador, currículo anual y pruebas periódicas pertenecen a incrementos posteriores. No hay análisis acústico ni integración de IA. El temporizador básico de la sesión sirve solo de orientación.

Las decisiones se registran en [docs/decisiones.md](docs/decisiones.md). Las instrucciones del proyecto están en [AGENTS.md](AGENTS.md).

## Análisis por áreas

Progreso incluye un selector de acordeón, bajo quinto y canto. Cada área muestra las habilidades con resultados registrados, el último estado y una propuesta explicada para revisar con el tutor. Los detalles muestran las observaciones en orden cronológico, incluyendo sesiones parciales y motivos de omisión.

Dos últimos intentos con dificultad en el mismo ejercicio producen una propuesta de fragmentación; las omisiones se cuentan aparte y no representan retroceso. Las versiones o contenidos distintos se separan. Las propuestas no cambian automáticamente las clases ni el nivel. Una sola sesión constituye un punto de partida, no evidencia de evolución.

El análisis actual es descriptivo y utiliza autoevaluaciones de confianza no determinada. No calcula porcentajes de dominio ni infiere mejora técnica de cambios en las respuestas. El registro de tempo, errores y afinación con condiciones comparables, así como la revisión del tutor, queda pendiente. Se especifican las habilidades todavía no evaluadas por instrumento. El tiempo de sesión no se reparte artificialmente entre instrumentos.

## GitHub Pages

El workflow `.github/workflows/deploy.yml` instala con `npm ci`, ejecuta las pruebas, compila y publica únicamente `dist`. En Settings → Pages, la fuente debe ser GitHub Actions para evitar que el despliegue automático de la rama publique código fuente. Sitio: https://emersonposadas.github.io/maestro-personal/.
