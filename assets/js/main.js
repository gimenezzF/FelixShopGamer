// assets/js/main.js
// Manejo del menú, animaciones (no tocadas) y carrito persistente (localStorage).
document.addEventListener('DOMContentLoaded', () => {
  // MENU MÓVIL
  const toggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('active'));
    });
  }

  // MARCAR LINK ACTIVO
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    if (href === path || (href === 'index.html' && (path === '' || path === 'index.html'))) {
      a.classList.add('active');
    }
  });

  // CARRO - localStorage
  function getCart() {
    try {
      const raw = localStorage.getItem('felixCart');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Error parseando felixCart', e);
      return [];
    }
  }
  function saveCart(cart) {
    localStorage.setItem('felixCart', JSON.stringify(cart));
    updateCartCount();
  }

  function parsePrecio(text) {
    return Number(String(text).replace(/[^\d]/g, '')) || 0;
  }
  function formatPrecio(num) {
    return `$${Number(num).toLocaleString('es-CL')}`;
  }

  function addToCart(item) {
    const cart = getCart();
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      existing.qty = Number(existing.qty) + Number(item.qty);
    } else {
      cart.push(item);
    }
    saveCart(cart);
    flashCartCount();
  }

  function updateCartCount() {
    const cart = getCart();
    const totalQty = cart.reduce((s, it) => s + Number(it.qty), 0);
    let badge = document.querySelector('.cart-count');
    if (!badge) {
      const cartLink = document.querySelector('.cart-link');
      if (cartLink) {
        badge = document.createElement('span');
        badge.className = 'cart-count';
        cartLink.appendChild(badge);
      }
    }
    if (badge) {
      badge.innerText = totalQty;
      badge.style.display = totalQty > 0 ? 'inline-block' : 'none';
    }
  }

  function flashCartCount() {
    const badge = document.querySelector('.cart-count');
    if (!badge) return;
    badge.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }],
      { duration: 260, easing: 'ease-out' }
    );
  }

  // BOTONES add-to-cart
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart');
    if (!btn) return;
    e.preventDefault();

    const id = btn.dataset.id || btn.getAttribute('data-id') || generateIdFromButton(btn);
    const titulo = btn.dataset.name || btn.getAttribute('data-name') || inferTitleFromButton(btn) || 'Producto';
    let price = 0;
    if (btn.dataset.price) price = Number(btn.dataset.price);
    else if (btn.getAttribute('data-price')) price = Number(btn.getAttribute('data-price'));
    else {
      const maybePrice = btn.closest('.product-card')?.querySelector('.product-info .price')?.innerText
        || btn.closest('.card')?.querySelector('.card-body .card-text')?.innerText
        || btn.closest('.product')?.querySelector('.price')?.innerText;
      price = parsePrecio(maybePrice);
    }

    // Captura automática de imagen desde la tarjeta
    const imgEl = btn.closest('.card, .product-card, .card-link')?.querySelector('img');
    const img = imgEl ? imgEl.getAttribute('src') : '';

    const item = { id: String(id), titulo: String(titulo), price: Number(price), qty: 1, img: String(img) };
    addToCart(item);
  });

  function generateIdFromButton(btn) {
    const container = btn.closest('.product-card') || btn.closest('.card') || btn.closest('article');
    const title = container?.querySelector('h4, h5, .card-title')?.innerText || Date.now().toString();
    return title.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 50);
  }
  function inferTitleFromButton(btn) {
    const container = btn.closest('.product-card') || btn.closest('.card') || btn.closest('article');
    return container?.querySelector('h4, h5, .card-title')?.innerText?.trim();
  }

  // CARRO EN carrito.html
  if (location.pathname.split('/').pop() === 'carrito.html') {
    const tbody = document.getElementById('carrito-items');
    const totalNode = document.getElementById('total-carrito');
    const vaciarBtn = document.getElementById('vaciar-carrito');

    function renderCart() {
      const cart = getCart();
      tbody.innerHTML = '';
      let total = 0;
      if (cart.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center">No hay productos en el carrito.</td></tr>`;
      } else {
        cart.forEach(item => {
          const subtotal = item.price * Number(item.qty);
          total += subtotal;
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td class="align-middle">
              <div style="display:flex;gap:12px;align-items:center">
                ${item.img ? `<img src="${item.img}" alt="${escapeHtml(item.titulo)}" style="width:64px;height:64px;object-fit:cover;border-radius:8px">` : ''}
                <div><div style="font-weight:700">${escapeHtml(item.titulo)}</div></div>
              </div>
            </td>
            <td class="align-middle"><input type="number" value="${Number(item.qty)}" min="1" class="form-control form-control-sm cantidad" data-id="${escapeHtml(item.id)}"></td>
            <td class="align-middle">${formatPrecio(item.price)}</td>
            <td class="align-middle">${formatPrecio(subtotal)}</td>
            <td class="align-middle"><button class="btn btn-danger btn-sm eliminar" data-id="${escapeHtml(item.id)}"><i class="fas fa-trash"></i></button></td>
          `;
          tbody.appendChild(tr);
        });
      }
      totalNode.innerText = `Total: ${formatPrecio(total)}`;
      updateCartCount();
    }

    tbody.addEventListener('click', (e) => {
      const btn = e.target.closest('.eliminar');
      if (!btn) return;
      const id = btn.dataset.id;
      const cart = getCart().filter(i => i.id !== id);
      saveCart(cart);
      renderCart();
    });

    tbody.addEventListener('input', (e) => {
      const input = e.target.closest('.cantidad');
      if (!input) return;
      let qty = Number(input.value) || 1;
      if (qty < 1) qty = 1;
      const id = input.dataset.id;
      const cart = getCart();
      const item = cart.find(i => i.id === id);
      if (item) {
        item.qty = qty;
        saveCart(cart);
        renderCart();
      }
    });

    if (vaciarBtn) {
      vaciarBtn.addEventListener('click', () => {
        localStorage.removeItem('felixCart');
        renderCart();
      });
    }

    renderCart();
  } else {
    updateCartCount();
  }

  function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }
});
