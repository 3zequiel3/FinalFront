import { IUser } from "../types/IUser";

export const saveUser = (user: IUser) => {
    const userData = JSON.stringify(user);
    try{
        localStorage.setItem('userData', userData);
    }catch(error){
        console.error('Error al parsear usuarios:', error);
    }
}

export const getUser = () => {
    return localStorage.getItem('userData');
}

export const removeUser = () => {
    localStorage.removeItem('userData');
}