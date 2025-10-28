import type { ICategory } from "../../types/ICategory";
import type { IProductoCreate } from "../../types/IProducto";
import { envs } from "../../utils/enviromentVariable";


const inputNombreProducto = document.getElementById("product-name") as HTMLInputElement;
const inputMarcaProducto = document.getElementById("product-marca") as HTMLInputElement;
const inputPrecioProducto = document.getElementById("product-price") as HTMLInputElement;
const selectCategoriaProducto = document.getElementById("product-category") as HTMLSelectElement;
const form = document.getElementById("product-form") as HTMLFormElement;


const productList = document.getElementById("product-list-items") as HTMLUListElement;

const API_URL = envs.API_URL;


async function getCategories() {
    try {
        const response = await fetch(`${API_URL}/categorias`);
        if (!response.ok) {
            throw new Error(`Error fetching categories: ${response.statusText}`);
        }
        const categories = await response.json();
        return categories;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}


async function getProducts() {
    try {
        const response = await fetch(`${API_URL}/productos`);
        if (!response.ok) {
            throw new Error(`Error fetching products: ${response.statusText}`);
        }
        const products = await response.json();
        return products;
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}

function createCategoryOption(categories: ICategory[]) {
    if (!selectCategoriaProducto) return;
    selectCategoriaProducto.length = 1;
    categories.forEach(
        (category) => {
            const option = document.createElement("option");
            option.value = String(category.id);
            option.text = String(category.nombre);
            selectCategoriaProducto.add(option);
        }
    )
}


async function init() {
    try {
        const categories = await getCategories();
        createCategoryOption(categories);
        await displayProducts();
    } catch (error) {
        console.error("Error initializing product form:", error);
    }
}

const uploadProductData = async (productData: IProductoCreate) => {

    try{
        const response = await fetch(`${API_URL}/productos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(productData),
        });

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log("Respuesta del servidor:", responseData);
        alert("Producto creado con éxito");
    } catch (error) {
        console.error("Error al crear el producto:", error);
    }
}


form.addEventListener("submit", async (event: SubmitEvent) => {
    event.preventDefault();
    const newProduct: IProductoCreate = {
        nombre: inputNombreProducto.value,
        marca: inputMarcaProducto.value,
        precio: parseFloat(inputPrecioProducto.value),
        categoriaId: parseInt(selectCategoriaProducto.value),
    };

    try{
        await uploadProductData(newProduct);
        form.reset();
    } catch (error) {
        console.error("Error al subir los datos del producto:", error);
        alert("Error al crear el producto");
    }
}); 

const displayProducts = async () => {
    const products = await getProducts();
    productList.innerHTML = "";
    products.forEach((product: any) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${product.nombre} - ${product.marca} - $${product.precio} - Categoría: ${product.categoriaNombre}`;
        productList.appendChild(listItem);
    });
};

displayProducts();
document.addEventListener("DOMContentLoaded", () => {
    init();
});