import { checkAuhtUser, logout } from "../../utils/authLocal";

const buttonLogout = document.getElementById(
  "logoutButton"
) as HTMLButtonElement;
buttonLogout?.addEventListener("click", () => {
  logout();
});


const initPage = () => {
  console.log("inicio de pagina");
  checkAuhtUser(
    "/src/pages/auth/login/login.html",
    "/src/pages/store/home/home.html",
    "ADMIN"
  );
};
initPage();
