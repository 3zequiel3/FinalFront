import { Role } from "./Role";

export interface IUser {
    email: string,
    password: string,
    role: Role,
    activo: boolean,
}