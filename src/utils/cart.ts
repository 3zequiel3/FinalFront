// Interfaz para los items del carrito
export interface ICartItem {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen: string | null;
    cantidad: number;
    categoria?: string;
}

const CART_KEY = 'shopping_cart';

/**
 * Obtiene todos los items del carrito desde localStorage
 */
export const getCartItems = (): ICartItem[] => {
    const cartData = localStorage.getItem(CART_KEY);
    return cartData ? JSON.parse(cartData) : [];
};

/**
 * Guarda los items del carrito en localStorage
 */
export const saveCartItems = (items: ICartItem[]): void => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
};

/**
 * Agrega un producto al carrito
 * Si el producto ya existe, aumenta la cantidad
 */
export const addToCart = (item: ICartItem): void => {
    const cart = getCartItems();
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex !== -1) {
        // Si el producto ya existe, aumentar la cantidad
        cart[existingItemIndex].cantidad += item.cantidad;
    } else {
        // Si es nuevo, agregarlo
        cart.push(item);
    }
    
    saveCartItems(cart);
    updateCartBadge();
    console.log('Producto agregado al carrito:', item);
};

/**
 * Elimina un producto del carrito por su ID
 */
export const removeFromCart = (productId: number): void => {
    const cart = getCartItems();
    const updatedCart = cart.filter(item => item.id !== productId);
    saveCartItems(updatedCart);
    updateCartBadge();
};

/**
 * Actualiza la cantidad de un producto en el carrito
 */
export const updateCartItemQuantity = (productId: number, quantity: number): void => {
    const cart = getCartItems();
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            cart[itemIndex].cantidad = quantity;
            saveCartItems(cart);
        }
    }
    updateCartBadge();
};

/**
 * Vacía completamente el carrito
 */
export const clearCart = (): void => {
    localStorage.removeItem(CART_KEY);
    updateCartBadge();
};

/**
 * Obtiene el total de items en el carrito
 */
export const getCartItemCount = (): number => {
    const cart = getCartItems();
    return cart.reduce((total, item) => total + item.cantidad, 0);
};

/**
 * Calcula el subtotal del carrito
 */
export const getCartSubtotal = (): number => {
    const cart = getCartItems();
    return cart.reduce((total, item) => total + (item.precio * item.cantidad), 0);
};

/**
 * Calcula el total del carrito (subtotal + envío)
 */
export const getCartTotal = (shippingCost: number = 500): number => {
    return getCartSubtotal() + shippingCost;
};

/**
 * Actualiza el badge del carrito en el navbar
 */
export const updateCartBadge = (): void => {
    const badge = document.querySelector('.cart-badge') as HTMLElement;
    if (badge) {
        const count = getCartItemCount();
        badge.textContent = count.toString();
        
        // Agregar animación de "pop" cuando cambia
        badge.style.transform = 'scale(1.3)';
        setTimeout(() => {
            badge.style.transform = 'scale(1)';
        }, 200);
    }
};

/**
 * Formatea un número como precio en pesos Argentinos
 */
export const formatPrice = (price: number): string => {
    return `$${price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
