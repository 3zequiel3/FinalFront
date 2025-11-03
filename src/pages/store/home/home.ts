
import { envs } from "../../../utils/enviromentVariable.ts";
import { getUserLoggedName } from "../../../utils/authLocal.ts";
import {checkAuthUser, logout } from "../../../utils/authLocal.ts";
import type { ICategory } from "../../../types/ICategory.ts";

const API_URL = envs.API_URL;

// ---------------------------------------funcionalidad de sidebar de categorias-------------------------------

// --- Sidebar desplegable ---
const sidebar = document.getElementById('sidebar-categorias');
const sidebarToggle = document.getElementById('sidebar-toggle');
const contenedorContenido = document.querySelector('.contenedor-contenido-pagina');

// ---------------------------------------Menú hamburguesa responsivo ------------------------------------------------------------------------
import { initBurgerMenu } from "../../../utils/burger-menu.ts";
import { initLogoutButton } from "../../../utils/logoutButton.ts";
import { initSidebar } from "../../../utils/sidebar.ts";
document.addEventListener('DOMContentLoaded', ()=>{
  initSidebar(sidebar as HTMLElement, sidebarToggle as HTMLElement, contenedorContenido as HTMLElement);
  initBurgerMenu();
  initLogoutButton();
});

// --------------------------------------- Fin menú hamburguesa responsivo ------------------------------------------------------------------------




// Make sure the path is correct; adjust if necessary, for example:


// If the file is actually named "authLocal.ts" and is in a different folder, update the path accordingly, e.g.:
// import { checkAuhtUser, checkAuthUser, logout } from "../../utils/authLocal";

const buttonLogout = document.getElementById(
  "logoutButton"
) as HTMLButtonElement;
buttonLogout?.addEventListener("click", () => {
  logout();
});

const initPage = () => {
  console.log("inicio de pagina");
  checkAuthUser('CLIENT');
};

const userNameElement = document.querySelector('.navbar-user') as HTMLLIElement;


const displayUserName = () => {
  const name = getUserLoggedName();
  console.log("Nombre de usuario obtenido:", name);
  userNameElement.textContent = name;
};
displayUserName();






initPage();




const categoryList = document.getElementById('category-list') as HTMLUListElement;
const dropdownCategoryList = document.getElementById('dropdown-category-list') as HTMLUListElement;

// Guardar productos en memoria para filtrar
let productosMem: Producto[] = [];

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


getCategories()


const displayCategories = async () => {
  try {
    const categories = await getCategories();
    categoryList.innerHTML = "";
    if (dropdownCategoryList) dropdownCategoryList.innerHTML = "";

    // Agregar primero 'Todos los productos' al menú mobile
    if (dropdownCategoryList) {
      const dropLiTodos = document.createElement("li");
      const dropATodos = document.createElement("a");
      dropATodos.href = "#";
      dropATodos.textContent = "Todos los productos";
      dropLiTodos.appendChild(dropATodos);
      dropdownCategoryList.appendChild(dropLiTodos);
    }

    categories.forEach((category: ICategory) => {
      // Sidebar (con icono)
      const listItem = document.createElement("li");
      const link = document.createElement("a");
      link.href = "#";
      const spanIcon = document.createElement("span");
      spanIcon.classList.add("dropdown-icon");
      const icon = document.createElement("i");
      icon.classList.add("bi", "bi-list-ul");
      spanIcon.appendChild(icon);
      const pText = document.createElement("p");
      pText.classList.add("dropdown-icon-p");
      pText.textContent = category.nombre;
      link.appendChild(spanIcon);
      link.appendChild(pText);
      listItem.appendChild(link);
      categoryList.appendChild(listItem);

      // Dropdown mobile (sin icono)
      if (dropdownCategoryList) {
        const dropLi = document.createElement("li");
        const dropA = document.createElement("a");
        dropA.href = "#";
        dropA.textContent = category.nombre;
        dropLi.appendChild(dropA);
        dropdownCategoryList.appendChild(dropLi);
      }
    });
  } catch (error) {
    console.error("Error al mostrar las categorías:", error);
  }
}
displayCategories();



// -------------------------funcionalidad para traer los productos-------------------------------

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  marca: string;
  categoriaNombre: string;
  categoriaId: number;
  imagen?: string | null;
  stock: number;
};

const cardFood = document.querySelector('.card-food') as HTMLElement;


// Obtener productos y cruzar con categorías para asignar categoriaId y categoriaNombre correctos
async function getProductosConCategorias(): Promise<Producto[]> {
  try {
    // Obtener productos y categorías en paralelo
    const [productos, categorias] = await Promise.all([
      fetch(`${API_URL}/productos`).then(r => r.json()),
      getCategories()
    ]);
    // Mapear productos para asignar categoriaId y categoriaNombre correctos
    const productosConCat = productos.map((prod: any) => {
      // Buscar la categoría correspondiente
      const cat = categorias.find((c: any) => c.id === prod.categoriaId || c.nombre.toLowerCase() === prod.categoriaNombre?.toLowerCase());
      return {
        ...prod,
        categoriaId: cat ? cat.id : prod.categoriaId,
        categoriaNombre: cat ? cat.nombre : prod.categoriaNombre
      };
    });
    productosMem = productosConCat;
    return productosConCat;
  } catch (error) {
    console.error('Error al obtener productos o categorías:', error);
    return [];
  }
}

