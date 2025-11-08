// Tipo para el método de pago
export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA_BANCARIA';

// Interfaz para el detalle de un item en el pedido
export interface IPedidoDetalle {
    id?: number;
    cantidad: number;
    productoId: number;
    subtotal?: number;
}

// Interfaz para la información de entrega
export interface IInformacionEntrega {
    direccion: string;
    telefono: string;
    metodoPago: MetodoPago;
    notasAdicionales: string;
}

// Interfaz para crear un pedido (formato del backend)
export interface ICreatePedido {
    fecha: string; // Formato: YYYY-MM-DD
    usuarioId: number;
    detalles: IPedidoDetalle[];
    informacionDeEntrega: IInformacionEntrega;
}

// Interfaz completa del pedido (respuesta del servidor)
export interface IPedido {
    id: number;
    fecha: string;
    usuarioId: number;
    estado: 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO' | 'TERMINADO';
    detalles: IPedidoDetalle[];
    informacionDeEntrega: IInformacionEntrega;
    total?: number;
    fechaCreacion?: string;
    fechaActualizacion?: string;
}
