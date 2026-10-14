# PRIMAL Boxing — música y Campeonatos

Entrega del 14 de octubre de 2026. Aplicación completa para el repositorio
https://github.com/primalproducts1/PrimalBoxing

Base: commit `6fe5d90aff63b6afb688447cf8e0649b35ee35d7`, cuyo index.html coincidía
con https://primalproducts1.github.io/PrimalBoxing/ al descargarlo.

## Publicar

1. Guarda una copia del repositorio actual (Code → Download ZIP).
2. Descomprime este paquete. Sube **su contenido**, con `index.html` en la raíz.
   No subas el ZIP como si fuera una página ni anides todo en otra carpeta.
3. Conserva las carpetas `audio`, `coach-audio`, `championships-intros` y
   `championships-portraits` completas. El MP3 de música está incluido.
4. Haz commit en la rama que ya utiliza GitHub Pages y espera el despliegue.
5. Abre la misma dirección `/PrimalBoxing/`. Recarga para recibir los scripts
   nuevos. No borres los datos del sitio: allí están tu historial y tus trofeos.

No necesita claves, servicios de voz durante el entrenamiento ni compilación.
Para probar localmente: `npm start`, abrir http://localhost:3000.
No abras index.html directamente mediante file://: la voz necesita HTTP/HTTPS.

## Qué cambia

- El reproductor único conserva el MP3 original. Se activa con el toque inicial,
  usa la sesión de audio playback cuando corresponde y descarta errores tardíos
  de reproducciones interrumpidas. Respeta desactivación manual, descanso,
  pausa y final. El control de volumen sigue siendo el original.
- El archivo musical ya estaba atenuado. Se aplica +6 dB en su canal Web Audio
  para mejorar su audibilidad; el archivo binario permanece idéntico.
- Se conservan íntegros los cuatro bancos de voz natural, imágenes de marca,
  estilos principales, core, grabador y código de Trofeos.
- Campeonatos incorpora 18 rivales, seis cinturones, perfiles, retratos,
  12 rounds y 2 segundos de ejecución inicial. Un toque en Pelear ahora
  inicia preparación; no hay una segunda antesala.
- Se incluyen 18 narraciones en español (Gonzalo, es-CO) y 18 en inglés
  (Guy, en-US), los identificadores de voz documentados en el banco original.
  Se reproducen mediante el mismo canal del entrenador, con cancelación al
  pausar o cambiar de fase. No se usa síntesis de voz del teléfono.
- El avance persiste y los combates incompletos no desbloquean rivales.
  El historial identifica el rival. La configuración habitual se restaura al
  salir y también tras recargar o cerrar accidentalmente la aplicación.
- La navegación reconoce Campeonatos y permite volver a las secciones existentes.

## Comprobación breve en iPhone

1. Sube el volumen multimedia y abre la página después del despliegue.
2. Campeonatos → Pelear ahora: escucha música y la presentación de Arturo Gatti.
3. Pausa y continúa: ambos controles deben respetar la sesión.
4. Finaliza y verifica que regresan tus tiempos habituales.
5. Graba 10 segundos desde Grabar, sin micrófono ambiente; descarga y reproduce
   el video para escuchar la misma voz y música.
6. Si falla el sonido, abre `DIAGNOSTICO_MUSICA.html` en la misma carpeta.
   Pulsa Iniciar prueba y anota contexto, pausado, segundos, carga y señalRMS.

La señal digital se verificó en Chromium con los MP3 reales. No se dispone
 de una prueba en un iPhone físico: Safari/iOS y su salida de altavoz requieren
 esa verificación final. No se afirma que una prueba automatizada la sustituya.

## Pruebas y límites

`npm test`: 22 pruebas aprobadas. Ver `VALIDACION.md` para evidencia y alcance.
La campaña mide rounds completados; no detecta golpes, defensa ni nocauts.

## Volver a la versión anterior

Revierte el commit de esta entrega o restaura la copia del repositorio.
No borres localStorage. Los datos de Trofeos e historial mantienen sus claves.
El progreso adicional utiliza `primal-championships-v1`.
