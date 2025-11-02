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
const inputImagenProducto = document.getElementById("product-image") as HTMLInputElement;
const inputStockProducto = document.getElementById("product-stock") as HTMLInputElement;
const inputCategoriaProducto = document.getElementById("product-category") as HTMLInputElement;
const hiddenCategoriaProductoId = document.getElementById("product-category-id") as HTMLInputElement;
const suggestionsList = document.getElementById("categorySuggestions") as HTMLDivElement;
const form = document.getElementById("product-form") as HTMLFormElement;

const productList = document.getElementById("product-list-items") as HTMLUListElement;

const API_URL = envs.API_URL;

// Variables globales para autocompletado
let allCategories: ICategory[] = [];
let selectedCategoryId: string | null = null;
let currentSuggestionIndex = -1;

// Funciones del autocompletado de categorías
function initAutocomplete() {
    if (!inputCategoriaProducto || !suggestionsList) return;

    // Evento input para filtrar sugerencias
    inputCategoriaProducto.addEventListener('input', (e) => {
        const query = (e.target as HTMLInputElement).value.toLowerCase();
        showSuggestions(query);
    });

    // Evento focus para mostrar todas las opciones
    inputCategoriaProducto.addEventListener('focus', () => {
        showSuggestions(inputCategoriaProducto.value.toLowerCase());
    });

    // Evento blur para ocultar sugerencias (con delay para permitir clics)
    inputCategoriaProducto.addEventListener('blur', () => {
        setTimeout(() => {
            hideSuggestions();
        }, 200);
    });

    // Navegación con teclado
    inputCategoriaProducto.addEventListener('keydown', (e) => {
        const suggestions = suggestionsList.querySelectorAll('.suggestion-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentSuggestionIndex = Math.min(currentSuggestionIndex + 1, suggestions.length - 1);
            updateHighlight();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentSuggestionIndex = Math.max(currentSuggestionIndex - 1, -1);
            updateHighlight();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentSuggestionIndex >= 0 && suggestions[currentSuggestionIndex]) {
                selectSuggestion(suggestions[currentSuggestionIndex] as HTMLDivElement);
            }
        } else if (e.key === 'Escape') {
            hideSuggestions();
            inputCategoriaProducto.blur();
        }
    });
}

function showSuggestions(query: string) {
    if (!suggestionsList) return;

    const filteredCategories = allCategories
        .filter(cat => cat.nombre.toLowerCase().includes(query))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));

    suggestionsList.innerHTML = '';
    currentSuggestionIndex = -1;

    if (filteredCategories.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-suggestions';
        noResults.textContent = 'No se encontraron categorías';
        suggestionsList.appendChild(noResults);
    } else {
        filteredCategories.forEach(category => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = category.nombre;
            item.dataset.categoryId = category.id.toString();

            item.addEventListener('click', () => {
                selectSuggestion(item);
            });

            suggestionsList.appendChild(item);
        });
    }

    suggestionsList.classList.add('show');
}

function hideSuggestions() {
    if (suggestionsList) {
        suggestionsList.classList.remove('show');
    }
}

function updateHighlight() {
    const suggestions = suggestionsList.querySelectorAll('.suggestion-item');
    suggestions.forEach((item, index) => {
        item.classList.toggle('highlighted', index === currentSuggestionIndex);
    });
}

function selectSuggestion(item: HTMLDivElement) {
    const categoryName = item.textContent || '';
    const categoryId = item.dataset.categoryId;

    inputCategoriaProducto.value = categoryName;
    if (categoryId && hiddenCategoriaProductoId) {
        hiddenCategoriaProductoId.value = categoryId;
        selectedCategoryId = categoryId;
    }

    hideSuggestions();
    
    // Marcar como seleccionada visualmente
    const suggestions = suggestionsList.querySelectorAll('.suggestion-item');
    suggestions.forEach(s => s.classList.remove('selected'));
    item.classList.add('selected');
}

function setSelectedCategory(categoryId: string | null) {
    if (!categoryId || !inputCategoriaProducto || !hiddenCategoriaProductoId) return;
    
    const category = allCategories.find(cat => cat.id === categoryId);
    if (category) {
        inputCategoriaProducto.value = category.nombre;
        hiddenCategoriaProductoId.value = categoryId;
        selectedCategoryId = categoryId;
    }
}

// Modal functionality
const modal = document.getElementById("modal-nuevo-producto") as HTMLDivElement;
const btnNuevoProducto = document.getElementById("nuevo-producto-btn") as HTMLButtonElement;
const btnCloseModal = document.getElementById("close-modal") as HTMLButtonElement;

// Delete modal functionality
const deleteModal = document.getElementById("modal-delete-product") as HTMLDivElement;
const btnCloseDeleteModal = document.getElementById("close-delete-modal") as HTMLButtonElement;
const btnCancelDelete = document.getElementById("cancel-delete-btn") as HTMLButtonElement;
const btnConfirmDelete = document.getElementById("confirm-delete-btn") as HTMLButtonElement;
const productToDeleteName = document.getElementById("product-to-delete-name") as HTMLElement;
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

