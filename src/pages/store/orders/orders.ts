import { checkAuthUser, getUserLogged } from "../../../utils/authLocal.ts";
import { initBurgerMenu } from "../../../utils/burger-menu.ts";
import { initLogoutButton } from "../../../utils/logoutButton.ts";
import { initNavbar } from "../../../utils/navbar.ts";
import { envs } from "../../../utils/enviromentVariable.ts";
import type { IPedido } from "../../../types/IPedido.ts";
import { formatPrice } from "../../../utils/cart.ts";

const API_URL = envs.API_URL;

// Inicializar funcionalidades del navbar
document.addEventListener('DOMContentLoaded', () => {
    initBurgerMenu();
    initLogoutButton();
    initNavbar({ cartUrl: '../cart/cart.html' });
    cargarPedidos();
    configurarFiltro();
    configurarModal();
});

// Verificar autenticación
const initPage = () => {
    console.log("Inicio de página de pedidos");
    checkAuthUser('CLIENT');
};

initPage();

// Variable global para almacenar los pedidos
let todosLosPedidos: IPedido[] = [];

/**
 * Carga y muestra los pedidos del usuario
 */
async function cargarPedidos(): Promise<void> {
    const container = document.querySelector('.orders-container') as HTMLElement;
    if (!container) return;

    // Obtener el usuario del localStorage
    const user = getUserLogged();
    if (!user || !user.id) {
        mostrarError(container, 'No se pudo obtener la información del usuario');
        return;
    }

    // Mostrar mensaje de carga
    container.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 2rem;">Cargando pedidos...</p>';

    try {
        const response = await fetch(`${API_URL}/pedidos`);
        
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const pedidos: IPedido[] = await response.json();
        
        // Filtrar solo los pedidos del usuario actual
        todosLosPedidos = pedidos.filter(pedido => pedido.usuarioId === user.id);
        
        if (todosLosPedidos.length === 0) {
            mostrarMensajeVacio(container);
            return;
        }

        // Renderizar pedidos
        renderizarPedidos(todosLosPedidos);

    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        mostrarError(container, 'Error al cargar los pedidos. Por favor intenta nuevamente.');
    }
}

/**
 * Renderiza la lista de pedidos
 */
async function renderizarPedidos(pedidos: IPedido[]): Promise<void> {
    const container = document.querySelector('.orders-container') as HTMLElement;
    if (!container) return;

    // Limpiar el contenedor (mantener solo la tarjeta de ejemplo si existe)
    const ejemploCard = container.querySelector('.order-card');
    container.innerHTML = '';
    
    // Si hay una tarjeta de ejemplo, removerla
    if (ejemploCard) {
        ejemploCard.remove();
    }

    if (pedidos.length === 0) {
        mostrarMensajeVacio(container);
        return;
    }

    // Ordenar pedidos por ID (más recientes primero)
    const pedidosOrdenados = [...pedidos].sort((a, b) => {
        return b.id - a.id;
    });

    // Renderizar cada pedido
    for (const pedido of pedidosOrdenados) {
        const card = await crearTarjetaPedido(pedido);
        container.appendChild(card);
    }
}

/**
 * Crea la tarjeta HTML para un pedido
 */
async function crearTarjetaPedido(pedido: IPedido): Promise<HTMLElement> {
    const card = document.createElement('div');
    card.className = 'order-card';

    // Formatear fecha (sin hora)
    const fecha = new Date(pedido.fecha);
    const fechaFormateada = fecha.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Obtener clase CSS del estado
    const estadoClass = getEstadoClass(pedido.estado);

    // Calcular total de productos
    const totalProductos = pedido.detalles.reduce((sum, detalle) => sum + detalle.cantidad, 0);

    // Obtener nombres de productos
    const itemsHTML = await Promise.all(
        pedido.detalles.map(async (detalle) => {
            let nombreProducto = `Producto ID: ${detalle.productoId}`;
            
            try {
                const response = await fetch(`${API_URL}/productos/${detalle.productoId}`);
                if (response.ok) {
                    const producto = await response.json();
                    nombreProducto = producto.nombre || nombreProducto;
                }
            } catch (error) {
                console.error(`Error al cargar producto ${detalle.productoId}:`, error);
            }

            return `
                <div class="order-item">
                    <div class="order-item-info">
                        <span class="order-item-name">• ${nombreProducto}</span>
                        <span class="order-item-qty">(x${detalle.cantidad})</span>
                    </div>
                </div>
            `;
        })
    );

    card.innerHTML = `
        <div class="order-header">
            <div class="order-header-left">
                <div class="order-id">Pedido #ORD-${pedido.id}</div>
                <div class="order-date">
                    <i class="bi bi-calendar"></i> ${fechaFormateada}
                </div>
            </div>
            <span class="order-status ${estadoClass}">${formatEstado(pedido.estado)}</span>
        </div>

        <div class="order-body">
            <div class="order-items">
                ${itemsHTML.join('')}
            </div>

            <div class="order-summary">
                <div class="order-summary-icon">
                    <i class="bi bi-box-seam"></i>
                    <span>${totalProductos} producto(s)</span>
                </div>
                <div class="order-total">
                    <span class="order-total-value">${formatPrice(pedido.total || 0)}</span>
                </div>
            </div>
        </div>
    `;

    // Agregar evento click para abrir el modal
    card.addEventListener('click', () => {
        abrirModalDetalle(pedido);
    });

    return card;
}

