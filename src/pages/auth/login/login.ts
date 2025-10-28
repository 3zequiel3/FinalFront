import type { IUser } from "../../../types/IUser";
import { envs } from "../../../utils/enviromentVariable";
import { navigate } from "../../../utils/navigate";

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
      const data: IUser = await response.json();
      localStorage.setItem("userData", JSON.stringify(data));
      console.log("Autenticación exitosa:", data);

      // Redirigir según el rol que devuelve el backend
      if (data.role === "ADMIN") {
        navigate(SRC_ADMIN_HOME);
      } else if (data.role === "CLIENT") {
        navigate(SRC_CLIENT_HOME);
      } else {
        console.error("Rol no reconocido:", data.role);
        loginError.textContent = "❌ Rol de usuario no válido";
      }
    } else {
      // Error 400 o 401 = credenciales incorrectas
      console.error("Error en la autenticación:", response.statusText);
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

console.log("login");




const getData = async () => {
  const response = await fetch(`${API_URL}/usuario`, {
    method: "GET",
  });
  const data = await response.json();
  console.log(data);
};


getData();


