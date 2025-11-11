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
import type { ICreatePedido, MetodoPago } from "../../../types/IPedido.ts";
import { getUserLogged } from "../../../utils/authLocal.ts";
import { envs } from "../../../utils/enviromentVariable.ts";

const API_URL = envs.API_URL;

// Inicializar funcionalidades del navbar
document.addEventListener('DOMContentLoaded', () => {
    initBurgerMenu();
    initLogoutButton();
    initNavbar({ cartUrl: './cart.html' }); // Ya estamos en el carrito
    renderizarCarrito();
    configurarEventos();
    configurarModalAlert();
});

// Verificar autenticación
const initPage = () => {
    console.log("Inicio de página del carrito");
    checkAuthUser('CLIENT');
};

initPage();

/**
 * Tipo de alerta para el modal
 */
type AlertType = 'success' | 'error' | 'warning' | 'info';

/**
 * Muestra un modal de alerta personalizado
 */
function mostrarAlerta(mensaje: string, tipo: AlertType = 'info', titulo?: string): void {
    const modal = document.getElementById('modal-alert') as HTMLElement;
    const icon = document.getElementById('modal-alert-icon') as HTMLElement;
    const titleEl = document.getElementById('modal-alert-title') as HTMLElement;
    const messageEl = document.getElementById('modal-alert-message') as HTMLElement;

    if (!modal || !icon || !titleEl || !messageEl) return;

    // Configurar icono y título según el tipo
    icon.className = 'bi modal-alert__icon';
    switch (tipo) {
        case 'success':
            icon.classList.add('bi-check-circle-fill', 'success');
            titleEl.textContent = titulo || '¡Éxito!';
            break;
        case 'error':
            icon.classList.add('bi-x-circle-fill', 'error');
            titleEl.textContent = titulo || 'Error';
            break;
        case 'warning':
            icon.classList.add('bi-exclamation-triangle-fill', 'warning');
            titleEl.textContent = titulo || 'Advertencia';
            break;
        case 'info':
        default:
            icon.classList.add('bi-info-circle-fill', 'info');
            titleEl.textContent = titulo || 'Información';
            break;
    }

    // Configurar mensaje
    messageEl.textContent = mensaje;

    // Mostrar modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

/**
 * Cierra el modal de alerta
 */
function cerrarAlerta(): void {
    const modal = document.getElementById('modal-alert') as HTMLElement;
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

/**
 * Configura los eventos del modal de alerta
 */
function configurarModalAlert(): void {
    const closeBtn = document.getElementById('modal-alert-close');
    const modal = document.getElementById('modal-alert');

    if (closeBtn) {
        closeBtn.addEventListener('click', cerrarAlerta);
    }

    if (modal) {
        const overlay = modal.querySelector('.modal-alert__overlay');
        if (overlay) {
            overlay.addEventListener('click', cerrarAlerta);
        }
    }
}

/**
 * Muestra un modal de confirmación y devuelve una promesa con la respuesta del usuario
 */
function mostrarConfirmacion(mensaje: string, titulo: string = 'Confirmar acción'): Promise<boolean> {
    return new Promise((resolve) => {
        const modal = document.getElementById('modal-confirm') as HTMLElement;
        const titleEl = document.getElementById('modal-confirm-title') as HTMLElement;
        const messageEl = document.getElementById('modal-confirm-message') as HTMLElement;
        const acceptBtn = document.getElementById('modal-confirm-accept') as HTMLButtonElement;
        const cancelBtn = document.getElementById('modal-confirm-cancel') as HTMLButtonElement;

        if (!modal || !titleEl || !messageEl || !acceptBtn || !cancelBtn) {
            resolve(false);
            return;
        }

        // Configurar contenido
        titleEl.textContent = titulo;
        messageEl.textContent = mensaje;

        // Mostrar modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Función para cerrar el modal
        const cerrarModal = () => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            acceptBtn.removeEventListener('click', handleAccept);
            cancelBtn.removeEventListener('click', handleCancel);
            overlay?.removeEventListener('click', handleCancel);
        };

        // Manejadores de eventos
        const handleAccept = () => {
            cerrarModal();
            resolve(true);
        };

        const handleCancel = () => {
            cerrarModal();
            resolve(false);
        };

        // Agregar eventos
        acceptBtn.addEventListener('click', handleAccept);
        cancelBtn.addEventListener('click', handleCancel);

        const overlay = modal.querySelector('.modal-alert__overlay');
        if (overlay) {
            overlay.addEventListener('click', handleCancel);
        }
    });
}

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
        container.classList.add('cart-empty');
        container.innerHTML = `
            <div style="display: flex;text-align: center;padding: 3rem;color: #aaa;height: 100%;align-items: center;flex-direction: column;justify-content: center;">
                <i class="bi bi-cart-x" style="font-size: 4rem; margin-bottom: 1rem;"></i>
                <h3>Tu carrito está vacío</h3>
                <p>Agrega productos desde la <a href="../home/home.html" style="color: #ff00ff;">tienda</a></p>
            </div>
        `;
        actualizarResumen();
        return;
    }

    // Quitar clase de carrito vacío si hay items
    container.classList.remove('cart-empty');

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
                mostrarAlerta('Tu carrito está vacío', 'warning');
                return;
            }
            mostrarModalCheckout();
        });
    }

    // Configurar eventos del modal de checkout
    configurarModalCheckout();
}

