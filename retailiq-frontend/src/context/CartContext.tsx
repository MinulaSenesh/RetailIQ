import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/types";

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, quantity: number) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    totalAmount: number;
    itemCount: number;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        const saved = localStorage.getItem("retailiq_cart");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem("retailiq_cart", JSON.stringify(items));
    }, [items]);

    const addToCart = (product: Product, quantity: number) => {
        setItems(current => {
            const existing = current.find(item => item.product.productId === product.productId);
            if (existing) {
                return current.map(item =>
                    item.product.productId === product.productId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...current, { product, quantity }];
        });
    };

    const removeFromCart = (productId: number) => {
        setItems(current => current.filter(item => item.product.productId !== productId));
    };

    const updateQuantity = (productId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setItems(current =>
            current.map(item =>
                item.product.productId === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => setItems([]);

    const totalAmount = items.reduce((sum, item) => sum + (item.product.unitPrice * item.quantity), 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount, itemCount }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
