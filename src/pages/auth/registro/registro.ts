import { IUser } from "../../../types/IUser";
import { Role } from "../../../types/Role";

const emailInput = document.getElementById('email') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const roleSelect = document.getElementById('role') as HTMLSelectElement;
const loginForm = document.getElementById('form_login') as HTMLFormElement;

let users: Array<IUser> = [];

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    const role = roleSelect.value as Role;

    if (!email || !password || !role) {
        console.error("Por favor, complete todos los campos.");
        return;
    } else {
        users.push({ email, password, role });
        localStorage.setItem('users', JSON.stringify(users));

        console.log("Se añadio el siguiente usuario al sistema:", { email, password, role });
        if (role === 'admin') {
            window.location.href = '/src/pages/admin/home/home.html';
        }
    }
})