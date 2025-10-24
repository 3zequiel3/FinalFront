import type { IUser } from "../../../types/IUser";
import type { Rol } from "../../../types/Rol";
import { navigate } from "../../../utils/navigate";

const form = document.getElementById("form") as HTMLFormElement;
const inputEmail = document.getElementById("email") as HTMLInputElement;
//const inputPassword = document.getElementById("password") as HTMLInputElement;
const selectRol = document.getElementById("rol") as HTMLSelectElement;

form.addEventListener("submit", (e: SubmitEvent) => {
  e.preventDefault();
  const valueEmail = inputEmail.value;
  //const valuePassword = inputPassword.value;
  const valueRol = selectRol.value as Rol;

  if (valueRol === "ADMIN") {
    navigate("/src/admin/home/home.html");
  } else if (valueRol === "CLIENT") {
    navigate("/src/pages/store/home/home.html");
  }

  const user: IUser = {
    email: valueEmail,
    role: valueRol,
    loggedIn: true,
    id: 1,
  };

  const parseUser = JSON.stringify(user);
  localStorage.setItem("userData", parseUser);
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



