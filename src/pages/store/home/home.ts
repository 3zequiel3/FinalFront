import { envs } from "../../../utils/enviromentVariable.ts";

const API_URL = envs.API_URL;

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




// Make sure the path is correct; adjust if necessary, for example:
import {checkAuthUser, logout } from "../../../utils/authLocal.ts";

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
  // checkAuhtUser(
  //   "/src/pages/auth/login/login.html",
  //   "/src/admin/home/home.html",
  //   "CLIENT"
  // );

  checkAuthUser('CLIENT');
};











initPage();




const categoryList = document.getElementById('category-list') as HTMLUListElement;

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