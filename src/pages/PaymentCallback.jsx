import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { db } from '../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import { ChevronLeft, Check } from 'lucide-react';
import loadingGif from '../assets/loading.gif';
import '../style/PaymentCallback.css';

const PaymentCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { clearCart } = useContext(CartContext);
    const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);
    const app_trans_id = location.state?.app_trans_id;

    useEffect(() => {
        if (!app_trans_id) {
            navigate('/');
            return;
        }

        const listenForPaymentStatus = (appTransId) => {
            const orderRef = doc(db, 'orders', appTransId);

            const unsubscribe = onSnapshot(orderRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const orderData = docSnapshot.data();
                    if (orderData && orderData.embed_data) {
                        setIsPaymentCompleted(true);
                        clearCart();
                    }
                }
            });

            return unsubscribe;
        };

        const unsubscribe = listenForPaymentStatus(app_trans_id);
        return () => unsubscribe();
    }, [app_trans_id, clearCart, navigate]);

    const goBackHome = () => {
        navigate('/', { replace: true });
    };

    return (
        <div className="payment-callback-container">
            <div className="payment-callback-header">
                <button onClick={goBackHome} className="back-button">
                    <ChevronLeft size={30} />
                </button>
                <h1>Thanh toán</h1>
            </div>
            <div className="payment-callback-content">
                {isPaymentCompleted ? (
                    <div className="success-container">
                        <Check size={80} color="#4CAF50" />
                        <p className="success-text">Thanh toán thành công!</p>
                        <button className="home-button" onClick={goBackHome}>
                            Quay về trang chính
                        </button>
                    </div>
                ) : (
                    <div className="loading-container">
                        <img src={loadingGif} alt="Loading" className="loading-img" />
                        <p className="loading-text">Đang xử lý thanh toán...</p>
                        <p className="loading-text">Bạn có thể thoát khỏi trang này</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentCallback;