/**
 * Obtiene la clase CSS según el estado del pedido
 */
function getEstadoClass(estado: string): string {
    const estadoMap: { [key: string]: string } = {
        'PENDIENTE': 'order-status--pendiente',
        'CONFIRMADO': 'order-status--confirmado',
        'CANCELADO': 'order-status--cancelado',
        'TERMINADO': 'order-status--terminado'
    };
    return estadoMap[estado] || 'order-status--pendiente';
}

/**
 * Formatea el estado para mostrar
 */
function formatEstado(estado: string): string {
    const estadoMap: { [key: string]: string } = {
        'PENDIENTE': 'Pendiente',
        'CONFIRMADO': 'Confirmado',
        'CANCELADO': 'Cancelado',
        'TERMINADO': 'Terminado'
    };
    return estadoMap[estado] || estado;
}

/**
 * Muestra mensaje cuando no hay pedidos
 */
function mostrarMensajeVacio(container: HTMLElement): void {
    container.innerHTML = `
        <div class="orders-empty">
            <i class="bi bi-receipt"></i>
            <h3>No tienes pedidos aún</h3>
            <p>Realiza tu primer pedido desde la <a href="../home/home.html">tienda</a></p>
        </div>
    `;
}

/**
 * Muestra mensaje de error
 */
function mostrarError(container: HTMLElement, mensaje: string): void {
    container.innerHTML = `
        <p style="text-align: center; color: #e74c3c; padding: 2rem;">
            <i class="bi bi-exclamation-circle" style="font-size: 2rem; display: block; margin-bottom: 1rem;"></i>
            ${mensaje}
        </p>
    `;
}

/**
 * Configura el filtro de pedidos
 */
function configurarFiltro(): void {
    const filtro = document.querySelector('.orders-filter') as HTMLSelectElement;
    if (!filtro) return;

    filtro.addEventListener('change', () => {
        const estadoSeleccionado = filtro.value;
        
        if (estadoSeleccionado === 'todos') {
            renderizarPedidos(todosLosPedidos);
        } else {
            const pedidosFiltrados = todosLosPedidos.filter(
                pedido => pedido.estado === estadoSeleccionado
            );
            renderizarPedidos(pedidosFiltrados);
        }
    });
}

/**
 * Abre el modal con los detalles del pedido
 */
