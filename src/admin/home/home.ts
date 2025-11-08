import { getUserLoggedName } from "../../utils/authLocal";
import { checkAuthUser, logout } from "../../utils/authLocal";
import { initBurgerMenu } from "../../utils/burger-menu";
import { envs } from "../../utils/enviromentVariable";
import { initLogoutButton } from "../../utils/logoutButton";
import { initSidebar } from "../../utils/sidebar";

// ---------------------------------------funcionalidad de sidebar de categorias-------------------------------

// --- Sidebar desplegable ---
const sidebar = document.getElementById('sidebar-categorias');
const sidebarToggle = document.getElementById('sidebar-toggle');
const contenedorContenido = document.querySelector('.contenedor-contenido-pagina');

// Funcionalidad del sidebar desde utils/sidebar.ts
//Funcionalidad del menu hamburguesa desde utils/burger-menu.ts
document.addEventListener('DOMContentLoaded', ()=>{
  initSidebar(sidebar as HTMLElement, sidebarToggle as HTMLElement, contenedorContenido as HTMLElement);
  initBurgerMenu();
  initLogoutButton();
});


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

// Marcar Dashboard como activo por defecto al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  const dashboardLi = document.querySelector('.sidebar-categorias ul li:first-child') as HTMLLIElement;
  if (dashboardLi) {
    dashboardLi.classList.add('active');
  }

  // También marcar en el dropdown mobile
  const dashboardDropdownLi = document.querySelector('.dropdown-menu li:first-child') as HTMLLIElement;
  if (dashboardDropdownLi) {
    dashboardDropdownLi.classList.add('active');
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

const userNameElement = document.querySelector('.navbar-user') as HTMLLIElement;


const displayUserName = () => {
  const name = getUserLoggedName();
  console.log("Nombre de usuario obtenido:", name);
  userNameElement.textContent = name;
};
displayUserName();

const initPage = () => {
  console.log("inicio de pagina");
  // checkAuhtUser(
  //   "/src/pages/auth/login/login.html",
  //   "/src/pages/store/home/home.html",
  //   "ADMIN"
  // );
  checkAuthUser('ADMIN');
};
initPage();

const buttonLogoutDesktop = document.getElementById(
  "logoutButtonDesktop"
) as HTMLButtonElement;

buttonLogoutDesktop?.addEventListener("click", () => {
  logout();
});

// --------------------------------------- Funcionalidad del Dashboard ------------------------------------------------------------------------



const API_URL = envs.API_URL;

// Obtener elementos del DOM
const cantCategoriasEl = document.getElementById('admin-cant-categorias');
const cantProductosEl = document.getElementById('admin-cant-productos');
const cantPedidosEl = document.getElementById('admin-cant-pedidos');
const cantDisponiblesEl = document.getElementById('admin-cant-disponibles');
const resumenQuickEl = document.querySelector('.admin-summary-quick__body');

// Función para obtener categorías
async function getCategorias() {
  try {
    const response = await fetch(`${API_URL}/categorias`);
    if (!response.ok) throw new Error('Error al obtener categorías');
    const categorias = await response.json();
    return categorias;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// Función para obtener productos
async function getProductos() {
  try {
    const response = await fetch(`${API_URL}/productos`);
    if (!response.ok) throw new Error('Error al obtener productos');
    const productos = await response.json();
    return productos;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// Función para obtener pedidos
async function getPedidos() {
  try {
    const response = await fetch(`${API_URL}/pedidos`);
    if (!response.ok) throw new Error('Error al obtener pedidos');
    const pedidos = await response.json();
    return pedidos;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// Función para cargar estadísticas
async function loadEstadisticas() {
  try {
    // Cargar categorías
    const categorias = await getCategorias();
    if (cantCategoriasEl) {
      cantCategoriasEl.textContent = categorias.length.toString();
    }

    // Cargar productos
    const productos = await getProductos();
    if (cantProductosEl) {
      cantProductosEl.textContent = productos.length.toString();
    }

    // Contar productos disponibles (asumiendo que todos están activos por ahora)
    if (cantDisponiblesEl) {
      let productosDisponibles = productos.filter((prod: any) => prod.stock > 0);
      cantDisponiblesEl.textContent = productosDisponibles.length.toString();
    }

    // Cargar pedidos
    const pedidos = await getPedidos();
    if (cantPedidosEl) {
      cantPedidosEl.textContent = pedidos.length.toString();
    }

    // Contar pedidos por estado
    const pedidosPendientes = pedidos.filter((p: any) => p.estado === 'PENDIENTE').length;
    const pedidosConfirmados = pedidos.filter((p: any) => p.estado === 'CONFIRMADO').length;
    const pedidosTerminados = pedidos.filter((p: any) => p.estado === 'TERMINADO').length;

    // Actualizar resumen rápido
    if (resumenQuickEl) {
      resumenQuickEl.innerHTML = `
        <p style="margin: 0.5rem 0; color: #ffffff;">
          📁 <strong>${categorias.length}</strong> categorías registradas
        </p>
        <p style="margin: 0.5rem 0; color: #ffffff;">
          🍔 <strong>${productos.length}</strong> productos en total
        </p>
        <p style="margin: 0.5rem 0; color: #ffffff;">
          ✅ <strong>${productos.length}</strong> productos disponibles
        </p>
        <p style="margin: 0.5rem 0; color: #ffffff;">
          📦 <strong>${pedidos.length}</strong> pedidos totales
        </p>
        <p style="margin: 0.5rem 0; color: #ffc107;">
          ⏳ <strong>${pedidosPendientes}</strong> pendientes
        </p>
        <p style="margin: 0.5rem 0; color: #2196f3;">
          ✓ <strong>${pedidosConfirmados}</strong> confirmados
        </p>
        <p style="margin: 0.5rem 0; color: #4caf50;">
          ✔ <strong>${pedidosTerminados}</strong> terminados
        </p>
      `;
    }
  } catch (error) {
    console.error('Error al cargar estadísticas:', error);
    if (resumenQuickEl) {
      resumenQuickEl.innerHTML = '<p style="color: #ff4a4a;">Error al cargar estadísticas</p>';
    }
  }
}

// Conectar botones "Gestionar"
const cards = document.querySelectorAll('.admin-summary-card');
cards.forEach((card, index) => {
  const btn = card.querySelector('.admin-summary-card__btn');
  if (btn) {
    btn.addEventListener('click', () => {
      switch (index) {
        case 0: // Categorías
          window.location.href = '../categories/categories.html';
          break;
        case 1: // Productos
          window.location.href = '../products/products.html';
          break;
        case 2: // Pedidos
          window.location.href = '../orders/orders.html';
          break;
        default:
          break;
      }
    });
  }
});

// Cargar estadísticas al iniciar
loadEstadisticas();

