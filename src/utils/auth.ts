import { IUser } from "../types/IUser";
import { Role } from "../types/Role";
import { getUser } from "./localStorage";
import { navigate } from "./navigate";

export const checkAuth = (loginRedirect: string, adminRedirect: string, clientRedirect: string, rol: Role) => {
    const user = getUser();
    console.log("Usuario obtenido de localStorage:", user);
    
    try {
        if (!user) {
            alert('No estás autenticado. Redirigiendo al login.');
            navigate(loginRedirect);
            return;
        }
        
        const parseUser: IUser = JSON.parse(user);
        const currentPath = window.location.pathname;
        
        console.log("Rol del usuario:", parseUser.role);
        console.log("Ruta actual:", currentPath);

        if (parseUser.role === 'admin') {
            // Solo redirigir si NO está en una página de admin
            if (!currentPath.includes('/admin/')) {
                console.log("Redirigiendo admin a área administrativa");
                navigate(adminRedirect);
            } else {
                console.log("Admin ya está en su área - NO redirigir");
            }
        } else if (parseUser.role === 'client') {
            // Solo redirigir si NO está en una página de cliente
            if (!currentPath.includes('/client/')) {
                console.log("Redirigiendo cliente a área de cliente");
                navigate(clientRedirect);
            } else {
                console.log("Cliente ya está en su área - NO redirigir");
            }
        } else {
            alert('Rol no válido. Redirigiendo al login.');
            navigate(loginRedirect);
        }
    } catch (error) {
        console.error('Error al verificar la autenticación:', error);
        navigate(loginRedirect);
    }
}