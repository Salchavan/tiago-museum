# Manual de Usuario — Tiago Museum

Este manual explica cómo usar el sitio del museo tanto como **visitante** (sitio público) como **administrador** (panel admin). Está pensado para personas sin conocimientos técnicos.

---

## 1) Requisitos y recomendaciones

- **Dispositivo:** PC, notebook, tablet o celular.
- **Navegador recomendado:** Chrome, Edge o Firefox actualizado.
- **Conexión a internet:** necesaria para cargar noticias, restauraciones y comentarios.

Notas:

- En pantallas pequeñas, algunos elementos se reacomodan automáticamente.
- Si ves que algo no carga (tarjetas vacías), revisá la sección “Solución de problemas”.

---

## 2) Acceso al sitio

### 2.1 Sitio público (visitantes)

1. Abrí el enlace del museo.
2. Vas a ver la página principal con secciones como **Noticias**, **Restauraciones**, **Comentarios**, **Reservas** y/o **Donaciones** (según la página).

### 2.2 Acceso rápido a Admin (atajo)

El sitio incluye un atajo de teclado:

- **Ctrl + K**: abre la página de **login**.

Desde el login, si tus credenciales son correctas (o si está configurado en modo demo), accederás al panel de administración.

---

## 3) Navegación general (sitio público)

### 3.1 Sección Noticias (tarjetas)

La sección de noticias muestra tarjetas con:

- **Tipo** (por ejemplo: “Evento”, “Comunicado”).
- **Fecha**.
- **Título**.
- **Descripción**.
- Un enlace **“Saber más”** (si está disponible).

Cómo usarla:

1. Leé el contenido de cada tarjeta.
2. Si querés abrir la noticia completa, tocá/clic en **“Saber más”**.
3. El enlace se abre en una pestaña nueva (para que no pierdas la página del museo).

### 3.2 Slider de Noticias (carrusel)

En algunas páginas, las noticias también aparecen en un **slider** (carrusel) que se desplaza.

Funciones típicas:

- **Autoplay:** avanza solo cada algunos segundos.
- **Flechas/controles:** podés avanzar o retroceder.
- **Puntos (dots):** indican en qué “página” del slider estás.
- **Deslizamiento (swipe):** en celular podés deslizar con el dedo.

Consejo: si querés leer con calma, frená la interacción quedándote en la tarjeta actual (según el navegador, el autoplay puede seguir; usá flechas/dots para volver).

### 3.3 Slider de Restauraciones

Similar al slider de noticias, pero enfocado en restauraciones.

Qué vas a ver:

- Imagen de la restauración.
- Título y descripción.
- Fecha o información asociada (según el registro).

Cómo usarlo:

1. Navegá con flechas o puntos.
2. En dispositivos táctiles, deslizar (swipe) cambia de tarjeta.

### 3.4 Comentarios (sección)

En la sección de comentarios se listan publicaciones de usuarios.

Vas a ver:

- Foto/ícono de perfil.
- Nombre de usuario.
- Fecha.
- Texto del comentario.

El listado suele ordenarse del **más reciente al más antiguo**.

### 3.5 Botón “Volver arriba” (si está disponible)

En páginas largas puede aparecer un botón para volver al inicio.

Cómo usarlo:

1. Hacé clic en el botón.
2. La página sube de manera suave hacia el inicio.

---

## 4) Uso de modales (ventanas emergentes)

En el sitio hay funciones que se abren en **modales** (ventanas encima de la página).

Comportamiento común:

- Para **abrir**: hacé clic en el botón correspondiente (por ejemplo, “Reservar”, “Donar”, “Ver más”).
- Para **cerrar**:
  - clic en el botón **Cerrar (X)**,
  - clic fuera del contenido (sobre el fondo oscuro), o
  - tecla **Escape (Esc)**.

Mientras un modal está abierto, el sitio puede bloquear el scroll (esto es normal).

---

## 5) Reservas (visitantes)

Si el sitio incluye un formulario de reserva, normalmente pedirá:

- Fecha y horario.
- DNI.
- Nombre.
- Teléfono.
- Mail.
- Cantidad de personas.

