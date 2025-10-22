import type { IUser } from "../../../types/IUser";
import type { Rol } from "../../../types/Rol";
import { navigate } from "../../../utils/navigate"; 

const form = document.getElementById("form") as HTMLFormElement;

const inputName = document.getElementById("name") as HTMLInputElement;
const inputEmail = document.getElementById("email") as HTMLInputElement;
const inputPassword = document.getElementById("password") as HTMLInputElement;

form.addEventListener("submit", (e: SubmitEvent) => {
  e.preventDefault();
  const valueName = inputName.value;
  const valueEmail = inputEmail.value;
  const valuePassword = inputPassword.value;

  const user: IUser = {
    name: valueName,
    email: valueEmail,
    password: valuePassword,
    role: "client" as Rol,
    loggedIn: true,
    id: 1,
  };

  const parseUser = JSON.stringify(user);
  localStorage.setItem("userData", parseUser);

  navigate("/src/pages/store/home/home.html");
});