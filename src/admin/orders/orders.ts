import { checkAuthUser, getUserLoggedName } from "../../utils/authLocal.ts";
import { initBurgerMenu } from "../../utils/burger-menu.ts";
import { initLogoutButton } from "../../utils/logoutButton.ts";
import { initSidebar } from "../../utils/sidebar.ts";
import { envs } from "../../utils/enviromentVariable.ts";
import type { IPedido } from "../../types/IPedido.ts";
import { formatPrice } from "../../utils/cart.ts";

const API_URL = envs.API_URL;

// Inicializar sidebar
const sidebar = document.getElementById('sidebar-categorias');
const sidebarToggle = document.getElementById('sidebar-toggle');
const contenedorContenido = document.querySelector('.contenedor-contenido-pagina');

// Inicializar funcionalidades
document.addEventListener('DOMContentLoaded', () => {
    initSidebar(sidebar as HTMLElement, sidebarToggle as HTMLElement, contenedorContenido as HTMLElement);
    initBurgerMenu();
    initLogoutButton();
    
    // Mostrar nombre de usuario
    const userName = getUserLoggedName();
    const navbarUserElements = document.querySelectorAll('.navbar-user');
    navbarUserElements.forEach(el => {
        if (el) el.textContent = userName || 'Admin';
    });
    
    cargarPedidos();
    configurarFiltro();
    configurarModal();
    configurarModalAlert();
});

// Verificar autenticación
const initPage = () => {
    console.log("Inicio de página de pedidos admin");
    checkAuthUser('ADMIN');
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

// Variable global para almacenar los pedidos
let todosLosPedidos: IPedido[] = [];
let pedidoActual: IPedido | null = null;

/**
 * Carga y muestra todos los pedidos
 */
async function cargarPedidos(): Promise<void> {
    const container = document.querySelector('.orders-container') as HTMLElement;
    if (!container) return;

    // Mostrar mensaje de carga
    container.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 2rem;">Cargando pedidos...</p>';

    try {
        const response = await fetch(`${API_URL}/pedidos`);
        
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        todosLosPedidos = await response.json();
        
        if (todosLosPedidos.length === 0) {
            mostrarMensajeVacio(container);
            return;
        }

        // Actualizar estadísticas
        actualizarEstadisticas(todosLosPedidos);

        // Renderizar pedidos
        renderizarPedidos(todosLosPedidos);

    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        mostrarError(container, 'Error al cargar los pedidos. Por favor intenta nuevamente.');
    }
}

/**
 * Actualiza las estadísticas de pedidos
 */
function actualizarEstadisticas(pedidos: IPedido[]): void {
    const pendientes = pedidos.filter(p => p.estado === 'PENDIENTE').length;
    const confirmados = pedidos.filter(p => p.estado === 'CONFIRMADO').length;
    const terminados = pedidos.filter(p => p.estado === 'TERMINADO').length;
    const cancelados = pedidos.filter(p => p.estado === 'CANCELADO').length;

    const statPendientes = document.getElementById('stat-pendientes');
    const statConfirmados = document.getElementById('stat-confirmados');
    const statTerminados = document.getElementById('stat-terminados');
    const statCancelados = document.getElementById('stat-cancelados');

    if (statPendientes) statPendientes.textContent = pendientes.toString();
    if (statConfirmados) statConfirmados.textContent = confirmados.toString();
    if (statTerminados) statTerminados.textContent = terminados.toString();
    if (statCancelados) statCancelados.textContent = cancelados.toString();
}

/**
 * Renderiza la lista de pedidos
 */
async function renderizarPedidos(pedidos: IPedido[]): Promise<void> {
    const container = document.querySelector('.orders-container') as HTMLElement;
    if (!container) return;

    container.innerHTML = '';

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
                <div class="order-customer">
                    <i class="bi bi-person"></i> Cliente ID: ${pedido.usuarioId}
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
            <h3>No hay pedidos</h3>
            <p>Los pedidos de los clientes aparecerán aquí</p>
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
            actualizarEstadisticas(todosLosPedidos);
        } else {
            const pedidosFiltrados = todosLosPedidos.filter(
                pedido => pedido.estado === estadoSeleccionado
            );
            renderizarPedidos(pedidosFiltrados);
            actualizarEstadisticas(todosLosPedidos);
        }
    });
}

/**
 * Abre el modal con los detalles del pedido
 */
