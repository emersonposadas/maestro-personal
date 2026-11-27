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
