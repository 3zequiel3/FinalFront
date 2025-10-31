import { getUserLoggedName } from "../../utils/authLocal";
import { checkAuthUser, logout } from "../../utils/authLocal";


// ---------------------------------------Menú hamburguesa responsivo ------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
  const burger = document.getElementById('navbar-burger');
  const links = document.getElementById('navbar-links');
  if (burger && links) {
    burger.addEventListener('click', function () {
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

