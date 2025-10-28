import type { IUser } from "../../../types/IUser";
import type { Rol } from "../../../types/Rol";
import { envs } from "../../../utils/enviromentVariable";
import { navigate } from "../../../utils/navigate"; 

const form = document.getElementById("form") as HTMLFormElement;

const inputName = document.getElementById("name") as HTMLInputElement;
const inputEmail = document.getElementById("email") as HTMLInputElement;
const inputPassword = document.getElementById("password") as HTMLInputElement;
const inputConfirmPassword = document.getElementById("confirm-password") as HTMLInputElement;
const passwordError = document.getElementById("password-error") as HTMLSpanElement;
const registerError = document.getElementById("register-error") as HTMLSpanElement;


const API_URL = envs.API_URL;

const SRC_CLIENT_HOME = envs.SRC_CLIENT_HOME;

// Función para verificar si las contraseñas coinciden
const checkPassword = () => {
  if (inputPassword.value && inputConfirmPassword.value) {
    if (inputPassword.value !== inputConfirmPassword.value) {
      inputConfirmPassword.setCustomValidity("Las contraseñas no coinciden");
      passwordError.textContent = "❌ Las contraseñas no coinciden";
    } else {
      inputConfirmPassword.setCustomValidity("");
      passwordError.textContent = "✓ Las contraseñas coinciden";
      passwordError.style.color = "#4ade80";
    }
  } else {
    passwordError.textContent = "";
    passwordError.style.color = "#ff4444";
  }
};

// Escuchar cambios en ambos campos
inputPassword.addEventListener("input", checkPassword);
inputConfirmPassword.addEventListener("input", checkPassword);



// Función para subir datos del nuevo usuario
const uploadUserData = async (user: IUser) => {
  try {
    // Preparar los datos con el formato que espera el backend
    const dataToSend = {
      name: user.name,
      email: user.email,
      pass: user.password, 
      role: user.role
    };
    
    console.log("Datos que se enviarán al servidor:", dataToSend);
    
    const response = await fetch(`${API_URL}/usuario`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
    });
    
    console.log("Status de la respuesta:", response.status);
    
    if (!response.ok) {
      // Intentar obtener el mensaje de error del servidor
      const errorText = await response.text();
      console.error("Respuesta del servidor:", errorText);
      
      // Mostrar el mensaje del servidor en la UI
      registerError.textContent = `❌ ${errorText}`;
      
      throw new Error(errorText);
    }
    
    const data = await response.json();
    console.log("Usuario registrado exitosamente:", data);
    return data;
    
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    // Si no hay mensaje de error específico, mostrar uno genérico
    if (!registerError.textContent) {
      registerError.textContent = "❌ Error al conectar con el servidor";
    }
    throw error;
  }
};




form.addEventListener("submit", async (e: SubmitEvent) => {
  e.preventDefault();
  
  // Limpiar mensajes de error previos
  registerError.textContent = "";
  
  const valueName = inputName.value;
  const valueEmail = inputEmail.value;
  const valuePassword = inputPassword.value;
  const valueConfirmPassword = inputConfirmPassword.value;

  if (valuePassword !== valueConfirmPassword) {
    registerError.textContent = "❌ Las contraseñas no coinciden";
    return;
  }

  const user: IUser = {
    name: valueName,
    email: valueEmail,
    password: valuePassword,
    role: "CLIENT" as Rol,
    loggedIn: true,    
  };

  try {
    // Subir el usuario al servidor
    const userData = await uploadUserData(user);
    
    // Si el registro fue exitoso, guardar en localStorage
    const parseUser = JSON.stringify({ ...user, id: userData.id || 1 });
    localStorage.setItem("userData", parseUser);
    
    // Navegar a la página principal
    navigate(SRC_CLIENT_HOME);
    
  } catch (error) {
    // Si hubo un error, no navegar
    console.error("No se pudo completar el registro");
  }
});




