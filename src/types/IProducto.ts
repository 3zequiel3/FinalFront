export interface IProducto{
    id?: number;
    nombre: string;
    precio: number;
    marca: string;
    categoriaNombre: string;
}

export interface IProductoCreate{
    nombre: string;
    precio: number;
    marca: string;
    categoriaId: number;
}