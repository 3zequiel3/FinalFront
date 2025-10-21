import { IUser } from "../../../types/IUser";
import { Role } from "../../../types/Role";
import { navigate } from "../../../utils/navigate";
import {  saveUser } from "../../../utils/localStorage";

const emailInput = document.getElementById('email') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const roleSelect = document.getElementById('role') as HTMLSelectElement;
const loginForm = document.getElementById('form_login') as HTMLFormElement;

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    const role = roleSelect.value as Role;

    if (!email || !password) {
        console.error("Por favor, complete todos los campos.");
        return;
    }

    const user: IUser = {
        email: email,
        password: password,
        role: role,
        activo: true
    }
    // Guardar usuario y establecer sesión
    saveUser(user);
    if (role === 'admin') {
        navigate('/src/admin/home/home.html');
    } else if (role === 'client') {
        navigate('/src/client/home/home.html');
    }

    console.log("Usuario logueado:", { email, password, role });
})