Pasos para reservar:

1. Abrí el modal o sección de **Reservas**.
2. Completá todos los campos obligatorios.
3. Enviá el formulario.
4. Verificá el mensaje de estado:
   - **Enviando…**
   - **Éxito** (confirmación)
   - **Error** (si falta un campo o hubo un problema)

Importante:

- En un sitio estático (por ejemplo, alojado en GitHub Pages), el envío puede funcionar como **simulación** o usar métodos alternativos (por ejemplo, descarga de un archivo). Si tu versión está conectada a un servidor real, el comportamiento será el de una reserva “real”.

---

## 6) Donaciones (visitantes)

Si existe el modal de donaciones:

1. Abrí **Donaciones**.
2. Leé los medios o instrucciones disponibles.
3. Cerrá el modal con **X**, clic fuera, o **Esc**.

---

## 7) Panel de Administración (admin)

Esta sección describe las acciones del panel admin.

### 7.1 Ingreso

1. Desde el sitio público presioná **Ctrl + K**.
2. Se abre la pantalla de login.
3. Ingresá tus datos (según el método configurado).
4. Accedés al **panel admin**.

### 7.2 Funcionamiento general del panel

En el panel admin suelen aparecer botones de “+” (agregar) y otros botones para abrir modales.

Reglas comunes:

- Al abrir un modal admin, se bloquea el scroll del fondo.
- Los formularios muestran un texto de estado (por ejemplo “Guardando…”, “Error…”, “Guardado”).

### 7.3 Agregar noticia

1. Abrí el modal **Agregar noticia**.
2. Completá: tipo, título, descripción, imagen, link y fecha.
3. Tocá **Guardar**.

Resultado esperado:

- Si el backend está disponible, verás **“Noticia guardada”** y se recarga la página.
- Si no hay backend, puede aparecer un error indicando que no se pudo conectar.

### 7.4 Agregar restauración

1. Abrí el modal **Agregar restauración**.
2. Completá: título, descripción, imagen y fecha de inicio.
3. Tocá **Guardar**.

Resultado esperado:

- Si el backend está disponible, verás **“Restauración guardada”** y se recarga la página.
- Si no hay backend, puede aparecer un error de conexión.

### 7.5 Calendario de reservas (demo)

El panel puede incluir un modal de **calendario** que muestra reservas por día.

Qué verás:

- Un calendario mensual.
- Días con “tarjetitas” de reservas.
- Si hay más reservas que las visibles, se muestra “+N más”.

Nota: según la versión del proyecto, estas reservas pueden ser solo de demostración.

### 7.6 Comentarios (modal)

Si el panel incluye un modal para comentarios:

1. Abrilo desde el botón correspondiente.
2. Completá los campos.
3. Enviá.

Nota: en algunas versiones, el comentario puede validarse y cerrarse, pero no guardarse en un servidor si no existe backend.

---

## 8) Solución de problemas

### 8.1 “No se pudieron cargar las noticias / restauraciones / comentarios”

Posibles causas:

- No hay conexión a internet.
- El servidor del sitio no está disponible.
- El archivo de datos no está accesible.

Qué hacer:

1. Recargá la página (F5).
2. Probá abrir el sitio en modo incógnito.
3. Probá con otro navegador.

### 8.2 Los botones abren un modal pero no puedo scrollear

Es normal: al abrir un modal, el sitio bloquea el scroll del fondo. Cerrá el modal con **X**, clic fuera o **Esc**.

### 8.3 En admin, “Guardar” muestra error de servidor

Esto suele pasar si el panel está funcionando sin backend.

- Si estás en un entorno con servidor (local), asegurate de que el proyecto esté ejecutándose en modo desarrollo.
- Si estás en un hosting estático, el error puede ser esperado.

---

## 9) Glosario rápido

- **Sección:** parte de la página (por ejemplo “Noticias”).
- **Tarjeta:** bloque visual con información (título, texto, imagen).
- **Modal:** ventana emergente que se muestra encima de la página.
- **Slider/Carrusel:** componente que muestra tarjetas desplazables.
