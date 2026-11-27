# Registro de decisiones

## 2026-11-27 · Incremento 1 de la fase 1A

**Contexto.** El directorio inicial contenía AGENTS.md y no tenía una aplicación reutilizable. La carpeta .git no era un repositorio operativo accesible. No se inicializa ni altera Git desde este incremento.

**Alcance.** Construir primero un recorrido verificable de observación inicial, con tres ejercicios y resultados reales. No generar clases genéricas diarias antes de contar con diagnóstico y material verificado. Al finalizar, la interfaz solicita revisión del tutor sin inventar la siguiente clase.

**Tecnología.** React, TypeScript y Vite para la interfaz; IndexedDB mediante idb para persistencia transaccional; Zod para validar el esquema versionado. El estado se escribe como un documento atómico pequeño. No requiere backend ni transmisión de datos personales. Separación entre dominio (`src/domain`), almacenamiento (`src/storage`) e interfaz (`src/App.tsx`).

**Persistencia.** Confirmar cada escritura antes de actualizar la interfaz. Una escritura fallida muestra un error sin afirmar que se ha guardado. Una lectura inválida no se sustituye por datos vacíos. No se almacena el intervalo entre el cierre del navegador y la reanudación como tiempo de práctica. El guardado periódico de borradores y los conflictos entre pestañas quedan pendientes.

**Intercambio.** Copia schemaVersion 1, con declaración explícita sobre grabaciones. Importación aditiva revisable, conserva perfil local, deduplica sesiones idénticas y rechaza conflictos de ID. El límite de archivo es 10 MB. Importación de clases nuevas del tutor como asignaciones pendientes queda fuera de este primer incremento.

**Pedagogía.** Todo resultado es autoevaluación de confianza no determinada. La primera clase es una toma de referencias, no una evaluación acústica ni una acreditación de dominio. Las propuestas de fragmentar, reforzar o reducir carga explican el motivo y esperan revisión humana. No hay ascensos automáticos.

**Calendario.** El modelo de referencia suma exactamente 600/225/90 minutos. No asignar horarios mientras la disponibilidad y el silencio no estén configurados. La planificación dinámica y la sustitución por ensayo son el siguiente incremento.

**Presentación.** Tres destinos, diseño móvil primero, un ejercicio por pantalla, detalles secundarios plegados. Sin dependencias de fuentes o imágenes remotas, ni estadísticas en portada. No se publica ningún sitio.

**Dependencias.** La auditoría inicial detectó vulnerabilidades en Zod 3 y Vitest 3. Se actualizaron a Zod 4.6.7 y Vitest 5.1.2; npm informó cero vulnerabilidades después de instalar. El lockfile conserva las versiones resueltas. La compilación emite dos advertencias de anotaciones de comentarios en Zod que Rollup descarta, sin impedir generar los archivos.

## 2026-11-27 · Análisis de progreso por áreas

A petición del alumno, Progreso pasa de ser solo un historial a incluir análisis por instrumento y habilidad. Se conserva una sola área visible a la vez, con evidencia plegada. No se añaden decisiones al flujo de la clase ni estadísticas a la portada.

El análisis se deriva de los resultados guardados, sin cambiar el esquema ni migrar datos. Agrupa por instrumento, ejercicio, versión y contenido, ordena por fecha de registro y conserva sesiones parciales. Las omisiones se separan de intentos. La recurrencia de dificultad considera los dos últimos intentos del mismo grupo y genera una propuesta revisable, sin automatizar ascensos.

Los cambios entre autoevaluaciones se muestran como observaciones, nunca como medición de mejora: todavía no se registran condiciones comparables. Las áreas sin evidencia muestran ausencia de datos y las habilidades técnicas pendientes se hacen explícitas. Se requieren futuras mediciones y revisión humana para valorar la evolución técnica.

## 2026-11-27 · Publicación en GitHub Pages

La página pública servía el index.html fuente con una referencia a /src/main.tsx (404). Se añade un workflow que prueba, compila y publica dist, con acciones fijadas a commits de la documentación oficial de Vite. La base de producción y preview es /maestro-personal/; el servidor de desarrollo mantiene /. El usuario ha autorizado corregir y publicar. Se incluyen los cambios de análisis por áreas ya verificados.

La configuración remota mantiene el despliegue de rama (legacy), que sobrescribió la primera publicación compilada. El token de Actions no permitió cambiar esa configuración. El workflow espera a que termine el despliegue legacy del mismo commit antes de publicar dist. Si Pages se cambia a fuente GitHub Actions, la espera se omite. No se necesitan credenciales personales en el repositorio.
