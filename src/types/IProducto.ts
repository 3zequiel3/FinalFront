export interface IProducto{
    id?: number;
    nombre: string;
    precio: number;
    marca: string;
    categoriaNombre: string;
    imagen?: string | null;
    stock: number;
    categoriaId?: number;
}

export interface IProductoCreate{
    nombre: string;
    precio: number;
    marca: string;
    categoriaId: number;
    imagen?: string | null;
    stock: number;
}