/**
 * Maneja el cambio de cantidad de un item
 */
async function manejarCambiarCantidad(itemId: number, cambio: number): Promise<void> {
    const items = getCartItems();
    const item = items.find(i => i.id === itemId);
    
    if (!item) return;

    const nuevaCantidad = item.cantidad + cambio;
    
    if (nuevaCantidad < 1) {
        // Si la cantidad llega a 0, preguntar si quiere eliminar
        const confirmar = await mostrarConfirmacion(
            `¿Deseas eliminar "${item.nombre}" del carrito?`,
            'Eliminar producto'
        );
        if (confirmar) {
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
async function manejarEliminarItem(itemId: number): Promise<void> {
    const items = getCartItems();
    const item = items.find(i => i.id === itemId);
    
    if (!item) return;

    const confirmar = await mostrarConfirmacion(
        `¿Deseas eliminar "${item.nombre}" del carrito?`,
        'Eliminar producto'
    );
    if (confirmar) {
        removeFromCart(itemId);
        renderizarCarrito();
    }
}

/**
 * Maneja el vaciado completo del carrito
 */
async function manejarVaciarCarrito(): Promise<void> {
    const items = getCartItems();
    
    if (items.length === 0) {
        mostrarAlerta('Tu carrito ya está vacío', 'info');
        return;
    }

    const confirmar = await mostrarConfirmacion(
        '¿Estás seguro de que deseas vaciar todo el carrito?',
        'Vaciar carrito'
    );
    if (confirmar) {
        clearCart();
        renderizarCarrito();
    }
}

/**
 * Muestra el modal de checkout con el resumen del pedido
 */
function mostrarModalCheckout(): void {
    const modal = document.getElementById('modal-checkout') as HTMLElement;
    if (!modal) return;

    // Renderizar items en el modal
    const items = getCartItems();
    const modalItemsContainer = document.getElementById('modal-checkout-items') as HTMLElement;
    
    if (modalItemsContainer) {
        modalItemsContainer.innerHTML = '';
        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'modal-checkout__item';
            itemDiv.innerHTML = `
                <div>
                    <span class="modal-checkout__item-name">${item.nombre}</span>
                    <span class="modal-checkout__item-qty"> x${item.cantidad}</span>
                </div>
                <span class="modal-checkout__item-price">${formatPrice(item.precio * item.cantidad)}</span>
            `;
            modalItemsContainer.appendChild(itemDiv);
        });
    }

    // Actualizar totales en el modal
    const subtotal = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const envio = 500;
    const total = getCartTotal(envio);

    const modalSubtotal = document.getElementById('modal-subtotal');
    const modalShipping = document.getElementById('modal-shipping');
    const modalTotal = document.getElementById('modal-total');

    if (modalSubtotal) modalSubtotal.textContent = formatPrice(subtotal);
    if (modalShipping) modalShipping.textContent = formatPrice(envio);
    if (modalTotal) modalTotal.textContent = formatPrice(total);

    // Mostrar modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

/**
 * Cierra el modal de checkout
 */
function cerrarModalCheckout(): void {
    const modal = document.getElementById('modal-checkout') as HTMLElement;
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Limpiar formulario
    const form = document.getElementById('form-checkout') as HTMLFormElement;
    if (form) form.reset();
}

/**
 * Configura los eventos del modal de checkout
 */
function configurarModalCheckout(): void {
    const modal = document.getElementById('modal-checkout');
    const closeBtn = document.getElementById('modal-checkout-close');
    const cancelBtn = document.getElementById('btn-cancel-checkout');
    const form = document.getElementById('form-checkout') as HTMLFormElement;

    // Botón cerrar (X)
    if (closeBtn) {
        closeBtn.addEventListener('click', cerrarModalCheckout);
    }

    // Botón cancelar
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cerrarModalCheckout);
    }

    // Cerrar al hacer clic en el overlay
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cerrarModalCheckout();
            }
        });
    }

    // Envío del formulario
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await procesarPedido();
        });
    }
}

