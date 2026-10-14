# Validación de la entrega

## Resultados observados

- 24 pruebas Node aprobadas, cero fallos.
- Chromium headless 153, interfaz de 390 × 844 y 1440 × 1000.
- Música real: MP3 de 59:57.98; reproducción con readyState 4,
  AudioContext running, muted false y currentTime avanzando.
- Medición por AnalyserNode conectado al canal real de música:
  RMS máximo de muestra 0.04553 durante preparación (no es un audio simulado).
- Pausa/reanudación, finalización y restauración de preferencias comprobadas.
- Campaña: 18 rivales / 216 rounds atravesando el Clock real con límites
  temporales acelerados; persistencia tras recargar y navegación a Trofeos.
  Esta prueba no equivale a entrenar 216 rounds en tiempo real.
- Grabación: cámara artificial del navegador, micrófono desactivado,
  música y voz naturales reales; archivo de 597142 bytes, video VP8 y audio
  Opus verificados con ffprobe y señal de audio no nula con ffmpeg.
  No se probó una cámara física ni compartir desde iOS.
- 36 MP3 de presentación válidos: duración máxima 5.904 segundos.
- Sin errores de JavaScript ni respuestas HTTP fallidas en el recorrido.
- Revisión visual móvil/escritorio; banner contenido en la estrecha columna
  original, sin ampliar ni rediseñar la app.
- MP3 original, bancos de voz, CSS principal, core, grabador y Trofeos:
  se conservan los bytes del repositorio base.

## Correcciones encontradas

El parche anterior no incluía el repositorio completo. Su presentación de
rivales creaba un Audio separado, tenía un límite de 1.6 segundos y recurría
a la voz del dispositivo si fallaba; no se mezclaba por el canal del entrenador.
Se reemplazó por MP3 locales y el motor compartido, sin ese corte.

El rechazo tardío de play() tras una pausa podía bloquear intentos siguientes.
Ahora se descartan respuestas pertenecientes a una reproducción anterior.
La inicialización silenciosa no pausa una sesión que ya arrancó.
La navegación no conocía la ruta Campeonatos y marcaba otra pestaña.
El respaldo de ajustes dependía de sessionStorage; ahora sobrevive al cierre.

Cinco pruebas antiguas ya fallaban en el commit base: buscaban nombres y rutas
de una arquitectura del grabador que el propio repositorio había abandonado.
Se actualizaron esas comprobaciones; se conserva la prueba de comportamiento
que verifica buffers, velocidad, tiempos y conexiones iguales en voz normal
y grabada, y se añadió la regresión de rechazo tardío de reproducción.

## Pendiente de entorno real

iPhone físico/Safari: salida de altavoz, interrupciones del sistema, permisos
reales de cámara y reproducción/compartir el archivo descargado. La instalación
de WebKit en este entorno no pudo ejecutarse por dependencias del sistema;
no se presenta como una prueba Safari aprobada.

## Datos de perfiles

Consulta: 14 de octubre de 2026. Los activos del parche se contrastaron con:
- Fury, 36–2–1 / 25 KO: https://boxrec.com/en/box-pro/479205
- Usyk, 25–0–0 / 16 KO: https://boxrec.com/en/box-pro/659772
- Canelo, 63–3–2 / 39 KO: https://www.premierboxingchampions.com/fighters/535025
- Pacquiao, 62–8–3 / 39 KO: https://www.premierboxingchampions.com/fighters/449650

Cada perfil conserva su enlace de trayectoria. Los datos son una instantánea,
no una conexión en vivo a un proveedor de resultados.

## Revisión del HTML aportado

El HTML PRIMAL_CAMPEONATOS_4_CORRECCIONES_VISTA_PREVIA(1).html contiene
18 retratos idénticos a los del paquete, pero carga doce scripts y tres
hojas de estilo externos. También depende del MP3 y del banco de voz remotos.
La revisión completa conserva todos esos recursos localmente.

Se añadió precarga de la presentación seleccionada, límite de carga de
12 segundos y retención de preparación mientras se reproduce la narración.
Dos pruebas adicionales comprueban que la presentación espera a onended
y que al pausar durante la descarga no puede reproducirse un audio tardío.
No se repitió QA de navegador para esta revisión alojada: la herramienta
control-browser no está disponible en este entorno. Las comprobaciones
de Chromium descritas arriba corresponden a la base de la entrega anterior.
