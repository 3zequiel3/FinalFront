import type { IUser, IUserLogin } from "../../../types/IUser";
import { envs } from "../../../utils/enviromentVariable";
import { navigate } from "../../../utils/navigate";
import { rolAuth } from "../../../utils/authLocal";

const form = document.getElementById("form") as HTMLFormElement;
const inputEmail = document.getElementById("email") as HTMLInputElement;
const inputPassword = document.getElementById("password") as HTMLInputElement;
const loginError = document.getElementById("login-error") as HTMLSpanElement;

const API_URL = envs.API_URL;
const SRC_ADMIN_HOME = envs.SRC_ADMIN_HOME;
const SRC_CLIENT_HOME = envs.SRC_CLIENT_HOME;


const loginBack = async (email: string, password: string) => {
  // Limpiar mensaje de error anterior
  loginError.textContent = "";

  try {
    const response = await fetch(`${API_URL}/usuario/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, pass: password }),
    });
    if (response.ok) {
      // Mostrar la respuesta cruda del backend
      const raw = await response.clone().json();
      console.log("Respuesta cruda del backend (login):", raw);

      const data: IUser = raw;

      const userLogin: IUserLogin = {
        id: data.id,
        name: data.name ?? "",
        email: data.email,
        role: data.role,
        loggedIn: data.loggedIn,
      };

      localStorage.setItem("userData", JSON.stringify(userLogin));
      console.log("Autenticación exitosa:", userLogin);

      // Redirigir según el rol que devuelve el backend
      if (userLogin.role === "ADMIN") {
        navigate(SRC_ADMIN_HOME);
      } else if (userLogin.role === "CLIENT") {
        navigate(SRC_CLIENT_HOME);
      } else {
        console.error("Rol no reconocido:", userLogin.role);
        loginError.textContent = "❌ Rol de usuario no válido";
      }
    } else {
      loginError.textContent = "❌ Email o contraseña incorrectos";
    }
  } catch (error) {
    // Error de red u otro error
    console.error("Error en la autenticación:", error);
    loginError.textContent = "❌ Error al conectar con el servidor";
  }
}
form.addEventListener("submit", async (e: SubmitEvent) => {
  e.preventDefault();
  const valueEmail = inputEmail.value;
  const valuePassword = inputPassword.value;

  await loginBack(valueEmail, valuePassword);
});



const userLogged = () => {
  const userStr = localStorage.getItem("userData");
  if (!userStr) {
    // No hay usuario logueado, no hacer nada
    return;
  }
  try {
    const user: IUserLogin = JSON.parse(userStr);
    if (user.loggedIn) {
      rolAuth(user.role);
    }
  } catch (error) {
    console.error("Error al leer usuario logueado:", error);
  }
}



// traer usuarios de la base de datos para pruebas
const fetchUsers = async () => {
  try {
    const response = await fetch(`${API_URL}/usuario`);
    if (!response.ok) {
      throw new Error(`Error fetching users: ${response.statusText}`);
    }
    const users = await response.json();
    console.log("Usuarios:", users);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

console.log("login");


const initPage = () => {

  // traer usuarios de la base de datos para pruebas
  fetchUsers();


  // verificar si el usuario está logueado
  userLogged();
}

initPage();

