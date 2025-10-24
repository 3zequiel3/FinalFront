import type { IUser } from "../../../types/IUser";
import type { Rol } from "../../../types/Rol";
import { navigate } from "../../../utils/navigate";

const form = document.getElementById("form") as HTMLFormElement;
const inputEmail = document.getElementById("email") as HTMLInputElement;
const inputPassword = document.getElementById("password") as HTMLInputElement;
const selectRol = document.getElementById("rol") as HTMLSelectElement;


const loginBack = async (email: string, password: string, role: Rol) => {
  try {
    const response = await fetch(import.meta.env.VITE_API_URL + "cliente/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, pass: password }),
    });
    if (response.ok) {
      const data : IUser= await response.json();
      localStorage.setItem("userData", JSON.stringify(data));
      console.log("Autenticación exitosa:", data);
      if (role === "ADMIN") {
        navigate("/src/admin/home/home.html");
      } else if (role === "CLIENT") {
        navigate("/src/pages/store/home/home.html");
      }else{
        console.error("Rol no reconocido:", role);
      }
    } else {
      console.error("Error en la autenticación:", response.statusText);
    }
  } catch (error) {
    console.error("Error en la autenticación:", error);
  }
}
form.addEventListener("submit", async (e: SubmitEvent) => {
  e.preventDefault();
  const valueEmail = inputEmail.value;
  const valuePassword = inputPassword.value;
  const valueRol = selectRol.value as Rol;

  await loginBack(valueEmail, valuePassword, valueRol);
  // const user: IUser = {
  //   email: valueEmail,
  //   role: valueRol,
  //   loggedIn: true,
  //   id: 1,
  // };

  // const parseUser = JSON.stringify(user);
  // localStorage.setItem("userData", parseUser);
});

console.log("login");




const traerDatos = async () => {
  const response = await fetch("http://localhost:5020/cliente", {
    method: "GET",
  });
  const data = await response.json();
  console.log(data);
};
traerDatos();



