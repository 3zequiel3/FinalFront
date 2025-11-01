import type { ICategory, ICategoryCreate } from "../../types/ICategory";
import { envs } from "../../utils/enviromentVariable";

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
        alert("Categoría creada con éxito");
        form.reset();
        modal.style.display = "none";
        await displayCategories();
    } catch (error) {
        console.error("Error al subir los datos de la categoría:", error);
        alert("Error al crear la categoría");
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
        alert("Categoría actualizada con éxito");
        form.reset();
        modal.style.display = "none";
        editingCategoryId = null;
        await displayCategories();
    } catch (error) {
        console.error("Error al actualizar la categoría:", error);
        alert("Error al actualizar la categoría");
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
        alert("Error al procesar la categoría");
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
        console.log("Categorías recibidas:", categories);
        
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

        alert("Categoría eliminada con éxito");
        await displayCategories();
    } catch (error) {
        console.error("Error al eliminar la categoría:", error);
        alert("Error al eliminar la categoría");
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
            const confirmDelete = confirm("¿Estás seguro de que deseas eliminar esta categoría?");
            if (confirmDelete) {
                deleteCategoryData(categoryId);
            }
        }
    }
});