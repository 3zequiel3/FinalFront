import type { Rol } from "./Rol";

export interface IUser {
  name?: string;
  email: string;
  password?: string;
  loggedIn: boolean;
  role: Rol;
  id?: number;
}


export interface IUserLogin {
  id?: number;
  name: string;
  email: string;
  role: Rol;
  loggedIn: boolean;
}
