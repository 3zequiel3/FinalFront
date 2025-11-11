export const initSidebar = (sidebar: HTMLElement, sidebarToggle: HTMLElement, contenedorContenido: HTMLElement) => {
    if (!sidebar || !sidebarToggle || !contenedorContenido) return;

    const baseClass = sidebar.classList[0];
    const hiddenClass = `${baseClass}--hidden`;
    //Hola mundo
    console.log("Iniciando sidebar");
    // Detectar si estamos en la página home
    const isHomePage = window.location.pathname.includes('/home');

    // Configurar estado inicial según la página
    if (isHomePage) {
        // En home: sidebar abierto
        sidebar.classList.remove(hiddenClass);
        contenedorContenido.classList.remove('bg-rojo');
        sidebarToggle.style.background = '#1E1E1E';
    } else {
        // En otras páginas: sidebar cerrado
        sidebar.classList.add(hiddenClass);
        contenedorContenido.classList.add('bg-rojo');
        sidebarToggle.style.background = 'var(--background-color)';
    }

    const iconHamburguesa = document.getElementById('sidebar-toggle-icon-hamburguesa');
    const iconX = document.getElementById('sidebar-toggle-icon-x');

    function updateSidebarToggleIcon() {
        const isHidden = sidebar.classList.contains(hiddenClass);
        if (iconHamburguesa && iconX) {
            if (isHidden) {
                iconHamburguesa.style.display = '';
                iconX.style.display = 'none';
            } else {
                iconHamburguesa.style.display = 'none';
                iconX.style.display = '';
            }
        }
    }

    sidebarToggle.addEventListener('click', () => {
        const oculto = sidebar.classList.toggle(hiddenClass);
        sidebarToggle.classList.add('bounce');
        setTimeout(() => sidebarToggle.classList.remove('bounce'), 350);
        if (oculto) {
            contenedorContenido.classList.add('bg-rojo');
            sidebarToggle.style.background = 'var(--background-color)';
        } else {
            contenedorContenido.classList.remove('bg-rojo');
            sidebarToggle.style.background = '#1E1E1E';
        }
        updateSidebarToggleIcon();
    });

    // Cerrar sidebar con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !sidebar.classList.contains(hiddenClass)) {
            sidebar.classList.add(hiddenClass);
            sidebarToggle.classList.add('bounce');
            setTimeout(() => sidebarToggle.classList.remove('bounce'), 350);
            contenedorContenido.classList.add('bg-rojo');
            sidebarToggle.style.background = 'var(--background-color)';
            updateSidebarToggleIcon();
        }
    });

    // Inicializar icono correcto al cargar
    updateSidebarToggleIcon();
}