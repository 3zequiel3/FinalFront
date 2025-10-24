import type { IUser } from "../../../types/IUser";
import type { Rol } from "../../../types/Rol";
import { navigate } from "../../../utils/navigate"; 

const form = document.getElementById("form") as HTMLFormElement;

const inputName = document.getElementById("name") as HTMLInputElement;
const inputEmail = document.getElementById("email") as HTMLInputElement;
const inputPassword = document.getElementById("password") as HTMLInputElement;
const inputConfirmPassword = document.getElementById("confirm-password") as HTMLInputElement;
const passwordError = document.getElementById("password-error") as HTMLSpanElement;

// Función para verificar si las contraseñas coinciden
const verificarPassword = () => {
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
inputPassword.addEventListener("input", verificarPassword);
inputConfirmPassword.addEventListener("input", verificarPassword);



// Función para subir datos del nuevo usuario
const subirDatosUsuario = async (user: IUser) => {
  try {
    // Preparar los datos con el formato que espera el backend
    const dataToSend = {
      name: user.name,
      email: user.email,
      pass: user.password,  // El backend espera "pass" no "password"
      role: user.role
    };
    
    console.log("Datos que se enviarán al servidor:", dataToSend);
    
    const response = await fetch("http://localhost:5020/cliente", {
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
      try {
        const errorJson = JSON.parse(errorText);
        console.error("Error JSON del servidor:", errorJson);
      } catch {
        console.error("El servidor respondió con texto:", errorText);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Usuario registrado exitosamente:", data);
    return data;
    
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    alert("Hubo un error al registrar el usuario. Por favor, intenta de nuevo.");
    throw error;
  }
};




form.addEventListener("submit", async (e: SubmitEvent) => {
  e.preventDefault();
  const valueName = inputName.value;
  const valueEmail = inputEmail.value;
  const valuePassword = inputPassword.value;
  const valueConfirmPassword = inputConfirmPassword.value;

  if (valuePassword !== valueConfirmPassword) {
    alert("Las contraseñas no coinciden");
    return;
  }

  const user: IUser = {
    name: valueName,
    email: valueEmail,
    password: valuePassword,
    role: "client" as Rol,
    loggedIn: true,    
  };

  try {
    // Subir el usuario al servidor
    const userData = await subirDatosUsuario(user);
    
    // Si el registro fue exitoso, guardar en localStorage
    const parseUser = JSON.stringify({ ...user, id: userData.id || 1 });
    localStorage.setItem("userData", parseUser);
    
    // Navegar a la página principal
    navigate("/src/pages/store/home/home.html");
    
  } catch (error) {
    // Si hubo un error, no navegar
    console.error("No se pudo completar el registro");
  }
});