function renderProductos(productos: Producto[]) {
  if (!cardFood) return;
  cardFood.innerHTML = '';
  productos.forEach(producto => {
    const card = document.createElement('div');
    card.className = 'food-card';
    
    // Usar imagen del producto o fallback según categoría
    let imgUrl = producto.imagen;
    if (!imgUrl) {
      // Fallback por categoría si no hay imagen
      imgUrl = 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80';
      if (producto.categoriaNombre.toLowerCase().includes('pizza')) imgUrl = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';
      if (producto.categoriaNombre.toLowerCase().includes('bebida')) imgUrl = 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80';
    }

    // Formato precio: "$ 12000"
    const precioFormateado = `$ ${Math.round(producto.precio).toLocaleString('es-AR')}`;
    
    // Estado basado en stock real - solo texto simple en las tarjetas
    const disponible = producto.stock > 0;
    const estadoTexto = disponible ? 'Disponible' : 'Agotado';
    const estadoClase = disponible ? 'food-card__status--ok' : 'food-card__status--no';

    card.innerHTML = `
      <img class="food-card__img" src="${imgUrl}" alt="${producto.nombre}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3075/3075977.png'">
      <div class="food-card__body">
        <span class="food-card__category">${producto.categoriaNombre}</span>
        <h3 class="food-card__title">${producto.nombre}</h3>
        <p class="food-card__desc">${producto.marca}</p>
        <div class="food-card__footer">
          <span class="food-card__price">${precioFormateado}</span>
          <span class="food-card__status ${estadoClase}">${estadoTexto}</span>
        </div>
      </div>
    `;
    card.addEventListener('click', () => mostrarModalProducto({
      ...producto,
      imgUrl,
      precioFormateado
    }));
    cardFood.appendChild(card);
  });
}

// Modal producto
function mostrarModalProducto(producto: any) {
  const modal = document.getElementById('modal-producto') as HTMLElement;
  if (!modal) return;
  (document.getElementById('modal-producto-img') as HTMLImageElement).src = producto.imgUrl;
  (document.getElementById('modal-producto-img') as HTMLImageElement).alt = producto.nombre;
  (document.getElementById('modal-producto-categoria') as HTMLElement).textContent = producto.categoriaNombre;
  (document.getElementById('modal-producto-nombre') as HTMLElement).textContent = producto.nombre;
  (document.getElementById('modal-producto-marca') as HTMLElement).textContent = producto.marca;
  (document.getElementById('modal-producto-precio') as HTMLElement).textContent = producto.precioFormateado;
  (document.getElementById('modal-producto-desc') as HTMLElement).textContent = producto.descripcion || '';
  (document.getElementById('modal-cantidad-input') as HTMLInputElement).value = '1';
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  // Estado disponible/no disponible con cantidad en el modal
  const estado = document.getElementById('modal-producto-estado');
  if (estado) {
    if (producto.stock === 0) {
      estado.textContent = 'Agotado';
      estado.classList.remove('food-card__status--ok');
      estado.classList.add('food-card__status--no');
    } else {
      estado.textContent = `Disponible (${producto.stock} unidades)`;
      estado.classList.remove('food-card__status--no');
      estado.classList.add('food-card__status--ok');
    }
  }
}

// Lógica cantidad y botones modal
window.addEventListener('DOMContentLoaded', () => {
  const cantidadInput = document.getElementById('modal-cantidad-input') as HTMLInputElement;
  const btnResta = document.getElementById('modal-cantidad-resta') as HTMLButtonElement;
  const btnSuma = document.getElementById('modal-cantidad-suma') as HTMLButtonElement;
  if (cantidadInput && btnResta && btnSuma) {
    btnResta.addEventListener('click', () => {
      let val = parseInt(cantidadInput.value, 10);
      if (val > 1) cantidadInput.value = String(val - 1);
    });
    btnSuma.addEventListener('click', () => {
      let val = parseInt(cantidadInput.value, 10);
      cantidadInput.value = String(val + 1);
    });
  }
  // Botón volver cierra modal
  const btnVolver = document.getElementById('modal-volver') as HTMLButtonElement;
  const modalProducto = document.getElementById('modal-producto') as HTMLElement;
  if (btnVolver && modalProducto) {
    btnVolver.addEventListener('click', () => {
      modalProducto.style.display = 'none';
      document.body.style.overflow = '';
    });
  }
});


