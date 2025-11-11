import { logout } from "../../utils/authLocal";
import { initBurgerMenu } from "../../utils/burger-menu";
import { initLogoutButton } from "../../utils/logoutButton";
import { initSidebar } from "../../utils/sidebar";

// --- Sidebar desplegable ---
const sidebar = document.getElementById('sidebar-categorias');
const sidebarToggle = document.getElementById('sidebar-toggle');
const contenedorContenido = document.querySelector('.contenedor-contenido-pagina');
// --- Menú hamburguesa responsivo ---
document.addEventListener('DOMContentLoaded', function() {
  
  initBurgerMenu();
  initSidebar(sidebar as HTMLElement, sidebarToggle as HTMLElement, contenedorContenido as HTMLElement);
  initLogoutButton();
});