async function abrirModalDetalle(pedido: IPedido): Promise<void> {
    const modal = document.getElementById('modal-detalle-pedido');
    if (!modal) return;

    // Guardar pedido actual
    pedidoActual = pedido;

    // Llenar información básica
    const pedidoId = document.getElementById('modal-pedido-id');
    const pedidoEstado = document.getElementById('modal-pedido-estado');
    const pedidoFecha = document.getElementById('modal-pedido-fecha');
    
    if (pedidoId) pedidoId.textContent = `ORD-${pedido.id}`;
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

    // Llenar información del cliente
    const usuarioId = document.getElementById('modal-usuario-id');
    if (usuarioId) {
        // Obtener nombre del usuario
        let nombreUsuario = 'Usuario';
        try {
            const response = await fetch(`${API_URL}/usuario/${pedido.usuarioId}`);
            
            if (response.ok) {
                const usuario = await response.json();
                nombreUsuario = usuario.name || usuario.nombre || 'Usuario';
            }
        } catch (error) {
            console.error(`Error al cargar usuario ${pedido.usuarioId}:`, error);
        }
        usuarioId.innerHTML = `${nombreUsuario} <span style="color: #7f8c8d; font-weight: 400;">#${pedido.usuarioId}</span>`;
    }

    // Llenar información de entrega
    const direccion = document.getElementById('modal-direccion');
    const telefono = document.getElementById('modal-telefono');
    const metodoPago = document.getElementById('modal-metodo-pago');
    const notasContainer = document.getElementById('modal-notas-container');
    const notas = document.getElementById('modal-notas');

    if (direccion) direccion.textContent = pedido.informacionDeEntrega?.direccion || 'No especificada';
    if (telefono) telefono.textContent = pedido.informacionDeEntrega?.telefono || 'No especificado';
    if (metodoPago) {
        const metodo = pedido.informacionDeEntrega?.metodoPago === 'EFECTIVO' ? '💵 Efectivo' : '🏦 Transferencia Bancaria';
        metodoPago.textContent = metodo;
    }

    // Mostrar notas si existen
    if (notasContainer && notas && pedido.informacionDeEntrega?.notasAdicionales) {
        notasContainer.style.display = 'block';
        notas.textContent = pedido.informacionDeEntrega.notasAdicionales;
    } else if (notasContainer) {
        notasContainer.style.display = 'none';
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

    // Calcular totales
    const subtotal = pedido.total || 0;
    const modalSubtotal = document.getElementById('modal-subtotal');
    const modalTotal = document.getElementById('modal-total');

    if (modalSubtotal) modalSubtotal.textContent = formatPrice(subtotal);
    if (modalTotal) modalTotal.textContent = formatPrice(subtotal);

    // Actualizar estado de botones según las transiciones permitidas
    actualizarBotonesEstado(pedido.estado);

    // Mostrar modal
    modal.classList.add('active');
}

/**
 * Actualiza el estado de los botones según el estado actual del pedido
 */
function actualizarBotonesEstado(estadoActual: string): void {
    const btnConfirmado = document.querySelector('[data-estado="CONFIRMADO"]') as HTMLButtonElement;
    const btnTerminado = document.querySelector('[data-estado="TERMINADO"]') as HTMLButtonElement;
    const btnCancelado = document.querySelector('[data-estado="CANCELADO"]') as HTMLButtonElement;

    if (!btnConfirmado || !btnTerminado || !btnCancelado) return;

    // Por defecto, deshabilitar todos
    btnConfirmado.disabled = false;
    btnTerminado.disabled = false;
    btnCancelado.disabled = false;

    // Remover clase disabled de todos
    btnConfirmado.classList.remove('btn-action-disabled');
    btnTerminado.classList.remove('btn-action-disabled');
    btnCancelado.classList.remove('btn-action-disabled');

    switch (estadoActual) {
        case 'PENDIENTE':
            // Solo se puede confirmar o cancelar
            btnTerminado.disabled = true;
            btnTerminado.classList.add('btn-action-disabled');
            break;
        
        case 'CONFIRMADO':
            // Solo se puede terminar
            btnConfirmado.disabled = true;
            btnCancelado.disabled = true;
            btnConfirmado.classList.add('btn-action-disabled');
            btnCancelado.classList.add('btn-action-disabled');
            break;
        
        case 'TERMINADO':
        case 'CANCELADO':
            // No se puede cambiar
            btnConfirmado.disabled = true;
            btnTerminado.disabled = true;
            btnCancelado.disabled = true;
            btnConfirmado.classList.add('btn-action-disabled');
            btnTerminado.classList.add('btn-action-disabled');
            btnCancelado.classList.add('btn-action-disabled');
            break;
    }
}

/**
 * Cierra el modal de detalle
 */
function cerrarModalDetalle(): void {
    const modal = document.getElementById('modal-detalle-pedido');
    if (modal) {
        modal.classList.remove('active');
    }
    pedidoActual = null;
}

/**
 * Valida si se puede cambiar el estado del pedido
 */
function puedeChangiarEstado(estadoActual: string, nuevoEstado: string): boolean {
    // TERMINADO y CANCELADO no se pueden cambiar
    if (estadoActual === 'TERMINADO' || estadoActual === 'CANCELADO') {
        return false;
    }

    // PENDIENTE → CONFIRMADO o CANCELADO
    if (estadoActual === 'PENDIENTE') {
        return nuevoEstado === 'CONFIRMADO' || nuevoEstado === 'CANCELADO';
    }

    // CONFIRMADO → TERMINADO
    if (estadoActual === 'CONFIRMADO') {
        return nuevoEstado === 'TERMINADO';
    }

    return false;
}

/**
 * Cambia el estado de un pedido
 */
async function cambiarEstadoPedido(nuevoEstado: 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO' | 'TERMINADO'): Promise<void> {
    if (!pedidoActual) return;

    // Validar transición de estado
    if (!puedeChangiarEstado(pedidoActual.estado, nuevoEstado)) {
        let mensaje = '';
        if (pedidoActual.estado === 'TERMINADO') {
            mensaje = 'No se puede cambiar el estado de un pedido terminado.';
        } else if (pedidoActual.estado === 'CANCELADO') {
            mensaje = 'No se puede cambiar el estado de un pedido cancelado.';
        } else if (pedidoActual.estado === 'PENDIENTE' && nuevoEstado === 'TERMINADO') {
            mensaje = 'Primero debes confirmar el pedido antes de terminarlo.';
        } else if (pedidoActual.estado === 'CONFIRMADO' && (nuevoEstado === 'CONFIRMADO' || nuevoEstado === 'CANCELADO')) {
            mensaje = 'Solo puedes terminar un pedido confirmado.';
        } else {
            mensaje = 'Transición de estado no permitida.';
        }
        mostrarAlerta(mensaje, 'warning', 'Acción no permitida');
        return;
    }

    // Confirmar acción con modal personalizado
    const modalConfirm = document.createElement('div');
    modalConfirm.id = 'modal-confirm-estado';
    modalConfirm.className = 'modal-alert';
    modalConfirm.innerHTML = `
        <div class="modal-alert__overlay"></div>
        <div class="modal-alert__content">
            <i class="bi bi-exclamation-triangle-fill modal-alert__icon warning"></i>
            <h3 class="modal-alert__title">Confirmar cambio de estado</h3>
            <p class="modal-alert__message">¿Estás seguro de cambiar el estado del pedido a ${formatEstado(nuevoEstado)}?</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="confirm-estado-btn" class="modal-alert__btn" style="background-color: #3498db;">Confirmar</button>
                <button id="cancel-estado-btn" class="modal-alert__btn" style="background-color: #6c757d;">Cancelar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modalConfirm);
    modalConfirm.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    const confirmBtn = modalConfirm.querySelector('#confirm-estado-btn');
    const cancelBtn = modalConfirm.querySelector('#cancel-estado-btn');
    const overlay = modalConfirm.querySelector('.modal-alert__overlay');
    
    const closeModal = () => {
        modalConfirm.remove();
        document.body.style.overflow = '';
    };
    
    confirmBtn?.addEventListener('click', async () => {
        closeModal();
        
        try {
            const response = await fetch(`${API_URL}/pedidos/${pedidoActual!.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Error al actualizar el pedido');
            }

            // Actualizar el pedido en la lista
            const pedidoIndex = todosLosPedidos.findIndex(p => p.id === pedidoActual!.id);
            if (pedidoIndex !== -1) {
                todosLosPedidos[pedidoIndex].estado = nuevoEstado;
            }

            // Cerrar modal y recargar
            cerrarModalDetalle();
            await cargarPedidos();

            // Mostrar mensaje de éxito
            mostrarAlerta(`Pedido actualizado a ${formatEstado(nuevoEstado)}`, 'success', '¡Pedido actualizado!');

        } catch (error) {
            console.error('Error al cambiar estado:', error);
            mostrarAlerta('Error al actualizar el estado del pedido. Por favor intenta nuevamente.', 'error');
        }
    });
    
    cancelBtn?.addEventListener('click', closeModal);
    overlay?.addEventListener('click', closeModal);
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

    // Configurar botones de acción
    const btnConfirmado = modal?.querySelector('[data-estado="CONFIRMADO"]');
    const btnTerminado = modal?.querySelector('[data-estado="TERMINADO"]');
    const btnCancelado = modal?.querySelector('[data-estado="CANCELADO"]');

    if (btnConfirmado) {
        btnConfirmado.addEventListener('click', () => cambiarEstadoPedido('CONFIRMADO'));
    }
    if (btnTerminado) {
        btnTerminado.addEventListener('click', () => cambiarEstadoPedido('TERMINADO'));
    }
    if (btnCancelado) {
        btnCancelado.addEventListener('click', () => cambiarEstadoPedido('CANCELADO'));
    }
}
