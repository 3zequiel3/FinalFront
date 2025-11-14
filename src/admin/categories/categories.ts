import type { ICategory, ICategoryCreate } from "../../types/ICategory";
import { envs } from "../../utils/enviromentVariable";

// ==================== MODAL ALERT ====================
type AlertType = 'success' | 'error' | 'warning' | 'info';

function mostrarAlerta(mensaje: string, tipo: AlertType = 'info', titulo?: string): void {
    const modal = document.getElementById('modal-alert') as HTMLElement;
    const icon = document.getElementById('modal-alert-icon') as HTMLElement;
    const titleEl = document.getElementById('modal-alert-title') as HTMLElement;
    const messageEl = document.getElementById('modal-alert-message') as HTMLElement;

    if (!modal || !icon || !titleEl || !messageEl) return;

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

    messageEl.textContent = mensaje;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function cerrarAlerta(): void {
    const modal = document.getElementById('modal-alert') as HTMLElement;
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

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

// Marcar Categorías como activo por defecto al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  configurarModalAlert();
  
  // Buscar el item "Categorias" en el sidebar (segundo li)
  const categoriasLi = document.querySelector('.sidebar-categorias ul li:nth-child(2)') as HTMLLIElement;
  if (categoriasLi) {
    categoriasLi.classList.add('active');
  }
  
  // También marcar en el dropdown mobile (segundo li)
  const categoriasDropdownLi = document.querySelector('.dropdown-menu li:nth-child(2)') as HTMLLIElement;
  if (categoriasDropdownLi) {
    categoriasDropdownLi.classList.add('active');
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

const form = document.getElementById("category-form") as HTMLFormElement;

const inputCategoryName = document.getElementById("category-name") as HTMLInputElement;
const textareaCategoryDescription = document.getElementById("category-description") as HTMLTextAreaElement;

const categoryList = document.querySelector(".category-list") as HTMLDivElement;
const modal = document.getElementById("modal-create") as HTMLDivElement;

const API_URL = envs.API_URL;

let editingCategoryId: number | null = null;

const uploadCategoryData = async (categoryName: ICategoryCreate) => {
    try {
        const dataToSend = {
            nombre: categoryName.nombre,
            descripcion: categoryName.descripcion
        };

        console.log("Datos que se enviarán al servidor:", dataToSend);

        const response = await fetch(`${API_URL}/categorias`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToSend),
        });

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log("Respuesta del servidor:", responseData);
        mostrarAlerta("La categoría se ha creado correctamente", "success", "Categoría creada");
        form.reset();
        modal.style.display = "none";
        await displayCategories();
    } catch (error) {
        console.error("Error al subir los datos de la categoría:", error);
        mostrarAlerta("No se pudo crear la categoría. Por favor intenta nuevamente.", "error", "Error al crear");
    }
}

const updateCategoryData = async (categoryId: number, categoryData: ICategoryCreate) => {
    try {
        const dataToSend = {
            nombre: categoryData.nombre,
            descripcion: categoryData.descripcion
        };

        console.log("Datos que se actualizarán:", dataToSend);

        const response = await fetch(`${API_URL}/categorias/${categoryId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToSend),
        });

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log("Respuesta del servidor:", responseData);
        mostrarAlerta("La categoría se ha actualizado correctamente", "success", "Categoría actualizada");
        form.reset();
        modal.style.display = "none";
        editingCategoryId = null;
        await displayCategories();
    } catch (error) {
        console.error("Error al actualizar la categoría:", error);
        mostrarAlerta("No se pudo actualizar la categoría. Por favor intenta nuevamente.", "error", "Error al actualizar");
    }
}

form.addEventListener("submit", async (event: SubmitEvent) => {
    event.preventDefault();

    const categoryData: ICategoryCreate = {
        nombre: inputCategoryName.value,
        descripcion: textareaCategoryDescription.value
    };

    try {
        if (editingCategoryId !== null) {
            await updateCategoryData(editingCategoryId, categoryData);
        } else {
            await uploadCategoryData(categoryData);
        }
    } catch (error) {
        console.error("Error al procesar la categoría:", error);
        mostrarAlerta("Ocurrió un error al procesar la categoría. Por favor intenta nuevamente.", "error", "Error");
    }
});


const getCategories = async () => {
    try {
        const response = await fetch(`${API_URL}/categorias`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        const categories = await response.json();
        return categories;
    } catch (error) {
        console.error("Error al obtener las categorías:", error);
        throw error;
    }
}

const displayCategories = async () => {
    try {
        const categories = await getCategories();
        
        // Limpiar todo el contenido previo
        categoryList.innerHTML = "";
        
        // Crear header para desktop
        const header = document.createElement("div");
        header.className = "category-list-header";
        header.innerHTML = `
            <div class="category-list-header-item id">ID</div>
            <div class="category-list-header-item nombre">Nombre</div>
            <div class="category-list-header-item descripcion">Descripción</div>
            <div class="category-list-header-item acciones">Acciones</div>
        `;
        categoryList.appendChild(header);

        categories.forEach((category: any) => {
            console.log("Categoría individual:", category);
            
            // Verificar si la descripción viene en el objeto
            const descripcion = category.descripcion || category.description || "Sin descripción";
            
            // Crear fila para desktop con flexbox
            const row = document.createElement("div");
            row.className = "category-row";
            row.innerHTML = `
                <div class="category-row-id">${category.id}</div>
                <div class="category-row-nombre">${category.nombre}</div>
                <div class="category-row-descripcion">${descripcion}</div>
                <div class="category-row-actions">
                    <button class="btn btn-edit" data-id="${category.id}">Editar</button>
                    <button class="btn btn-delete" data-id="${category.id}">Eliminar</button>
                </div>
            `;
            categoryList.appendChild(row);

            // Crear card para mobile
            const card = document.createElement("div");
            card.className = "category-card";
            card.innerHTML = `
                <div class="category-card-header">
                    <span class="category-card-id">ID: ${category.id}</span>
                    <h3 class="category-card-name">${category.nombre}</h3>
                </div>
                <p class="category-card-description">${descripcion}</p>
                <div class="category-card-actions">
                    <button class="btn btn-edit" data-id="${category.id}">Editar</button>
                    <button class="btn btn-delete" data-id="${category.id}">Eliminar</button>
                </div>
            `;
            categoryList.appendChild(card);
        });
    } catch (error) {
        console.error("Error al mostrar las categorías:", error);
    }
}
displayCategories();


const aggregateButton = document.getElementById("add-category-btn") as HTMLButtonElement;
const closeBtn = document.getElementById("close-create") as HTMLSpanElement;

// Mostrar el modal al hacer click en "Agregar Categoría"
aggregateButton.addEventListener("click", () => {
    editingCategoryId = null;
    form.reset();
    modal.querySelector("h2")!.textContent = "Nueva Categoría";
    modal.style.display = "flex";
});

// Cerrar el modal al hacer click en la "X"
closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    editingCategoryId = null;
    form.reset();
});

// Opcional: cerrar el modal al hacer click fuera del contenido
window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
        editingCategoryId = null;
        form.reset();
    }
});

const deleteCategoryData = async (categoryId: number) => {
    try {
        const response = await fetch(`${API_URL}/categorias/${categoryId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        mostrarAlerta("La categoría se ha eliminado correctamente", "success", "Categoría eliminada");
        await displayCategories();
    } catch (error) {
        console.error("Error al eliminar la categoría:", error);
        mostrarAlerta("No se pudo eliminar la categoría. Por favor intenta nuevamente.", "error", "Error al eliminar");
    }
}

categoryList.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains("btn-edit")) {
        const categoryIdStr = target.dataset.id;
        if (categoryIdStr) {
            editingCategoryId = parseInt(categoryIdStr);
            modal.querySelector("h2")!.textContent = "Editar Categoría";
            const editCategory = async () => {
                try {
                    const response = await fetch(`${API_URL}/categorias/${editingCategoryId}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                    if (!response.ok) throw new Error(`Error en la solicitud: ${response.statusText}`);
                    const category = await response.json();
                    inputCategoryName.value = category.nombre;
                    textareaCategoryDescription.value = category.descripcion;
                    modal.style.display = "flex";
                } catch (error) {
                    console.error("Error al obtener la categoría para editar:", error);
                }
            };
            editCategory();
        }
    }
    if (target.classList.contains("btn-delete")) {
        const categoryIdStr = target.dataset.id;
        if (categoryIdStr) {
            const categoryId = parseInt(categoryIdStr);
            
            // Crear modal de confirmación personalizado
            const modalConfirm = document.createElement('div');
            modalConfirm.id = 'modal-confirm-delete';
            modalConfirm.className = 'modal-alert';
            modalConfirm.innerHTML = `
                <div class="modal-alert__overlay"></div>
                <div class="modal-alert__content">
                    <i class="bi bi-exclamation-triangle-fill modal-alert__icon warning"></i>
                    <h3 class="modal-alert__title">Confirmar eliminación</h3>
                    <p class="modal-alert__message">¿Estás seguro de que deseas eliminar esta categoría?</p>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button id="confirm-delete-btn" class="modal-alert__btn" style="background-color: #dc3545;">Eliminar</button>
                        <button id="cancel-delete-btn" class="modal-alert__btn" style="background-color: #6c757d;">Cancelar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modalConfirm);
            modalConfirm.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            const confirmBtn = modalConfirm.querySelector('#confirm-delete-btn');
            const cancelBtn = modalConfirm.querySelector('#cancel-delete-btn');
            const overlay = modalConfirm.querySelector('.modal-alert__overlay');
            
            const closeModal = () => {
                modalConfirm.remove();
                document.body.style.overflow = '';
            };
            
            confirmBtn?.addEventListener('click', () => {
                deleteCategoryData(categoryId);
                closeModal();
            });
            
            cancelBtn?.addEventListener('click', closeModal);
            overlay?.addEventListener('click', closeModal);
        }
    }
});