/**
 * Procesa el pedido y lo envía al servidor
 */
async function procesarPedido(): Promise<void> {
    const form = document.getElementById('form-checkout') as HTMLFormElement;
    const formData = new FormData(form);

    // Obtener datos del formulario
    const direccion = formData.get('direccion') as string;
    const telefono = formData.get('telefono') as string;
    const metodoPago = formData.get('metodoPago') as MetodoPago;
    const notasAdicionales = (formData.get('notasAdicionales') as string) || '';

    // Validar datos
    if (!direccion || !telefono || !metodoPago) {
        mostrarAlerta('Por favor completa todos los campos requeridos', 'warning');
        return;
    }

    // Validar método de pago
    if (metodoPago !== 'EFECTIVO' && metodoPago !== 'TRANSFERENCIA_BANCARIA') {
        mostrarAlerta('Método de pago no válido', 'error');
        return;
    }

    // Obtener usuario del localStorage
    const user = getUserLogged();
    if (!user || !user.id) {
        mostrarAlerta('No se pudo obtener la información del usuario', 'error');
        return;
    }

    // Obtener fecha actual en formato YYYY-MM-DD
    const fechaActual = new Date().toISOString().split('T')[0];

    // Preparar datos del pedido según el formato del backend
    const items = getCartItems();
    
    if (items.length === 0) {
        mostrarAlerta('Tu carrito está vacío', 'warning');
        return;
    }

    const pedido: ICreatePedido = {
        fecha: fechaActual,
        usuarioId: user.id,
        detalles: items.map(item => ({
            cantidad: item.cantidad,
            productoId: item.id
        })),
        informacionDeEntrega: {
            direccion,
            telefono,
            metodoPago,
            notasAdicionales
        }
    };

    const total = getCartTotal(500);

    try {
        const response = await fetch(`${API_URL}/pedidos`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedido)
        });

        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            let errorData: any = {};
            
            if (contentType && contentType.includes('application/json')) {
                errorData = await response.json();
            } else {
                const textError = await response.text();
                errorData = { message: textError };
            }
            
            const errorMsg = errorData.message || errorData.error || JSON.stringify(errorData);
            throw new Error(`Error del servidor (${response.status}): ${errorMsg}`);
        }

        const resultado = await response.json();

        // Mostrar mensaje de éxito
        const mensajeExito = `Número de pedido: ${resultado.id || 'N/A'}\nDirección: ${direccion}\nTeléfono: ${telefono}\nMétodo de Pago: ${metodoPago}\nTotal: ${formatPrice(total)}`;
        mostrarAlerta(mensajeExito, 'success', '¡Pedido realizado con éxito!');

        // Limpiar carrito y cerrar modal
        clearCart();
        cerrarModalCheckout();
        renderizarCarrito();

    } catch (error) {
        console.error('Error al procesar pedido:', error);
        const mensajeError = `${error instanceof Error ? error.message : 'Error desconocido'}\n\nPor favor intenta nuevamente.`;
        mostrarAlerta(mensajeError, 'error', 'Error al procesar pedido');
    }
}
