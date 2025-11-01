import type { IUser, IUserLogin } from "../types/IUser";
import type { Rol } from "../types/Rol";
import { getUser } from "./api";
import { envs } from "./enviromentVariable";
import { getUSer, removeUser } from "./localStorage";
import { navigate } from "./navigate";


const SRC_ADMIN_HOME = envs.SRC_ADMIN_HOME;
const SRC_CLIENT_HOME = envs.SRC_CLIENT_HOME;
const SRC_LOGIN = envs.SRC_LOGIN;
// export const checkAuhtUser = (
//   redireccion1: string,
//   redireccion2: string,
//   rol: Rol
// ) => {
//   console.log("comienzo de checkeo");

//   const user = getUSer();

//   if (!user) {
//     console.log("no existe en local");
//     navigate(redireccion1);
//     return;
//   } else {
//     console.log("existe pero no tiene el rol necesario");

//     const parseUser: IUser = JSON.parse(user);
//     if (parseUser.role !== rol) {
//       navigate(redireccion2);
//       return;
//     }
//   }
// };

const API_URL = envs.API_URL;

export const checkAuthUser = async (rolEsperado?: Rol) => {
  console.log("comienzo de checkeo");
  const user: IUser = await getUser();
  if (!user) {
    console.log("No hay usuario autenticado");
    navigate(SRC_LOGIN);
    return;
  }

  const role = (user.role ?? "") as Rol;
  if(rolEsperado){
    if(role !== rolEsperado){
      rolAuth(role);
      return;
    }
    return;
  }
  rolAuth(role);
};


export const rolAuth = (role: Rol)=>{
  if(role === 'ADMIN'){
    navigate(SRC_ADMIN_HOME);
    return;
  }else if(role === 'CLIENT'){
    navigate(SRC_CLIENT_HOME);
    return;
  }else{
    navigate(SRC_LOGIN);
    return;
  }
}

const logoutBack = async () => {
  try {
    const user = getUSer();
    if (!user) return;
    const parseUser: IUserLogin = JSON.parse(user);

    const response = await fetch(`${API_URL}/usuario/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: parseUser.email }),
    });
    if (!response.ok) {
      console.error("Error en logoutBack:", response.statusText);
    } else {
      console.log("Logout en back exitoso");
    }
  } catch (error) {
    console.error("Error en logoutBack:", error);
  }
}

export const getUserLogged = (): IUserLogin => {
  const user = localStorage.getItem("userData");
  if (!user) throw new Error("No user logged in");
  const parsedUser: IUserLogin = JSON.parse(user);
  return parsedUser;
};

export const getUserLoggedName = (): string => {
  const user = getUserLogged();
  return user.name;
}

export const logout = async () => {
  await logoutBack();
  removeUser();
  navigate(SRC_LOGIN);
};
