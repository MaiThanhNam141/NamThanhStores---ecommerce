import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';
import emptyCart from '../assets/emptyCart.png';
import '../style/Cart.css';

const Cart = () => {
    const { cartItems, removeItemFromCart, clearCart, addItemToCart, subtractItemFromCart } = useContext(CartContext);
    const [selectedItems, setSelectedItems] = useState([]);

    // Group cart items and calculate quantities
    const groupedItems = cartItems.reduce((acc, item) => {
        const existingItem = acc.find((i) => i.id === item.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            acc.push({ ...item });
        }
        return acc;
    }, []);

    const handleIncreaseQuantity = (item) => {
        addItemToCart(item);
    };

    const handleDecreaseQuantity = (item) => {
        if (item.quantity > 1) {
            subtractItemFromCart(item.id);
        } else {
            removeItemFromCart(item.id);
        }
    };

    const toggleItemSelection = (item) => {
        setSelectedItems(prevItems => {
            const itemExists = prevItems.some(i => i.id === item.id);
            if (itemExists) {
                return prevItems.filter(i => i.id !== item.id);
            } else {
                return [...prevItems, { ...item, itemCount: item.quantity }];
            }
        });
    };

    const filteredItems = selectedItems.map(({ id, name, price, itemCount, image }) => ({
        id,
        name,
        price,
        itemCount,
        image
    }));

    const formatNumberWithDots = (number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const totalQuantity = selectedItems.reduce((acc, item) => acc + item.itemCount, 0);
    const totalPrice = selectedItems.reduce((acc, item) => acc + (item.price * item.itemCount), 0);
    
    return (
        <div className="cart-container">
            <h1 className="cart-title">Giỏ hàng</h1>
            {groupedItems.length > 0 && (
                <div className="cart-header">
                    <span>{selectedItems.length} sản phẩm được chọn</span>
                    <button onClick={clearCart} className="clear-cart-btn">Xóa giỏ hàng</button>
                </div>
            )}

            {groupedItems.length === 0 ? (
                <div className="empty-cart">
                    <p>Giỏ hàng trống...</p>
                    <img src={emptyCart} alt="Empty Cart" className="empty-cart-image" />
                    <Link to="/" className="continue-shopping-btn">Tiếp tục mua sắm</Link>
                </div>
            ) : (
                <div className="cart-items">
                    {groupedItems.map((item) => (
                        <div key={item.id} className="cart-item">
                            <input
                                type="checkbox"
                                checked={selectedItems.some(i => i.id === item.id)}
                                onChange={() => toggleItemSelection(item)}
                            />
                            <img src={item.image} alt={item.name} className="product-image" />
                            <div className="product-details">
                                <h3>{item.name}</h3>
                                <p>Đơn giá: {formatNumberWithDots(item.price)} vnđ</p>
                                <div className="quantity-controls">
                                    <button onClick={() => handleDecreaseQuantity(item)} className="quantity-btn">-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => handleIncreaseQuantity(item)} className="quantity-btn">+</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {groupedItems.length > 0 && selectedItems.length > 0 && (
                <div className="total-price-card">
                    <div className="total-price-item">
                        <span>Tổng số lượng:</span>
                        <span>{totalQuantity}</span>
                    </div>
                    <div className="total-price-item">
                        <span>Giá tiền:</span>
                        <span>{formatNumberWithDots(totalPrice)} vnđ</span>
                    </div>
                    <Link to="/payment" className="checkout-btn" state={{ selectedItems: filteredItems, totalPrice, totalQuantity }}>Thanh toán</Link>
                </div>
            )}
        </div>
    );
};

export default Cart;

