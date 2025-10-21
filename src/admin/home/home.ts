import { IUser } from "../../types/IUser";
import { checkAuth } from "../../utils/auth";

const botonLogout = document.getElementById('logoutButton') as HTMLButtonElement;
const userData : IUser = JSON.parse(localStorage.getItem('userData') || '{}');
const initPage = () => {
    checkAuth('/src/pages/auth/login/login.html', '/src/pages/admin/home/home.html', '/src/pages/client/home/home.html', userData.role);
    console.log("Admin Home page");
}

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/src/pages/auth/login/login.html';
}

botonLogout.addEventListener('click', logout);

initPage();