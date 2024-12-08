import React, { createContext, useState, useEffect, useContext } from 'react';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);

    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        const loadCartItems = async () => {
            if (!currentUser) {
                console.warn("Người dùng chưa đăng nhập.");
                return;
            }

            const cartRef = collection(db, 'users', currentUser.uid, 'cart');

            try {
                const snapshot = await getDocs(cartRef);

                // Nếu giỏ hàng trống, khởi tạo subcollection với dữ liệu mặc định
                if (!snapshot.empty) {
                    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setCartItems(items);
                    setCartCount(items.reduce((total, item) => total + item.quantity, 0));
                }
            } catch (error) {
                console.error("Lỗi khi tải giỏ hàng:", error);
            }
        };

        loadCartItems();
    }, [currentUser]);

    const syncCartWithFirestore = async (items) => {
        if (!currentUser) {
            console.warn("Người dùng chưa đăng nhập.");
            return;
        }

        const cartRef = collection(db, 'users', currentUser.uid, 'cart');
        const batch = writeBatch(db);

        try {
            items.forEach(item => {
                const docRef = doc(cartRef, item.id);
                if (item.quantity > 0) {
                    batch.set(docRef, item);
                } else {
                    batch.delete(docRef);
                }
            });

            await batch.commit();
        } catch (error) {
            console.error("Lỗi khi đồng bộ giỏ hàng:", error);
        }
    };

    const addItemToCart = (item) => {
        const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
        let updatedCart;

        if (existingItem) {
            updatedCart = cartItems.map(cartItem =>
                cartItem.id === item.id
                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                    : cartItem
            );
        } else {
            updatedCart = [...cartItems, { ...item, quantity: 1 }];
        }

        setCartItems(updatedCart);
        setCartCount(cartCount + 1);
        syncCartWithFirestore(updatedCart);
    };

    const subtractItemFromCart = (itemId) => {
        const existingItem = cartItems.find(item => item.id === itemId);

        if (!existingItem) {
            console.warn(`Sản phẩm với ID ${itemId} không tồn tại trong giỏ hàng.`);
            return;
        }

        let updatedCart;
        if (existingItem.quantity > 1) {
            updatedCart = cartItems.map(item =>
                item.id === itemId
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            );
        } else {
            // Xóa sản phẩm khỏi giỏ hàng nếu số lượng giảm về 0
            updatedCart = cartItems.filter(item => item.id !== itemId);
        }

        setCartItems(updatedCart);
        setCartCount(updatedCart.reduce((total, item) => total + item.quantity, 0));
        syncCartWithFirestore(updatedCart);
    };

    const removeItemFromCart = (itemId) => {
        const updatedCart = cartItems.filter(item => item.id !== itemId);
        setCartItems(updatedCart);
        setCartCount(updatedCart.reduce((total, item) => total + item.quantity, 0));
        syncCartWithFirestore(updatedCart);
    };

    const clearCart = () => {
        setCartItems([]);
        setCartCount(0);
        syncCartWithFirestore([]);
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                cartCount,
                addItemToCart,
                removeItemFromCart,
                subtractItemFromCart,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
