import { IUser } from "../../types/IUser";
import { checkAuth } from "../../utils/auth";


const userData : IUser = JSON.parse(localStorage.getItem('userData') || '{}');
const initPage = () => {
    checkAuth('/src/pages/auth/login/login.html', '/src/pages/admin/home/home.html', '/src/pages/client/home/home.html', userData.role);
    console.log("Client Home page");
}

initPage();