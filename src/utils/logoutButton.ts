import { logout } from "./authLocal";

export const initLogoutButton = () => {
    const logoutButton = document.getElementById('logoutButton');
      const logoutButtonDesktop = document.getElementById('logoutButtonDesktop');
    
      if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
          await logout();
        });
      }
    
      if (logoutButtonDesktop) {
        logoutButtonDesktop.addEventListener('click', async () => {
          await logout();
        });
      }
}