// Cerrar modal
const modalCloseBtn = document.getElementById('modal-producto-close');
const modalProducto = document.getElementById('modal-producto');
if (modalCloseBtn && modalProducto) {
  modalCloseBtn.addEventListener('click', () => {
    modalProducto.style.display = 'none';
    document.body.style.overflow = '';
  });
  // Cerrar al hacer click fuera del contenido
  modalProducto.addEventListener('click', (e) => {
    if (e.target === modalProducto) {
      modalProducto.style.display = 'none';
      document.body.style.overflow = '';
    }
  });
}


// Filtro por categoría y actualización de título
function filtrarPorCategoria(categoriaId: number|null) {
  if (!productosMem.length) return;
  const titulo = document.querySelector('.client-title') as HTMLElement;
  if (categoriaId === null) {
    renderProductos(productosMem);
    if (titulo) titulo.textContent = 'Todos Los Productos';
  } else {
    const productosFiltrados = productosMem.filter(p => p.categoriaId === categoriaId);
    renderProductos(productosFiltrados);
    // Buscar el nombre de la categoría
    const cat = productosFiltrados[0]?.categoriaNombre;
    if (titulo) titulo.textContent = cat ? cat : 'Productos';
  }
}

// Función para marcar categoría activa
function setActiveCategory(categoryLi: HTMLElement) {
  // Remover active de todos los li del sidebar
  const allSidebarLis = document.querySelectorAll('.sidebar-categorias li');
  allSidebarLis.forEach(li => li.classList.remove('active'));
  
  // Agregar active al li clickeado
  categoryLi.classList.add('active');
  
  // También en el dropdown mobile
  const allDropdownLis = document.querySelectorAll('.dropdown-menu li');
  allDropdownLis.forEach(li => li.classList.remove('active'));
}

// Clicks en sidebar y menú mobile
window.addEventListener('DOMContentLoaded', () => {
  // Click en "Todos los productos" sidebar
  const todosLi = document.querySelector('.sidebar-categorias ul li') as HTMLLIElement;
  if (todosLi) {
    // Marcar como activo por defecto
    todosLi.classList.add('active');
    
    const todosLink = todosLi.querySelector('a');
    if (todosLink) {
      todosLink.addEventListener('click', (e) => {
        e.preventDefault();
        setActiveCategory(todosLi);
        filtrarPorCategoria(null);
      });
    }
  }
  
  // Click en categorías dinámicas sidebar
  categoryList.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const li = target.closest('li') as HTMLLIElement;
    if (!li) return;
    
    e.preventDefault();
    setActiveCategory(li);
    
    const nombre = li.textContent?.trim().toLowerCase();
    const prodCat = productosMem.find(p => p.categoriaNombre.toLowerCase() === nombre);
    if (prodCat) {
      filtrarPorCategoria(prodCat.categoriaId);
    } else {
      filtrarPorCategoria(null);
    }
  });

  // Click en menú mobile
  if (dropdownCategoryList) {
    dropdownCategoryList.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const li = target.closest('li') as HTMLLIElement;
      if (target.tagName === 'A' && li) {
        e.preventDefault();
        
        // Remover active de dropdown y agregar al clickeado
        const allDropdownLis = document.querySelectorAll('.dropdown-menu li');
        allDropdownLis.forEach(item => item.classList.remove('active'));
        li.classList.add('active');
        
        const nombre = target.textContent?.trim().toLowerCase();
        if (nombre === 'todos los productos') {
          // También marcar en sidebar
          const todosLiSidebar = document.querySelector('.sidebar-categorias ul li') as HTMLLIElement;
          if (todosLiSidebar) {
            setActiveCategory(todosLiSidebar);
          }
          filtrarPorCategoria(null);
        } else {
          const prodCat = productosMem.find(p => p.categoriaNombre.toLowerCase() === nombre);
          if (prodCat) {
            // Sincronizar con sidebar
            const allSidebarLis = document.querySelectorAll('.sidebar-categorias li');
            allSidebarLis.forEach(sidebarLi => {
              if (sidebarLi.textContent?.trim().toLowerCase().includes(nombre)) {
                setActiveCategory(sidebarLi as HTMLLIElement);
              }
            });
            filtrarPorCategoria(prodCat.categoriaId);
          } else {
            filtrarPorCategoria(null);
          }
        }
        // Cerrar menú hamburguesa móvil
        const links = document.getElementById('navbar-links');
        const burger = document.getElementById('navbar-burger');
        if (links && burger) {
          links.classList.remove('navbar-links--open');
          burger.classList.remove('open');
        }
      }
    });
  }
});


// Ejecutar al cargar la página
async function cargarProductos() {
  const productos = await getProductosConCategorias();
  renderProductos(productos);
}
cargarProductos();



// -------------------------fin funcionalidad para traer los productos-----------------------------------------



// ---------------------------------------Funcionalidad de modal de productos----------------------------------------







// ---------------------------------fin funcionalidad de modal de productos-----------------------------------------