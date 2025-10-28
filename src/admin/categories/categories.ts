
import type { ICategory, ICategoryCreate } from "../../types/ICategory";
import { envs } from "../../utils/enviromentVariable";

const form = document.getElementById("category-form") as HTMLFormElement;

const inputCategoryName = document.getElementById("category-name") as HTMLInputElement;

const categoryList = document.getElementById("category-list-items") as HTMLUListElement;


const API_URL = envs.API_URL;


const uploadCategoryData = async (categoryName: ICategoryCreate)=>{
    try {
        const dataToSend = {
            nombre: categoryName.nombre
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
    } catch (error) {
        console.error("Error al subir los datos de la categoría:", error);
        alert("Error al crear la categoría");
    }
}



form.addEventListener("submit", async (event:SubmitEvent) => {
    event.preventDefault();

    const newCategory: ICategoryCreate = {
        nombre: inputCategoryName.value,
    };

    try{
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
        console.log("Categorías obtenidas:", categories);
        return categories;
    } catch (error) {
        console.error("Error al obtener las categorías:", error);
        throw error;
    }
}

const displayCategories = async () => {
    try {
        const categories = await getCategories();
        categoryList.innerHTML = "";

        categories.forEach((category: ICategory) => {
            const listItem = document.createElement("li");
            listItem.textContent = category.nombre;
            categoryList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error al mostrar las categorías:", error);
    }
}
displayCategories();