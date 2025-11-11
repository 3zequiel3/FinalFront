import { getUserLoggedName } from "./authLocal";
import { updateCartBadge } from "./cart";

/**
 * Inicializa el nombre del usuario en el navbar
 */
export const initUserName = () => {
    const userNameElement = document.querySelector('.navbar-user') as HTMLLIElement;
    
    if (userNameElement) {
        const name = getUserLoggedName();
        console.log("Nombre de usuario obtenido:", name);
        userNameElement.textContent = name;
    }
};

/**
 * Inicializa el botón del carrito para redirigir a la página del carrito
 * @param cartUrl - URL de la página del carrito (relativa o absoluta)
 */
export const initNavbarCart = (cartUrl: string = '../cart/cart.html') => {
    const navbarCart = document.querySelector('.navbar-cart') as HTMLLIElement;
    
    if (navbarCart) {
        navbarCart.addEventListener('click', () => {
            window.location.href = cartUrl;
        });
    }
};

/**
 * Cierra el menú móvil del navbar (hamburguesa)
 * Útil para cerrar el menú cuando se hace clic en un elemento
 */
export const closeNavbarMobileMenu = () => {
    const links = document.getElementById('navbar-links');
    const burger = document.getElementById('navbar-burger');
    
    if (links && burger) {
        links.classList.remove('navbar-links--open');
        burger.classList.remove('open');
    }
};

/**
 * Inicializa todas las funcionalidades del navbar
 * @param options - Opciones de configuración
 */
export const initNavbar = (options?: { cartUrl?: string }) => {
    initUserName();
    initNavbarCart(options?.cartUrl);
    updateCartBadge(); // Actualizar badge del carrito al cargar
};
