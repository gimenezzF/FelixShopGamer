// Toggle del menú
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Función para actualizar subtotales y total
function actualizarTotal() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  let total = 0;

  const tbody = document.getElementById('carrito-items');
  if(tbody){
    tbody.querySelectorAll('tr').forEach((tr, i) => {
      const cantidad = parseInt(tr.querySelector('.cantidad').value);
      const precio = carrito[i].precio;
      tr.children[3].innerText = `$${(precio * cantidad).toLocaleString()}`;
      total += precio * cantidad;
    });
    document.querySelector('h3').innerText = `Total: $${total.toLocaleString()}`;
  }
}

// Función para agregar producto al carrito
function agregarAlCarrito(nombre, precio) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

  const index = carrito.findIndex(item => item.nombre === nombre);
  if(index >= 0){
    carrito[index].cantidad += 1;
  } else {
    carrito.push({ nombre, precio, cantidad: 1 });
  }

  localStorage.setItem('carrito', JSON.stringify(carrito));
  alert(`${nombre} agregado al carrito`);
}

// Cargar carrito en carrito.html
function cargarCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const tbody = document.getElementById('carrito-items');
  if(!tbody) return;

  tbody.innerHTML = '';
  let total = 0;

  carrito.forEach((item, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.nombre}</td>
      <td><input type="number" value="${item.cantidad}" min="1" class="form-control form-control-sm cantidad" data-index="${i}"></td>
      <td>$${item.precio.toLocaleString()}</td>
      <td>$${(item.precio * item.cantidad).toLocaleString()}</td>
      <td><button class="btn btn-danger btn-sm eliminar" data-index="${i}"><i class="fas fa-trash"></i></button></td>
    `;
    tbody.appendChild(tr);
    total += item.precio * item.cantidad;
  });

  document.querySelector('h3').innerText = `Total: $${total.toLocaleString()}`;

  // Eliminar productos
  document.querySelectorAll('.eliminar').forEach(btn => {
    btn.addEventListener('click', e => {
      const index = e.currentTarget.dataset.index;
      carrito.splice(index, 1);
      localStorage.setItem('carrito', JSON.stringify(carrito));
      cargarCarrito();
    });
  });

  // Cambiar cantidad
  document.querySelectorAll('.cantidad').forEach(input => {
    input.addEventListener('input', e => {
      const index = e.target.dataset.index;
      let val = parseInt(e.target.value);
      if(val < 1) val = 1;
      carrito[index].cantidad = val;
      localStorage.setItem('carrito', JSON.stringify(carrito));
      cargarCarrito();
    });
  });
}

// Vaciar carrito
document.getElementById('vaciar-carrito')?.addEventListener('click', () => {
  localStorage.removeItem('carrito');
  cargarCarrito();
});

// Botón de finalizar compra
document.querySelector('.btn-finalizar')?.addEventListener('click', () => {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  if(carrito.length === 0){
    alert('Tu carrito está vacío.');
    return;
  }

  // Vaciar carrito y mostrar mensaje RGB
  localStorage.removeItem('carrito');

  const main = document.querySelector('main');
  main.innerHTML = '';
  const mensaje = document.createElement('h1');
  mensaje.innerText = '¡Muchísimas gracias por tu compra en la tienda de FeliShop!';
  mensaje.style.textAlign = 'center';
  mensaje.style.marginTop = '50px';
  mensaje.style.fontSize = '2.5rem';
  mensaje.style.fontWeight = 'bold';
  mensaje.style.textShadow = '0 0 5px #fff, 0 0 10px #fff, 0 0 20px #ff00ff, 0 0 30px #00ffff';
  main.appendChild(mensaje);

  let hue = 0;
  const rgbAnim = setInterval(() => {
    mensaje.style.color = `hsl(${hue}, 100%, 50%)`;
    mensaje.style.textShadow = `0 0 10px hsl(${hue}, 100%, 50%), 0 0 20px hsl(${hue}, 100%, 50%), 0 0 30px hsl(${(hue+60)%360}, 100%, 50%), 0 0 40px hsl(${(hue+120)%360}, 100%, 50%)`;
    hue = (hue + 2) % 360;
  }, 50);

  setTimeout(() => {
    clearInterval(rgbAnim);
    window.location.href = '../index.html';
  }, 10000);
});

// Ejecutar cargarCarrito al abrir carrito.html
if(document.getElementById('carrito-items')){
  cargarCarrito();
}
