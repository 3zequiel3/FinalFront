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
