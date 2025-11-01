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

// Modal functionality
const modal = document.getElementById("modal-nuevo-producto") as HTMLDivElement;
const btnNuevoProducto = document.getElementById("nuevo-producto-btn") as HTMLButtonElement;
const btnCloseModal = document.getElementById("close-modal") as HTMLButtonElement;
const modalError = document.getElementById("modal-error") as HTMLDivElement;
const modalSuccess = document.getElementById("modal-success") as HTMLDivElement;

// Función para mostrar mensaje de error
function showError(message: string) {
    modalError.textContent = message;
    modalError.style.display = "block";
    modalSuccess.style.display = "none";
}

// Función para mostrar mensaje de éxito
function showSuccess(message: string) {
    modalSuccess.textContent = message;
    modalSuccess.style.display = "block";
    modalError.style.display = "none";
}

// Función para ocultar mensajes
function hideMessages() {
    modalError.style.display = "none";
    modalSuccess.style.display = "none";
}

// Abrir modal
btnNuevoProducto?.addEventListener("click", () => {
    modal.style.display = "flex";
    hideMessages();
    form.reset();
});

// Cerrar modal
btnCloseModal?.addEventListener("click", () => {
    modal.style.display = "none";
    hideMessages();
    form.reset();
});

// Cerrar modal al hacer clic fuera del contenido
modal?.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
        hideMessages();
        form.reset();
    }
});

// Manejar el envío del formulario
form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideMessages();

    // Validar campos
    const nombre = inputNombreProducto.value.trim();
    const marca = inputMarcaProducto.value.trim();
    const precioStr = inputPrecioProducto.value.trim();
    const categoriaIdStr = selectCategoriaProducto.value;

    if (!nombre || !marca || !precioStr || !categoriaIdStr) {
        showError("Por favor, completa todos los campos obligatorios.");
        return;
    }

    const precio = parseFloat(precioStr);
    const categoriaId = parseInt(categoriaIdStr);

    if (isNaN(precio) || precio <= 0) {
        showError("El precio debe ser un número positivo.");
        return;
    }

    if (isNaN(categoriaId)) {
        showError("Por favor, selecciona una categoría válida.");
        return;
    }

    // Crear objeto de producto
    const nuevoProducto: IProductoCreate = {
        nombre,
        marca,
        precio,
        categoriaId
    };

    try {
        const response = await fetch(`${API_URL}/productos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(nuevoProducto)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Error al crear el producto" }));
            showError(errorData.message || `Error ${response.status}: No se pudo crear el producto`);
            return;
        }

        showSuccess("¡Producto creado exitosamente!");
        
        // Limpiar formulario
        form.reset();
        
        // Recargar la lista de productos
        await displayProducts();
        
        // Cerrar modal después de 2 segundos
        setTimeout(() => {
            modal.style.display = "none";
            hideMessages();
        }, 2000);

    } catch (error) {
        console.error("Error al crear el producto:", error);
        showError("Error de conexión. Por favor, intenta nuevamente.");
    }
});

 
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

    categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id.toString();
        option.textContent = category.nombre;
        selectCategoriaProducto.appendChild(option);
    });
}

async function displayProducts() {
    const products = await getProducts();
    productList.innerHTML = "";
    products.forEach((product: any) => {
        const card = document.createElement("div");
        card.className = "admin-producto-card";
        card.innerHTML = `
            <div class="admin-producto-card-id">ID: #${product.id ?? ''}</div>
            <div class="contenedor-imagen">
                <img class="admin-producto-card-img" src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" alt="Imagen producto">
            </div>
            <div class="admin-producto-card-nombre">${product.nombre}</div>
            <div class="admin-producto-card-desc">${product.marca}</div>
            <div class="admin-producto-card-precio">$${product.precio?.toFixed(2) ?? ''}</div>
            <div class="admin-producto-card-info-row">
                <div class="admin-producto-card-categoria">${product.categoriaNombre ?? ''}</div>
                <div class="admin-producto-card-stock">
                    <span class="badge-stock si">Disponible</span>
                </div>
            </div>
            <div class="admin-producto-card-actions">
                <button class="admin-btn admin-btn-edit">Editar</button>
                <button class="admin-btn admin-btn-delete">Eliminar</button>
            </div>
        `;

        // Eliminar producto
        card.querySelector('.admin-btn-delete')?.addEventListener('click', async () => {
            if (confirm(`¿Seguro que deseas eliminar el producto "${product.nombre}"?`)) {
                try {
                    const resp = await fetch(`${API_URL}/productos/${product.id}`, { method: 'DELETE' });
                    if (!resp.ok) throw new Error('Error al eliminar');
                    card.remove();
                } catch (e) {
                    alert('No se pudo eliminar el producto');
                }
            }
        });

        // Editar producto (modal simple)
        card.querySelector('.admin-btn-edit')?.addEventListener('click', async () => {
            const nuevoNombre = prompt('Nuevo nombre:', product.nombre);
            if (nuevoNombre === null) return;
            const nuevoPrecioStr = prompt('Nuevo precio:', product.precio);
            if (nuevoPrecioStr === null) return;
            const nuevoPrecio = parseFloat(nuevoPrecioStr);
            if (isNaN(nuevoPrecio)) return alert('Precio inválido');
            try {
                const resp = await fetch(`${API_URL}/productos/${product.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre: nuevoNombre, precio: nuevoPrecio })
                });
                if (!resp.ok) throw new Error('Error al editar');
                // Refrescar las cards
                await displayProducts();
            } catch (e) {
                alert('No se pudo editar el producto');
            }
        });

        productList.appendChild(card);
    });
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

displayProducts();
document.addEventListener("DOMContentLoaded", () => {
    init();
});