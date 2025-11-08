import { checkAuthUser } from "../../../utils/authLocal.ts";
import { initBurgerMenu } from "../../../utils/burger-menu.ts";
import { initLogoutButton } from "../../../utils/logoutButton.ts";
import { initNavbar } from "../../../utils/navbar.ts";
import { 
    getCartItems, 
    removeFromCart, 
    updateCartItemQuantity, 
    clearCart, 
    getCartTotal,
    updateCartBadge,
    formatPrice,
    type ICartItem 
} from "../../../utils/cart.ts";

// Inicializar funcionalidades del navbar
document.addEventListener('DOMContentLoaded', () => {
    initBurgerMenu();
    initLogoutButton();
    initNavbar({ cartUrl: './cart.html' }); // Ya estamos en el carrito
    renderizarCarrito();
    configurarEventos();
});

// Verificar autenticación
const initPage = () => {
    console.log("Inicio de página del carrito");
    checkAuthUser('CLIENT');
};

initPage();

/**
 * Renderiza todos los items del carrito
 */
function renderizarCarrito(): void {
    const container = document.querySelector('.cart-items-container') as HTMLElement;
    if (!container) return;

    const items = getCartItems();
    
    // Limpiar contenedor
    container.innerHTML = '';

    // Si no hay items, mostrar mensaje
    if (items.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #aaa;">
                <i class="bi bi-cart-x" style="font-size: 4rem; margin-bottom: 1rem;"></i>
                <h3>Tu carrito está vacío</h3>
                <p>Agrega productos desde la <a href="../home/home.html" style="color: #ff00ff;">tienda</a></p>
            </div>
        `;
        actualizarResumen();
        return;
    }

    // Renderizar cada item
    items.forEach(item => {
        const itemCard = crearTarjetaItem(item);
        container.appendChild(itemCard);
    });

    // Actualizar resumen
    actualizarResumen();
}

/**
 * Crea una tarjeta HTML para un item del carrito
 */
function crearTarjetaItem(item: ICartItem): HTMLElement {
    const card = document.createElement('div');
    card.className = 'cart-item-card';
    card.dataset.itemId = item.id.toString();

    const imagenUrl = item.imagen || 'https://via.placeholder.com/100?text=Sin+Imagen';
    const subtotal = item.precio * item.cantidad;

    card.innerHTML = `
        <img src="${imagenUrl}" alt="${item.nombre}" class="cart-item-img">
        <div class="cart-item-info">
            <h3 class="cart-item-title">${item.nombre}</h3>
            <p class="cart-item-desc">${item.descripcion}</p>
            ${item.categoria ? `<span class="cart-item-category">${item.categoria}</span>` : ''}
            <span class="cart-item-price">${formatPrice(item.precio)} c/u</span>
        </div>
        <div class="cart-item-controls">
            <div class="cart-quantity-controls">
                <button class="cart-btn-quantity cart-btn-minus" data-action="decrease" data-id="${item.id}">-</button>
                <input type="number" class="cart-quantity-input" value="${item.cantidad}" min="1" readonly>
                <button class="cart-btn-quantity cart-btn-plus" data-action="increase" data-id="${item.id}">+</button>
            </div>
            <span class="cart-item-subtotal">${formatPrice(subtotal)}</span>
            <button class="cart-btn-delete" data-action="delete" data-id="${item.id}">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;

    return card;
}

/**
 * Actualiza el resumen del pedido (subtotal, envío, total)
 */
function actualizarResumen(): void {
    const items = getCartItems();
    const subtotal = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const envio = subtotal > 0 ? 500 : 0; // Envío fijo de $500 si hay productos
    const total = getCartTotal(envio);

    // Actualizar valores en el DOM usando IDs específicos
    const subtotalEl = document.getElementById('cart-subtotal');
    const envioEl = document.getElementById('cart-shipping');
    const totalEl = document.getElementById('cart-total');

    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (envioEl) envioEl.textContent = formatPrice(envio);
    if (totalEl) totalEl.textContent = formatPrice(total);

    // Actualizar badge del navbar
    updateCartBadge();
}

/**
 * Configura los event listeners para los botones del carrito
 */
function configurarEventos(): void {
    const container = document.querySelector('.cart-items-container');
    const btnClear = document.querySelector('.cart-btn-clear') as HTMLButtonElement;
    const btnCheckout = document.querySelector('.cart-btn-checkout') as HTMLButtonElement;

    // Event delegation para botones de cantidad y eliminar
    if (container) {
        container.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const button = target.closest('button') as HTMLButtonElement;
            
            if (!button) return;

            const action = button.dataset.action;
            const itemId = parseInt(button.dataset.id || '0');

            if (!itemId) return;

            switch (action) {
                case 'increase':
                    manejarCambiarCantidad(itemId, 1);
                    break;
                case 'decrease':
                    manejarCambiarCantidad(itemId, -1);
                    break;
                case 'delete':
                    manejarEliminarItem(itemId);
                    break;
            }
        });
    }

    // Botón vaciar carrito
    if (btnClear) {
        btnClear.addEventListener('click', manejarVaciarCarrito);
    }

    // Botón proceder al pago
    if (btnCheckout) {
        btnCheckout.addEventListener('click', () => {
            const items = getCartItems();
            if (items.length === 0) {
                alert('Tu carrito está vacío');
                return;
            }
            alert('Funcionalidad de pago en desarrollo...');
            // Aquí iría la lógica para proceder al pago
        });
    }
}

/**
 * Maneja el cambio de cantidad de un item
 */
function manejarCambiarCantidad(itemId: number, cambio: number): void {
    const items = getCartItems();
    const item = items.find(i => i.id === itemId);
    
    if (!item) return;

    const nuevaCantidad = item.cantidad + cambio;
    
    if (nuevaCantidad < 1) {
        // Si la cantidad llega a 0, preguntar si quiere eliminar
        if (confirm(`¿Deseas eliminar "${item.nombre}" del carrito?`)) {
            removeFromCart(itemId);
            renderizarCarrito();
        }
        return;
    }

    updateCartItemQuantity(itemId, nuevaCantidad);
    renderizarCarrito();
}

/**
 * Maneja la eliminación de un item del carrito
 */
function manejarEliminarItem(itemId: number): void {
    const items = getCartItems();
    const item = items.find(i => i.id === itemId);
    
    if (!item) return;

    if (confirm(`¿Deseas eliminar "${item.nombre}" del carrito?`)) {
        removeFromCart(itemId);
        renderizarCarrito();
    }
}

/**
 * Maneja el vaciado completo del carrito
 */
function manejarVaciarCarrito(): void {
    const items = getCartItems();
    
    if (items.length === 0) {
        alert('Tu carrito ya está vacío');
        return;
    }

    if (confirm('¿Estás seguro de que deseas vaciar todo el carrito?')) {
        clearCart();
        renderizarCarrito();
    }
}
