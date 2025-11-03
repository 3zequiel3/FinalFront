export const initBurgerMenu = () => {
    const burger = document.getElementById('navbar-burger');
    const links = document.getElementById('navbar-links');
    
    if (burger && links) {
        burger.addEventListener('click', function () {
            links.classList.toggle('navbar-links--open');
            burger.classList.toggle('open');
        });
        
        // Marcar como inicializado
        burger.classList.add('initialized');
    }

    const dropdown = document.querySelector('.navbar-dropdown-mobile');
    const dropdownToggle = dropdown?.querySelector('.dropdown-toggle') as HTMLButtonElement;

    if (dropdown && dropdownToggle) {
        dropdownToggle.addEventListener('click', function () {
            const isOpen = dropdown.classList.toggle('open');
            dropdownToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }
}