import { logout } from "../../utils/authLocal";

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

// --- Menú hamburguesa responsivo ---
document.addEventListener('DOMContentLoaded', function() {
  const burger = document.getElementById('navbar-burger');
  const links = document.getElementById('navbar-links');
  if (burger && links) {
    burger.addEventListener('click', function() {
      links.classList.toggle('navbar-links--open');
      burger.classList.toggle('open');
    });
  }

  // --- Dropdown mobile ---
  const dropdown = document.querySelector('.navbar-dropdown-mobile');
  const dropdownToggle = dropdown?.querySelector('.dropdown-toggle') as HTMLButtonElement;

  if (dropdown && dropdownToggle) {
    dropdownToggle.addEventListener('click', function () {
      const isOpen = dropdown.classList.toggle('open');
      dropdownToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // --- Botones de logout ---
  const logoutButton = document.getElementById('logoutButton');
  const logoutButtonDesktop = document.getElementById('logoutButtonDesktop');

  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      await logout();
      // La redirección ya se hace dentro de logout() al llamar a logoutBack()
    });
  }

  if (logoutButtonDesktop) {
    logoutButtonDesktop.addEventListener('click', async () => {
      await logout();
      // La redirección ya se hace dentro de logout() al llamar a logoutBack()
    });
  }
});
