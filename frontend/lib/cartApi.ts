// API service with authentication
const API_BASE_URL = "http://localhost:8000";

export interface CartItem {
    id: number;
    quantity: number;
    product_variant: any;
    product: any;
    product_image: any;
}

export interface AddToCartRequest {
    product_variant_id: number;
    quantity: number;
}

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
}

/**
 * Get Authorization header with Bearer token
 */
function getAuthHeader(): Record<string, string> {
    const token = getAuthToken();
    if (!token) {
        throw new Error("Not authenticated");
    }
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
    };
}

/**
 * GET /api/carts - Fetch user's cart items
 */
export async function fetchCart(): Promise<CartItem[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/carts`, {
            method: "GET",
            headers: getAuthHeader(),
            cache: "no-store",
        });

        if (response.status === 401) {
            throw new Error("Unauthorized - please login");
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch cart: ${response.statusText}`);
        }

        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error("Error fetching cart:", error);
        throw error;
    }
}

/**
 * GET /carts/count - Fetch total cart item count
 */
export async function fetchCartCount(): Promise<number> {
    try {
        const token = getAuthToken();
        if (!token) return 0;

        const response = await fetch(`${API_BASE_URL}/carts/count`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (!response.ok) return 0;

        const data = await response.json();
        return data.count || 0;
    } catch (error) {
        console.error("Error fetching cart count:", error);
        return 0;
    }
}

/**
 * POST /api/carts - Add item to cart
 */
export async function addToCart(request: AddToCartRequest): Promise<{
    message: string;
    item: any;
}> {
    try {
        const response = await fetch(`${API_BASE_URL}/carts`, {
            method: "POST",
            headers: getAuthHeader(),
            body: JSON.stringify(request),
        });

        if (response.status === 401) {
            throw new Error("Unauthorized - please login");
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to add to cart: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error adding to cart:", error);
        throw error;
    }
}

/**
 * PUT /api/carts/:id - Update cart item quantity
 */
export async function updateCartItem(cartItemId: number, quantity: number): Promise<{
    message: string;
    item: any;
}> {
    try {
        const response = await fetch(`${API_BASE_URL}/carts/${cartItemId}`, {
            method: "PUT",
            headers: getAuthHeader(),
            body: JSON.stringify({ quantity }),
        });

        if (response.status === 401) {
            throw new Error("Unauthorized - please login");
        }

        if (!response.ok) {
            throw new Error(`Failed to update cart: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error updating cart:", error);
        throw error;
    }
}

/**
 * DELETE /api/carts/:id - Remove item from cart
 */
export async function removeFromCart(cartItemId: number): Promise<{
    message: string;
}> {
    try {
        const response = await fetch(`${API_BASE_URL}/carts/${cartItemId}`, {
            method: "DELETE",
            headers: getAuthHeader(),
        });

        if (response.status === 401) {
            throw new Error("Unauthorized - please login");
        }

        if (!response.ok) {
            throw new Error(`Failed to remove from cart: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error removing from cart:", error);
        throw error;
    }
}

export function isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
}
