import type { ICategory, ICategoryCreate } from "../../types/ICategory";
import { envs } from "../../utils/enviromentVariable";

const form = document.getElementById("category-form") as HTMLFormElement;

const inputCategoryName = document.getElementById("category-name") as HTMLInputElement;
const textareaCategoryDescription = document.getElementById("category-description") as HTMLTextAreaElement;

const categoryTable = document.getElementById("category-table-body") as HTMLTableSectionElement;


const API_URL = envs.API_URL;


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
        await displayCategories();
    } catch (error) {
        console.error("Error al subir los datos de la categoría:", error);
        alert("Error al crear la categoría");
    }
}



form.addEventListener("submit", async (event: SubmitEvent) => {
    event.preventDefault();

    const newCategory: ICategoryCreate = {
        nombre: inputCategoryName.value,
        descripcion: textareaCategoryDescription.value
    };

    try {
        const categoryData = await uploadCategoryData(newCategory);
        console.log("Categoría creada:", categoryData);
    } catch (error) {
        console.error("Error al subir los datos de la categoría:", error);
        alert("Error al crear la categoría");
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
        categoryTable.innerHTML = "";

        categories.forEach((category: ICategory) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${category.id}</td>
                <td>${category.nombre}</td>
                <td>${category.descripcion}</td>
                <td>
                    <button class="btn btn-edit" data-id="${category.id}">Editar</button>
                    <button class="btn btn-delete" data-id="${category.id}">Eliminar</button>
                </td>
            `;
            categoryTable.appendChild(row);
        });
    } catch (error) {
        console.error("Error al mostrar las categorías:", error);
    }
}
displayCategories();


const aggregateButton = document.getElementById("add-category-btn") as HTMLButtonElement;
const modal = document.getElementById("modal-create") as HTMLDivElement;
const closeBtn = document.getElementById("close-create") as HTMLSpanElement;

const editButtons = document.querySelectorAll(".btnbtn-edit") as NodeListOf<HTMLButtonElement>;

// Mostrar el modal al hacer click en "Agregar Categoría"
aggregateButton.addEventListener("click", () => {
    modal.style.display = "flex";
});

// Cerrar el modal al hacer click en la "X"
closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});

// Opcional: cerrar el modal al hacer click fuera del contenido
window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

categoryTable.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains("btn-edit")) {
        modal.style.display = "flex";
        modal.querySelector("h2")!.textContent = "Editar Categoría";
        const categoryId = target.dataset.id;
        const editCategory = async () => {
            try {
                const response = await fetch(`${API_URL}/categorias/${categoryId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                if (!response.ok) throw new Error(`Error en la solicitud: ${response.statusText}`);
                const category = await response.json();
                inputCategoryName.value = category.nombre;
                textareaCategoryDescription.value = category.descripcion;
            } catch (error) {
                console.error("Error al obtener la categoría para editar:", error);
            }
        };
        editCategory();
    }
    if (target.classList.contains("btn-delete")) {
        const categoryId = target.dataset.id;
        // Aquí puedes manejar la eliminación
    }
});