// Variables para manejar el producto a eliminar
let productToDelete: any = null;

// Función para mostrar modal de confirmación de eliminación
function showDeleteModal(product: any) {
    productToDelete = product;
    productToDeleteName.textContent = product.nombre;
    deleteModal.style.display = "flex";
}

// Función para ocultar modal de eliminación
function hideDeleteModal() {
    deleteModal.style.display = "none";
    productToDelete = null;
}

// Función para eliminar producto confirmado
async function deleteProduct() {
    if (!productToDelete) return;
    
    try {
        const resp = await fetch(`${API_URL}/productos/${productToDelete.id}`, { method: 'DELETE' });
        if (!resp.ok) throw new Error('Error al eliminar');
        
        // Recargar la lista de productos
        await displayProducts();
        hideDeleteModal();
    } catch (e) {
        alert('No se pudo eliminar el producto');
    }
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
    
    // Limpiar campos de categoría
    if (inputCategoriaProducto) inputCategoriaProducto.value = '';
    if (hiddenCategoriaProductoId) hiddenCategoriaProductoId.value = '';
    selectedCategoryId = null;
    
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

// Event listeners para modal de eliminación
btnCloseDeleteModal?.addEventListener("click", hideDeleteModal);
btnCancelDelete?.addEventListener("click", hideDeleteModal);
btnConfirmDelete?.addEventListener("click", deleteProduct);

// Cerrar modal de eliminación al hacer clic fuera
deleteModal?.addEventListener("click", (e) => {
    if (e.target === deleteModal) {
        hideDeleteModal();
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
    const imagen = inputImagenProducto.value.trim();
    const stockStr = inputStockProducto.value.trim();
    const categoriaIdStr = hiddenCategoriaProductoId.value;

    if (!nombre || !marca || !precioStr || !stockStr || !categoriaIdStr) {
        showError("Por favor, completa todos los campos obligatorios.");
        return;
    }

    const precio = parseFloat(precioStr);
    const stock = parseInt(stockStr);
    const categoriaId = parseInt(categoriaIdStr);

    if (isNaN(precio) || precio <= 0) {
        showError("El precio debe ser un número positivo.");
        return;
    }

    if (isNaN(stock) || stock < 0) {
        showError("El stock debe ser un número no negativo.");
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
        categoriaId,
        imagen: imagen || null,
        stock
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
    // Ordenar categorías alfabéticamente desde el inicio
    allCategories = categories.sort((a, b) => a.nombre.localeCompare(b.nombre));
    // Inicializar el autocompletado solo una vez
    if (!inputCategoriaProducto.dataset.initialized) {
        initAutocomplete();
        inputCategoriaProducto.dataset.initialized = 'true';
    }
}



// ----------------------Función para mostrar los productos en la lista-----------------------

async function displayProducts() {
    const products = await getProducts();
    productList.innerHTML = "";
    products.forEach((product: any) => {
        const card = document.createElement("div");
        card.className = "admin-producto-card";
        
        // Solo mostrar la cantidad de stock
        const stockClase = product.stock > 0 ? 'si' : 'no';
        
        // Usar imagen del producto o fallback
        const imagenUrl = product.imagen || 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png';
        
        card.innerHTML = `
            <div class="admin-producto-card-id">ID: #${product.id ?? ''}</div>
            <div class="contenedor-imagen">
                <img class="admin-producto-card-img" src="${imagenUrl}" alt="Imagen producto" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3075/3075977.png'">
            </div>
            <div class="admin-producto-card-nombre">${product.nombre}</div>
            <div class="admin-producto-card-desc">${product.marca}</div>
            <div class="admin-producto-card-precio">$${product.precio?.toFixed(2) ?? ''}</div>
            <div class="admin-producto-card-info-row">
                <div class="admin-producto-card-categoria">${product.categoriaNombre ?? ''}</div>
                <div class="admin-producto-card-stock">
                    <span class="badge-stock ${stockClase}">${product.stock}</span>
                </div>
            </div>
            <div class="admin-producto-card-actions">
                <button class="admin-btn admin-btn-edit">Editar</button>
                <button class="admin-btn admin-btn-delete">Eliminar</button>
            </div>
        `;

        // Eliminar producto
        card.querySelector('.admin-btn-delete')?.addEventListener('click', () => {
            showDeleteModal(product);
        });

        // Editar producto (abrir modal con datos)
        card.querySelector('.admin-btn-edit')?.addEventListener('click', async () => {
            // Asegurar que las categorías estén cargadas
            try {
                const categories = await getCategories();
                createCategoryOption(categories);
                
                // Establecer la categoría seleccionada inmediatamente después de cargar las categorías
                setSelectedCategory(product.categoriaId?.toString() || null);
            } catch (error) {
                console.error("Error loading categories:", error);
            }

            // Prellenar el formulario con los datos del producto
            inputNombreProducto.value = product.nombre;
            inputMarcaProducto.value = product.marca;
            inputPrecioProducto.value = product.precio.toString();
            inputImagenProducto.value = product.imagen || '';
            inputStockProducto.value = product.stock.toString();
            
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