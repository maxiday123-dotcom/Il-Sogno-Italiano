# Las Pastas de Beto 🍝

Sitio web de e-commerce para un restaurante de pastas artesanales italianas. Permite ver el menú (cargado dinámicamente desde una API propia), agregar productos a un carrito de compras persistente, editar cantidades, y enviar el pedido por WhatsApp o una consulta por el formulario de contacto.

## Propósito

Proyecto final de la cursada de Front End. El objetivo es aplicar de forma integrada HTML semántico, CSS (Flexbox, Grid, Media Queries) y JavaScript (DOM, fetch, localStorage, validación de formularios) en un sitio funcional de comercio electrónico.

## Funcionalidades

- **Menú dinámico**: los productos se obtienen con `fetch()` desde `productos.json` (simula una API REST) y se renderizan como tarjetas con imagen, nombre, descripción y precio.
- **Carrito de compras**: agregar productos, editar cantidades (+/-), quitar productos y ver el total actualizado en tiempo real. El contador del carrito en el menú se actualiza dinámicamente.
- **Persistencia**: el carrito se guarda en `localStorage`, por lo que no se pierde al recargar o cerrar la página.
- **Carrusel + lightbox**: galería de fotos del local con autoplay, navegación por botones/teclado y vista ampliada.
- **Mapa embebido**: ubicación del local mediante un `iframe` de Google Maps.
- **Formulario de contacto**: validación de campos (nombre, correo, mensaje) con JavaScript y envío vía [Formspree](https://formspree.io) usando `fetch`, mostrando mensajes de éxito/error sin recargar la página.
- **Accesibilidad**: textos alternativos en imágenes, navegación completa por teclado, foco visible, enlace "saltar al contenido" y atributos `aria-*` en elementos interactivos.
- **SEO básico**: metaetiquetas de descripción, palabras clave y Open Graph.
- **Responsive**: diseño adaptado a mobile, tablet y desktop con Flexbox, Grid y Media Queries.

## Estructura de archivos

    index.html        # estructura semántica de la página
    style.css         # estilos (Flexbox en productos, Grid en reseñas, responsive)
    script.js         # toda la interactividad: fetch, carrito, carrusel, formulario
    productos.json    # "API" propia con los datos del menú
    *.png             # imágenes del menú y del local

## Cómo personalizarlo

- **Número de WhatsApp**: reemplazar `WHATSAPP_NUMBER` en `script.js` por el número real del local (código de país + área, sin espacios ni "+").
- **Ubicación del mapa**: cambiar la dirección en el `src` del `iframe` dentro de `index.html` (sección "Nuestro Local").
- **Productos**: agregar, editar o quitar platos directamente en `productos.json`.
- **Formulario**: el formulario ya está conectado a un endpoint de Formspree; para usar uno propio, reemplazar la URL en el atributo `action` del `<form>`.

## Cómo ejecutarlo

El sitio no necesita backend ni instalación. Alcanza con abrir `index.html` en el navegador, o servirlo con cualquier servidor estático (por ejemplo, la extensión "Live Server" de VS Code, ya que `fetch('productos.json')` requiere protocolo `http://` y no funciona abriendo el archivo directamente con `file://` en algunos navegadores).

## Despliegue

El sitio está publicado con GitHub pages
