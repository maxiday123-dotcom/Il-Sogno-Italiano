/* =========================================================
   LAS PASTAS DE BETO - script.js
   Maneja: menú, fetch de productos, carrito (localStorage),
   carrusel/lightbox, formulario de contacto y botón "ir arriba".
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     1) MENÚ HAMBURGUESA
     ========================================================= */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const menuLinks = document.getElementById('menuLinks');

  if (hamburgerBtn && menuLinks) {
    hamburgerBtn.addEventListener('click', () => {
      menuLinks.classList.toggle('show');
    });

    // Cierra el menú al tocar un link (mejor experiencia en mobile)
    menuLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => menuLinks.classList.remove('show'));
    });
  }

  /* =========================================================
     2) CARRITO DE COMPRAS (localStorage)
     ========================================================= */
  const CART_KEY = 'pastasBetoCarrito';
  // ⚠️ Reemplazar por el número real de WhatsApp del restorán
  // (código de país + área, sin espacios ni "+")
  const WHATSAPP_NUMBER = '5491100000000';

  let productosCache = [];           // productos traídos de la "API" (productos.json)
  let carrito = cargarCarritoGuardado();

  const cartLink = document.getElementById('cartLink');
  const cartCountEl = document.getElementById('cart-count');
  const cartItemsListEl = document.getElementById('cartItemsList');
  const cartTotalEl = document.getElementById('cartTotal');
  const whatsappBtn = document.getElementById('whatsappOrderBtn');
  const resetCartBtn = document.getElementById('resetCartBtn');
  const emptyCartBtn = document.getElementById('emptyCartBtn');
  const tuPedidoListaEl = document.getElementById('tuPedidoLista');

  function cargarCarritoGuardado() {
    try {
      const guardado = localStorage.getItem(CART_KEY);
      return guardado ? JSON.parse(guardado) : {};
    } catch (error) {
      console.error('No se pudo leer el carrito guardado:', error);
      return {};
    }
  }

  function guardarCarrito() {
    localStorage.setItem(CART_KEY, JSON.stringify(carrito));
  }

  function formatearPrecio(num) {
    return `$${num.toLocaleString('es-AR')}`;
  }

  function agregarAlCarrito(id) {
    const producto = productosCache.find(p => p.id === id);
    if (!producto) return;

    if (carrito[id]) {
      carrito[id].cantidad += 1;
    } else {
      carrito[id] = {
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagen,
        cantidad: 1
      };
    }
    guardarCarrito();
    renderizarCarrito();
  }

  function cambiarCantidad(id, delta) {
    if (!carrito[id]) return;
    carrito[id].cantidad += delta;
    if (carrito[id].cantidad <= 0) {
      delete carrito[id];
    }
    guardarCarrito();
    renderizarCarrito();
  }

  function eliminarDelCarrito(id) {
    delete carrito[id];
    guardarCarrito();
    renderizarCarrito();
  }

  function vaciarCarrito() {
    carrito = {};
    guardarCarrito();
    renderizarCarrito();
  }

  function calcularTotal() {
    return Object.values(carrito).reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  }

  function renderizarCarrito() {
    const totalItems = Object.values(carrito).reduce((acc, item) => acc + item.cantidad, 0);
    if (cartCountEl) cartCountEl.innerText = totalItems;
    if (cartLink) cartLink.classList.toggle('has-items', totalItems > 0);

    const entradas = Object.entries(carrito);

    // Lista de productos en el carrito
    if (cartItemsListEl) {
      if (entradas.length === 0) {
        cartItemsListEl.innerHTML = '<p class="carrito-vacio">Todavía no agregaste platos. Volvé al menú y tocá <strong>"Agregar al carrito"</strong> en lo que quieras.</p>';
      } else {
        cartItemsListEl.innerHTML = entradas.map(([id, item]) => `
          <div class="cart-item" data-id="${id}">
            <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-img">
            <div class="cart-item-info">
              <strong>${item.nombre}</strong>
              <span class="cart-item-price">${formatearPrecio(item.precio)} c/u</span>
            </div>
            <div class="cart-qty-controls">
              <button type="button" class="qty-restar" aria-label="Restar uno a ${item.nombre}">−</button>
              <span>${item.cantidad}</span>
              <button type="button" class="qty-sumar" aria-label="Sumar uno a ${item.nombre}">+</button>
            </div>
            <span class="cart-item-subtotal">${formatearPrecio(item.precio * item.cantidad)}</span>
            <button type="button" class="cart-remove-btn" aria-label="Quitar ${item.nombre} del carrito">Quitar</button>
          </div>
        `).join('');

        // Listeners de los botones recién creados
        cartItemsListEl.querySelectorAll('.cart-item').forEach(card => {
          const id = card.dataset.id;
          card.querySelector('.qty-restar').addEventListener('click', () => cambiarCantidad(id, -1));
          card.querySelector('.qty-sumar').addEventListener('click', () => cambiarCantidad(id, 1));
          card.querySelector('.cart-remove-btn').addEventListener('click', () => eliminarDelCarrito(id));
        });
      }
    }

    // Total
    const total = calcularTotal();
    if (cartTotalEl) cartTotalEl.innerText = formatearPrecio(total);

    // Botón de WhatsApp habilitado/deshabilitado
    if (whatsappBtn) whatsappBtn.disabled = entradas.length === 0;

    // Sincroniza el borde rojo + ✔️ de las tarjetas de la carta digital
    document.querySelectorAll('.plato-libro').forEach(card => {
      const id = card.dataset.id;
      const enCarrito = Boolean(carrito[id]);
      card.classList.toggle('seleccionado', enCarrito);
      card.setAttribute('aria-pressed', enCarrito ? 'true' : 'false');
    });

    // Panel "Tu Pedido" (resumen rápido sobre la carta digital)
    if (tuPedidoListaEl) {
      if (entradas.length === 0) {
        tuPedidoListaEl.innerHTML = '<li class="tu-pedido-vacio">Todavía no elegiste ningún plato</li>';
      } else {
        tuPedidoListaEl.innerHTML = entradas.map(([, item]) => `
          <li><span class="tu-pedido-check">✔️</span> ${item.nombre}${item.cantidad > 1 ? ` <span class="tu-pedido-cant">x${item.cantidad}</span>` : ''}</li>
        `).join('');
      }
    }
  }

  function enviarPedidoWhatsApp() {
    const entradas = Object.entries(carrito);
    if (entradas.length === 0) return;

    let mensaje = 'Hola! Quiero hacer un pedido 🛒🍝\n\n';
    entradas.forEach(([id, item]) => {
      mensaje += `• ${item.nombre} x${item.cantidad} (${formatearPrecio(item.precio * item.cantidad)})\n`;
    });
    mensaje += `\nTotal: ${formatearPrecio(calcularTotal())}`;
    mensaje += '\n\n¿Me confirman el tiempo de espera? ¡Gracias!';

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  if (whatsappBtn) whatsappBtn.addEventListener('click', enviarPedidoWhatsApp);
  if (resetCartBtn) resetCartBtn.addEventListener('click', vaciarCarrito);
  if (emptyCartBtn) emptyCartBtn.addEventListener('click', vaciarCarrito);

  /* =========================================================
     3) FETCH DE PRODUCTOS ("API REST" propia: productos.json)
     ========================================================= */
  const productosContainer = document.getElementById('productosContainer');

  function renderizarPlato(producto) {
    return `
      <div class="plato-libro" data-id="${producto.id}" role="button" tabindex="0"
           aria-pressed="false" aria-label="Agregar ${producto.nombre} al pedido">
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <div class="plato-libro-info">
          <h3>${producto.nombre}</h3>
          <p>${producto.descripcion}</p>
          <span class="precio-libro">${formatearPrecio(producto.precio)}</span>
        </div>
        <span class="check-badge" aria-hidden="true">✔</span>
      </div>
    `;
  }

  function renderizarProductos(productos) {
    if (!productosContainer) return;

    const mitad = Math.ceil(productos.length / 2);
    const paginaIzquierda = productos.slice(0, mitad);
    const paginaDerecha = productos.slice(mitad);

    productosContainer.innerHTML = `
      <div class="pagina pagina-izquierda">
        <h3 class="pagina-titulo">Pastas Clásicas</h3>
        ${paginaIzquierda.map(renderizarPlato).join('')}
      </div>
      <div class="pagina pagina-derecha">
        <h3 class="pagina-titulo">Recetas Tradizionales</h3>
        ${paginaDerecha.map(renderizarPlato).join('')}
      </div>
    `;

    productosContainer.querySelectorAll('.plato-libro').forEach(card => {
      const id = card.dataset.id;
      const seleccionarPlato = () => agregarAlCarrito(id);
      card.addEventListener('click', seleccionarPlato);
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          seleccionarPlato();
        }
      });
    });
  }

  function cargarProductos() {
    if (!productosContainer) return;

    fetch('productos.json')
      .then(respuesta => {
        if (!respuesta.ok) throw new Error('No se pudo cargar el menú.');
        return respuesta.json();
      })
      .then(productos => {
        productosCache = productos;
        renderizarProductos(productos);
        renderizarCarrito(); // por si ya había algo guardado en localStorage
      })
      .catch(error => {
        console.error(error);
        productosContainer.innerHTML = '<p class="productos-error">No pudimos cargar el menú. Probá recargando la página.</p>';
      });
  }

  cargarProductos();

  /* =========================================================
     4) CARRUSEL DEL LOCAL + LIGHTBOX
     ========================================================= */
  const track = document.getElementById('carouselTrack');
  const slides = document.querySelectorAll('.carousel-slide');
  const dotsContainer = document.getElementById('carouselDots');
  const carouselEl = document.getElementById('localCarousel');
  const prevBtn = document.getElementById('carouselPrevBtn');
  const nextBtn = document.getElementById('carouselNextBtn');

  let slideActual = 0;
  let autoplayInterval;

  if (track && slides.length && dotsContainer) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Ir a la foto ${i + 1}`);
      dot.addEventListener('click', () => irASlide(i));
      dotsContainer.appendChild(dot);
    });
    const dots = document.querySelectorAll('.dot');

    function irASlide(index) {
      slideActual = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${slideActual * 100}%)`;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === slideActual));
    }

    function reiniciarAutoplay() {
      clearInterval(autoplayInterval);
      autoplayInterval = setInterval(() => irASlide(slideActual + 1), 8000);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { irASlide(slideActual - 1); reiniciarAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { irASlide(slideActual + 1); reiniciarAutoplay(); });

    // Lightbox
    const lightbox = document.getElementById('carouselLightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    const trackImages = document.querySelectorAll('.carousel-slide img');

    function abrirLightbox(index) {
      irASlide(index);
      const img = slides[slideActual].querySelector('img');
      lightboxImage.src = img.src;
      lightboxImage.alt = img.alt;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function cerrarLightbox() {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function moverLightbox(direccion) {
      abrirLightbox(slideActual + direccion);
    }

    trackImages.forEach((img, i) => {
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => abrirLightbox(i));
    });

    if (lightboxClose) lightboxClose.addEventListener('click', cerrarLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', () => moverLightbox(-1));
    if (lightboxNext) lightboxNext.addEventListener('click', () => moverLightbox(1));
    if (lightbox) {
      lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) cerrarLightbox();
      });
    }

    window.addEventListener('keydown', (event) => {
      if (!lightbox || !lightbox.classList.contains('open')) return;
      if (event.key === 'Escape') cerrarLightbox();
      if (event.key === 'ArrowRight') moverLightbox(1);
      if (event.key === 'ArrowLeft') moverLightbox(-1);
    });

    if (carouselEl) {
      carouselEl.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
      carouselEl.addEventListener('mouseleave', reiniciarAutoplay);
    }

    reiniciarAutoplay();
  }

  /* =========================================================
     5) FORMULARIO DE CONTACTO (validación + envío por Formspree)
     ========================================================= */
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    const nombreInput = document.getElementById('nombre');
    const correoInput = document.getElementById('correo');
    const mensajeInput = document.getElementById('mensaje');
    const formMsg = document.getElementById('formMsg');

    function mostrarError(input, errorId, texto) {
      input.classList.add('invalid');
      input.setAttribute('aria-invalid', 'true');
      const errorEl = document.getElementById(errorId);
      if (errorEl) errorEl.textContent = texto;
    }

    function limpiarError(input, errorId) {
      input.classList.remove('invalid');
      input.removeAttribute('aria-invalid');
      const errorEl = document.getElementById(errorId);
      if (errorEl) errorEl.textContent = '';
    }

    function validarEmail(valor) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
    }

    function validarFormulario() {
      let esValido = true;

      if (nombreInput.value.trim() === '') {
        mostrarError(nombreInput, 'errorNombre', 'Ingresá tu nombre.');
        esValido = false;
      } else {
        limpiarError(nombreInput, 'errorNombre');
      }

      if (!validarEmail(correoInput.value.trim())) {
        mostrarError(correoInput, 'errorCorreo', 'Ingresá un correo electrónico válido.');
        esValido = false;
      } else {
        limpiarError(correoInput, 'errorCorreo');
      }

      if (mensajeInput.value.trim() === '') {
        mostrarError(mensajeInput, 'errorMensaje', 'Escribí tu mensaje o consulta.');
        esValido = false;
      } else {
        limpiarError(mensajeInput, 'errorMensaje');
      }

      return esValido;
    }

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!validarFormulario()) {
        formMsg.textContent = 'Revisá los campos marcados antes de enviar.';
        formMsg.className = 'form-msg error';
        return;
      }

      formMsg.textContent = 'Enviando...';
      formMsg.className = 'form-msg loading';

      const datos = new FormData(contactForm);

      fetch(contactForm.action, {
        method: 'POST',
        body: datos,
        headers: { Accept: 'application/json' }
      })
        .then(respuesta => {
          if (respuesta.ok) {
            formMsg.textContent = '¡Gracias! Tu mensaje fue enviado correctamente.';
            formMsg.className = 'form-msg success';
            contactForm.reset();
          } else {
            throw new Error('Error en el envío');
          }
        })
        .catch(() => {
          formMsg.textContent = 'Ocurrió un error al enviar el mensaje. Probá de nuevo en un momento.';
          formMsg.className = 'form-msg error';
        });
    });

    // Limpia el error de un campo apenas el usuario empieza a corregirlo
    nombreInput.addEventListener('input', () => limpiarError(nombreInput, 'errorNombre'));
    correoInput.addEventListener('input', () => limpiarError(correoInput, 'errorCorreo'));
    mensajeInput.addEventListener('input', () => limpiarError(mensajeInput, 'errorMensaje'));
  }

  /* =========================================================
     6) BOTÓN "IR ARRIBA"
     ========================================================= */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    const toggleBackToTop = () => {
      if (window.scrollY > 300) backToTop.classList.add('visible');
      else backToTop.classList.remove('visible');
    };

    window.addEventListener('scroll', toggleBackToTop);
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    backToTop.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); backToTop.click(); }
    });
    toggleBackToTop();
  }

  /* =========================================================
     7) SISTEMA DE TRADUCCIÓN (Español e Italiano)
     ========================================================= */
  const translations = {
    es: {
      'Inicio': 'Inicio',
      'Productos': 'Productos',
      'Nuestro Local': 'Nuestro Local',
      'Quiénes somos': 'Quiénes somos',
      'Reseñas': 'Reseñas',
      'Contacto': 'Contacto',
      'Carrito': '🛒 Carrito',
      'Vaciar carrito': 'Vaciar carrito',
      'Tu Pedido': 'Tu Pedido',
      'Platos seleccionados:': 'Platos seleccionados:',
      'Todavía no elegiste ningún plato': 'Todavía no elegiste ningún plato',
      'Ver carrito completo →': 'Ver carrito completo →',
      'Tu Carrito': 'Tu Carrito',
      'Revisá, editá cantidades y confirmá tu pedido': 'Revisá, editá cantidades y confirmá tu pedido',
      'Nuestros Platos': 'Nuestros Platos',
      '📖 Tocá un plato para agregarlo a tu pedido. Tocalo de nuevo para sumar otra unidad.': '📖 Tocá un plato para agregarlo a tu pedido. Tocalo de nuevo para sumar otra unidad.',
      'Pastas Clásicas': 'Pastas Clásicas',
      'Recetas Tradizionales': 'Recetas Tradizionales',
      'Conocé Nuestro Local': 'Conocé Nuestro Local',
      '¿Dónde estamos?': '¿Dónde estamos?',
      'Nuestra Historia:': 'Nuestra Historia:',
      'Lo que dicen nuestros clientes:': 'Lo que dicen nuestros clientes:',
      '🍝 Contacto': '🍝 Contacto',
      'Consultas, reservas o lo que necesites': 'Consultas, reservas o lo que necesites',
      'descripcion-principal': 'Il Sogno Italiano "El Sueño Italiano" son mucho más que una pasta: representan la unión de la familia y el valor de las tradiciones. Cada receta nace del cariño transmitido de generación en generación, con el sabor casero que convierte cada encuentro en un buen momento compartido. Alrededor de la mesa, las pastas se transforman en símbolo de alegría, compañía y recuerdos que perduran.'
    },
    it: {
      'Inicio': 'Inizio',
      'Productos': 'Prodotti',
      'Nuestro Local': 'Il Nostro Locale',
      'Quiénes somos': 'Chi Siamo',
      'Reseñas': 'Recensioni',
      'Contacto': 'Contatti',
      'Carrito': '🛒 Carrello',
      'Vaciar carrito': 'Svuota carrello',
      'Tu Pedido': 'Il Tuo Ordine',
      'Platos seleccionados:': 'Piatti selezionati:',
      'Todavía no elegiste ningún plato': 'Non hai ancora scelto nessun piatto',
      'Ver carrito completo →': 'Visualizza carrello completo →',
      'Tu Carrito': 'Il Tuo Carrello',
      'Revisá, editá cantidades y confirmá tu pedido': 'Controlla, modifica le quantità e conferma il tuo ordine',
      'Nuestros Platos': 'I Nostri Piatti',
      '📖 Tocá un plato para agregarlo a tu pedido. Tocalo de nuevo para sumar otra unidad.': '📖 Tocca un piatto per aggiungerlo al tuo ordine. Toccalo di nuovo per aggiungere un\'altra unità.',
      'Pastas Clásicas': 'Paste Classiche',
      'Recetas Tradizionales': 'Ricette Tradizionali',
      'Conocé Nuestro Local': 'Conosci Il Nostro Locale',
      '¿Dónde estamos?': 'Dove Siamo?',
      'Nuestra Historia:': 'La Nostra Storia:',
      'Lo que dicen nuestros clientes:': 'Quello che dicono i nostri clienti:',
      '🍝 Contacto': '🍝 Contatti',
      'Consultas, reservas o lo que necesites': 'Domande, prenotazioni o quel che ti serve',
      'descripcion-principal': 'Il Sogno Italiano "Il Sogno Italiano" è molto più che una pasta: rappresenta l\'unione della famiglia e il valore delle tradizioni. Ogni ricetta nasce dall\'affetto trasmesso di generazione in generazione, con il sapore casalingo che trasforma ogni incontro in un buon momento condiviso. Intorno al tavolo, le paste si trasformano in simbolo di gioia, compagnia e ricordi che durano.'
    }
  };

  let lenguaActual = localStorage.getItem('idioma') || 'es';

  const btnSpanish = document.getElementById('btnSpanish');
  const btnItalian = document.getElementById('btnItalian');

  function cambiarIdioma(idioma) {
    lenguaActual = idioma;
    localStorage.setItem('idioma', idioma);

    // Actualizar botones activos
    if (btnSpanish) btnSpanish.classList.toggle('active', idioma === 'es');
    if (btnItalian) btnItalian.classList.toggle('active', idioma === 'it');

    // Traducir textos de la página
    document.querySelectorAll('[data-translate]').forEach(elemento => {
      const clave = elemento.getAttribute('data-translate');
      if (translations[idioma][clave]) {
        if (elemento.tagName === 'INPUT' || elemento.tagName === 'BUTTON') {
          elemento.value = translations[idioma][clave];
          elemento.textContent = translations[idioma][clave];
        } else {
          elemento.textContent = translations[idioma][clave];
        }
      }
    });

    // Traducir descripciones especiales con líneas
    const descripcionEl = document.getElementById('descripcion1');
    if (descripcionEl) {
      const textoTraducido = translations[idioma]['descripcion-principal'];
      descripcionEl.innerHTML = textoTraducido.replace(/\n/g, '<br>');
    }

    // Traducir href de enlaces
    document.querySelectorAll('[data-translate-href]').forEach(elemento => {
      const enlace = elemento.getAttribute('data-translate-href');
      if (enlace) elemento.textContent = enlace;
    });
  }

  if (btnSpanish) {
    btnSpanish.addEventListener('click', () => cambiarIdioma('es'));
    btnSpanish.classList.toggle('active', lenguaActual === 'es');
  }

  if (btnItalian) {
    btnItalian.addEventListener('click', () => cambiarIdioma('it'));
    btnItalian.classList.toggle('active', lenguaActual === 'it');
  }

  // Inicializar con el idioma guardado
  if (lenguaActual === 'it') cambiarIdioma('it');

});