async function abrirModalDetalle(pedido: IPedido): Promise<void> {
    const modal = document.getElementById('modal-detalle-pedido');
    if (!modal) return;

    // Llenar información básica
    const pedidoId = document.getElementById('modal-pedido-id');
    const pedidoEstado = document.getElementById('modal-pedido-estado');
    const pedidoFecha = document.getElementById('modal-pedido-fecha');
    
    if (pedidoId) pedidoId.textContent = `#ORD-${pedido.id}`;
    if (pedidoEstado) {
        pedidoEstado.textContent = formatEstado(pedido.estado);
        pedidoEstado.className = `order-status ${getEstadoClass(pedido.estado)}`;
    }
    
    if (pedidoFecha) {
        const fecha = new Date(pedido.fecha);
        pedidoFecha.textContent = fecha.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    // Llenar información de entrega
    const direccion = document.getElementById('modal-direccion');
    const telefono = document.getElementById('modal-telefono');
    const metodoPago = document.getElementById('modal-metodo-pago');

    if (direccion) direccion.textContent = pedido.informacionDeEntrega?.direccion || 'No especificada';
    if (telefono) telefono.textContent = pedido.informacionDeEntrega?.telefono || 'No especificado';
    if (metodoPago) {
        const metodo = pedido.informacionDeEntrega?.metodoPago === 'EFECTIVO' ? '💵 Efectivo' : '🏦 Transferencia Bancaria';
        metodoPago.textContent = metodo;
    }

    // Llenar lista de productos
    const productosLista = document.getElementById('modal-productos-lista');
    if (productosLista) {
        productosLista.innerHTML = '';
        
        for (const detalle of pedido.detalles) {
            let nombreProducto = `Producto ID: ${detalle.productoId}`;
            let precioUnitario = 0;
            
            try {
                const response = await fetch(`${API_URL}/productos/${detalle.productoId}`);
                if (response.ok) {
                    const producto = await response.json();
                    nombreProducto = producto.nombre || nombreProducto;
                    precioUnitario = producto.precio || 0;
                }
            } catch (error) {
                console.error(`Error al cargar producto ${detalle.productoId}:`, error);
            }

            const subtotalProducto = precioUnitario * detalle.cantidad;

            const productoItem = document.createElement('div');
            productoItem.className = 'modal-producto-item';
            productoItem.innerHTML = `
                <div class="modal-producto-info">
                    <div class="modal-producto-nombre">${nombreProducto}</div>
                    <div class="modal-producto-cantidad">Cantidad: ${detalle.cantidad} × ${formatPrice(precioUnitario)}</div>
                </div>
                <div class="modal-producto-precio">${formatPrice(subtotalProducto)}</div>
            `;
            productosLista.appendChild(productoItem);
        }
    }

    // Calcular subtotal (sin envío)
    const subtotal = pedido.total || 0;
    const modalSubtotal = document.getElementById('modal-subtotal');
    const modalTotal = document.getElementById('modal-total');

    if (modalSubtotal) modalSubtotal.textContent = formatPrice(subtotal);
    if (modalTotal) modalTotal.textContent = formatPrice(subtotal);

    // Actualizar mensaje del footer según estado
    const modalFooter = modal.querySelector('.modal-detalle-footer');
    if (modalFooter) {
        let mensaje = '';
        let subtitulo = '';
        let icono = 'bi-hourglass-split';
        let colorClass = 'pendiente';
        
        switch (pedido.estado) {
            case 'PENDIENTE':
                mensaje = 'Tu pedido está siendo procesado';
                subtitulo = 'Te notificaremos cuando esté confirmado.';
                icono = 'bi-hourglass-split';
                colorClass = 'pendiente';
                break;
            case 'CONFIRMADO':
                mensaje = 'Tu pedido ha sido confirmado';
                subtitulo = 'Estamos preparando tu pedido para entrega.';
                icono = 'bi-check-circle';
                colorClass = 'confirmado';
                break;
            case 'TERMINADO':
                mensaje = 'Tu pedido ha sido completado';
                subtitulo = '¡Gracias por tu compra! Esperamos que disfrutes tus productos.';
                icono = 'bi-check2-all';
                colorClass = 'terminado';
                break;
            case 'CANCELADO':
                mensaje = 'Este pedido fue cancelado';
                subtitulo = 'Si tienes dudas, contacta con nuestro servicio al cliente.';
                icono = 'bi-x-circle';
                colorClass = 'cancelado';
                break;
        }

        modalFooter.innerHTML = `
            <i class="bi ${icono} ${colorClass}"></i>
            <p>${mensaje}</p>
            <p class="modal-footer-subtitle">${subtitulo}</p>
        `;
    }

    // Mostrar modal
    modal.classList.add('active');
}

/**
 * Cierra el modal de detalle
 */
function cerrarModalDetalle(): void {
    const modal = document.getElementById('modal-detalle-pedido');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Configura los eventos del modal
 */
function configurarModal(): void {
    const modal = document.getElementById('modal-detalle-pedido');
    const closeBtn = modal?.querySelector('.modal-detalle-close');

    // Cerrar con botón X
    if (closeBtn) {
        closeBtn.addEventListener('click', cerrarModalDetalle);
    }

    // Cerrar al hacer click fuera del modal
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cerrarModalDetalle();
            }
        });
    }

    // Cerrar con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarModalDetalle();
        }
    });
}
