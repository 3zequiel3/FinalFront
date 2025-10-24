import type { IUser } from "../types/IUser";
import type { Rol } from "../types/Rol";
import { getUSer, removeUser } from "./localStorage";
import { navigate } from "./navigate";

export const checkAuhtUser = (
  redireccion1: string,
  redireccion2: string,
  rol: Rol
) => {
  console.log("comienzo de checkeo");

  const user = getUSer();

  if (!user) {
    console.log("no existe en local");
    navigate(redireccion1);
    return;
  } else {
    console.log("existe pero no tiene el rol necesario");

    const parseUser: IUser = JSON.parse(user);
    if (parseUser.role !== rol) {
      navigate(redireccion2);
      return;
    }
  }
};


const logoutBack = async () => {
  try{
    const user = getUSer();
    if(!user) return;
    const parseUser: IUser = JSON.parse(user);

    const response = await fetch( import.meta.env.VITE_API_URL + "cliente/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email : parseUser.email }),
    });
    if(!response.ok){
      console.error("Error en logoutBack:", response.statusText);
    }else{
       navigate("/src/pages/auth/login/login.html");
      console.log("Logout en back exitoso");
    }
  }catch(error){
    console.error("Error en logoutBack:", error);
  }
}

export const logout = async () => {
  await logoutBack();
  removeUser();
  
};
