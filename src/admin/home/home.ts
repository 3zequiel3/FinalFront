import { getUserLoggedName } from "../../utils/authLocal";
import { checkAuthUser, logout } from "../../utils/authLocal";

// ---------------------------------------funcionalidad de sidebar de categorias-------------------------------

// --- Sidebar desplegable ---
const sidebar = document.getElementById('sidebar-categorias');
const sidebarToggle = document.getElementById('sidebar-toggle');
const contenedorContenido = document.querySelector('.contenedor-contenido-pagina');
if (sidebar && sidebarToggle && contenedorContenido) {
  const iconHamburguesa = document.getElementById('sidebar-toggle-icon-hamburguesa');
  const iconX = document.getElementById('sidebar-toggle-icon-x');
  function updateSidebarToggleIcon() {
    if (!sidebar) return;
    const isHidden = sidebar.classList.contains('sidebar-categorias--hidden');
    if (iconHamburguesa && iconX) {
      if (isHidden) {
        iconHamburguesa.style.display = '';
        iconX.style.display = 'none';
      } else {
        iconHamburguesa.style.display = 'none';
        iconX.style.display = '';
      }
    }
  }
  sidebarToggle.addEventListener('click', () => {
    const oculto = sidebar.classList.toggle('sidebar-categorias--hidden');
    sidebarToggle.classList.add('bounce');
    setTimeout(() => sidebarToggle.classList.remove('bounce'), 350);
    if (oculto) {
      contenedorContenido.classList.add('bg-rojo');
    } else {
      contenedorContenido.classList.remove('bg-rojo');
    }
    updateSidebarToggleIcon();
  });
  // Opcional: cerrar sidebar con tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !sidebar.classList.contains('sidebar-categorias--hidden')) {
      sidebar.classList.add('sidebar-categorias--hidden');
      sidebarToggle.classList.add('bounce');
      setTimeout(() => sidebarToggle.classList.remove('bounce'), 350);
      contenedorContenido.classList.add('bg-rojo');
      updateSidebarToggleIcon();
    }
  });
  // Inicializar icono correcto al cargar
  updateSidebarToggleIcon();
}

// ---------------------------------------Menú hamburguesa responsivo ------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
  const burger = document.getElementById('navbar-burger');
  const links = document.getElementById('navbar-links');
  if (burger && links) {
    burger.addEventListener('click', function() {
      links.classList.toggle('navbar-links--open');
      burger.classList.toggle('open');
    });
  }

  // Dropdown mobile
  const dropdown = document.querySelector('.navbar-dropdown-mobile');
  const dropdownToggle = dropdown?.querySelector('.dropdown-toggle') as HTMLButtonElement;

  if (dropdown && dropdownToggle) {
    dropdownToggle.addEventListener('click', function () {
      const isOpen = dropdown.classList.toggle('open');
      dropdownToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }
});

// --------------------------------------- Fin menú hamburguesa responsivo ------------------------------------------------------------------------
const buttonLogout = document.getElementById(
  "logoutButton"
) as HTMLButtonElement;
buttonLogout?.addEventListener("click", () => {
  logout();
});


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
import { envs } from "../../utils/enviromentVariable";

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
      cantDisponiblesEl.textContent = productos.length.toString();
    }

    // Pedidos (por ahora en 0 ya que no está implementado)
    if (cantPedidosEl) {
      cantPedidosEl.textContent = '0';
    }

    // Actualizar resumen rápido
    if (resumenQuickEl) {
      resumenQuickEl.innerHTML = `
        <p style="margin: 0.5rem 0; color: #555;">
          📁 <strong>${categorias.length}</strong> categorías registradas
        </p>
        <p style="margin: 0.5rem 0; color: #555;">
          🍔 <strong>${productos.length}</strong> productos en total
        </p>
        <p style="margin: 0.5rem 0; color: #555;">
          ✅ <strong>${productos.length}</strong> productos disponibles
        </p>
        <p style="margin: 0.5rem 0; color: #999; font-style: italic;">
          📦 Sistema de pedidos próximamente...
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
          alert('Sistema de pedidos próximamente...');
          break;
        default:
          break;
      }
    });
  }
});

// Cargar estadísticas al iniciar
loadEstadisticas();

