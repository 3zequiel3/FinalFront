import type { ICategory } from "../../types/ICategory";
import type { IProductoCreate } from "../../types/IProducto";
import { envs } from "../../utils/enviromentVariable";

// ----------------------------- Funcionalidad para marcar item activo en sidebar -------------------------------
// Función para marcar item activo
function setActiveSidebarItem(itemLi: HTMLElement) {
  // Remover active de todos los li del sidebar
  const allSidebarLis = document.querySelectorAll('.sidebar-categorias li');
  allSidebarLis.forEach(li => li.classList.remove('active'));
  
  // Agregar active al li clickeado
  itemLi.classList.add('active');
  
  // También en el dropdown mobile
  const allDropdownLis = document.querySelectorAll('.dropdown-menu li');
  allDropdownLis.forEach(li => li.classList.remove('active'));
}

// Marcar Productos como activo por defecto al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  // Buscar el item "Productos" en el sidebar (tercer li)
  const productosLi = document.querySelector('.sidebar-categorias ul li:nth-child(3)') as HTMLLIElement;
  if (productosLi) {
    productosLi.classList.add('active');
  }
  
  // También marcar en el dropdown mobile (tercer li)
  const productosDropdownLi = document.querySelector('.dropdown-menu li:nth-child(3)') as HTMLLIElement;
  if (productosDropdownLi) {
    productosDropdownLi.classList.add('active');
  }
  
  // Agregar listeners a todos los items del sidebar
  const sidebarLinks = document.querySelectorAll('.sidebar-categorias li a');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const li = (e.currentTarget as HTMLElement).closest('li') as HTMLLIElement;
      if (li) {
        setActiveSidebarItem(li);
        
        // Sincronizar con dropdown mobile
        const linkText = li.textContent?.trim().toLowerCase();
        const dropdownItems = document.querySelectorAll('.dropdown-menu li');
        dropdownItems.forEach(dropItem => {
          const dropText = dropItem.textContent?.trim().toLowerCase();
          if (dropText === linkText) {
            const allDropdownLis = document.querySelectorAll('.dropdown-menu li');
            allDropdownLis.forEach(item => item.classList.remove('active'));
            dropItem.classList.add('active');
          }
        });
      }
    });
  });
  
  // Agregar listeners al dropdown mobile
  const dropdownLinks = document.querySelectorAll('.dropdown-menu li a');
  dropdownLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const li = (e.currentTarget as HTMLElement).closest('li') as HTMLLIElement;
      if (li) {
        // Marcar en dropdown
        const allDropdownLis = document.querySelectorAll('.dropdown-menu li');
        allDropdownLis.forEach(item => item.classList.remove('active'));
        li.classList.add('active');
        
        // Sincronizar con sidebar
        const linkText = li.textContent?.trim().toLowerCase();
        const sidebarItems = document.querySelectorAll('.sidebar-categorias li');
        sidebarItems.forEach(sideItem => {
          const sideText = sideItem.textContent?.trim().toLowerCase();
          if (sideText === linkText) {
            setActiveSidebarItem(sideItem as HTMLLIElement);
          }
        });
      }
    });
  });
});

// ----------------------------- Fin funcionalidad item activo -------------------------------

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
    // Restablecer el modal para crear nuevo producto
    const modalTitle = document.querySelector('.modal-title') as HTMLHeadingElement;
    if (modalTitle) modalTitle.textContent = 'Nuevo Producto';
    
    const submitButton = document.getElementById('addProductButton') as HTMLButtonElement;
    if (submitButton) {
        submitButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
            </svg>
            Crear Producto
        `;
    }
    
    // Limpiar el ID de edición
    delete form.dataset.editingId;
    
    modal.style.display = "flex";
    hideMessages();
    form.reset();
});

// Cerrar modal
btnCloseModal?.addEventListener("click", () => {
    modal.style.display = "none";
    hideMessages();
    form.reset();
    delete form.dataset.editingId;
});

// Cerrar modal al hacer clic fuera del contenido
modal?.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
        hideMessages();
        form.reset();
        delete form.dataset.editingId;
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
    const productoData: IProductoCreate = {
        nombre,
        marca,
        precio,
        categoriaId
    };

    // Verificar si estamos editando o creando
    const editingId = form.dataset.editingId;
    const isEditing = editingId && editingId !== '';

    try {
        const url = isEditing ? `${API_URL}/productos/${editingId}` : `${API_URL}/productos`;
        const method = isEditing ? "PUT" : "POST";

        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(productoData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: isEditing ? "Error al actualizar el producto" : "Error al crear el producto" }));
            showError(errorData.message || `Error ${response.status}: No se pudo ${isEditing ? 'actualizar' : 'crear'} el producto`);
            return;
        }

        showSuccess(isEditing ? "¡Producto actualizado exitosamente!" : "¡Producto creado exitosamente!");
        
        // Limpiar formulario
        form.reset();
        delete form.dataset.editingId;
        
        // Recargar la lista de productos
        await displayProducts();
        
        // Cerrar modal después de 2 segundos
        setTimeout(() => {
            modal.style.display = "none";
            hideMessages();
        }, 2000);

    } catch (error) {
        console.error(isEditing ? "Error al actualizar el producto:" : "Error al crear el producto:", error);
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
    products.forEach((product: any, index: number) => {
        const card = document.createElement("div");
        card.className = "admin-producto-card";
        // Hardcodear: primeros 2 productos tendrán "No", el resto "Sí"
        const tieneStock = index >= 2;
        const stockTexto = tieneStock ? 'Sí' : 'No';
        const stockClase = tieneStock ? 'si' : 'no';
        
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
                    <span class="badge-stock ${stockClase}">${stockTexto}</span>
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

        // Editar producto (abrir modal con datos)
        card.querySelector('.admin-btn-edit')?.addEventListener('click', () => {
            // Prellenar el formulario con los datos del producto
            inputNombreProducto.value = product.nombre;
            inputMarcaProducto.value = product.marca;
            inputPrecioProducto.value = product.precio.toString();
            selectCategoriaProducto.value = product.categoriaId?.toString() || '';
            
            // Cambiar el título del modal
            const modalTitle = document.querySelector('.modal-title') as HTMLHeadingElement;
            if (modalTitle) modalTitle.textContent = 'Editar Producto';
            
            // Cambiar el texto del botón
            const submitButton = document.getElementById('addProductButton') as HTMLButtonElement;
            if (submitButton) {
                submitButton.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Actualizar Producto
                `;
            }
            
            // Guardar el ID del producto en el formulario para saber que estamos editando
            form.dataset.editingId = product.id.toString();
            
            // Abrir el modal
            modal.style.display = "flex";
            hideMessages();
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