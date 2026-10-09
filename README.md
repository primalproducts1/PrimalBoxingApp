# PRIMAL Boxing Club — versión música local

Aplicación bilingüe de boxeo con cámara, cronómetro, superposiciones y música de fondo aportada por el usuario.

## Actualización MP3

- Ya no utiliza YouTube ni Spotify.
- `audio/primal-background.mp3` contiene la mezcla original suministrada, convertida a un nivel reducido (~19% de amplitud) para evitar tapar la voz incluso en iPhone, donde JavaScript no siempre puede controlar el volumen de un elemento de audio.
- La música puede reproducirse continuamente durante la bienvenida, preparación, rounds y descansos. Tiene controles de reproducción y pausa, incluido el modo cámara.
- La música se conecta al video con un segundo reproductor sincronizado, sin duplicarse por altavoz. La mezcla se graba junto al video **si el navegador permite el enrutamiento MediaElement → Web Audio → MediaRecorder**. Debes comprobarlo en Safari/iPhone; si el navegador bloquea esa ruta, la música podría no quedar en el archivo.
- El navegador puede exigir pulsar **Reproducir música** para comenzar; autoplay con sonido no está garantizado.
- El archivo MP3 dura aproximadamente 59 min 58 s y ocupa ~21,6 MB. Esta versión está recodificada a 48 kb/s para que se pueda subir desde el navegador a GitHub (límite de 25 MiB por archivo). Su fidelidad es menor que la del original de ~43 MB; para conservar el original, utiliza GitHub Desktop.

## Voz del entrenador

La voz que escucha la persona durante las sesiones y al grabar proviene de `speechSynthesis` (voces del dispositivo). La pista de voz que se incluye en el video sigue siendo la **voz pregrabada provisional** del proyecto: `speechSynthesis` no permite extraer el audio para `MediaRecorder`. Cambiar la música no resuelve todavía esa diferencia. Una futura versión puede usar grabaciones de voz de calidad para escuchar y exportar exactamente la misma voz.

## Publicar en GitHub

**Si GitHub muestra este README en lugar de la app, es porque falta `index.html` en la raíz del repositorio.** Arrastra los archivos que están dentro de la carpeta extraída, no el ZIP ni la carpeta superior.

1. Descomprime el ZIP.
2. En el repositorio GitHub existente usa **Add file → Upload files**.
3. Sube todos los archivos, manteniendo las carpetas `audio/` y `coach-audio/`.
4. Haz **Commit changes** y espera al despliegue de Pages.
5. Recarga la página y prueba un video de 10 segundos en tu iPhone: música audible, botón de pausa, video descargado con música y voz provisional.

**Derechos de uso:** si la música incluye canciones de terceros, verifica que tienes la autorización necesaria para almacenarla públicamente en GitHub Pages e incorporarla a videos compartidos. Tener el MP3 no concede esos derechos automáticamente.
