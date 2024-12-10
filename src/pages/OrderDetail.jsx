import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ShoppingCart, HourglassIcon as HourglassEmpty, Archive, ShipIcon as LocalShipping, CheckCircle, PhoneCallIcon as Call, Mail, Users, Star } from 'lucide-react';
import '../style/OrderDetail.css';

const translateStatus = (status) => {
  switch (status) {
    case "Pending":
      return "Đang chờ xác nhận";
    case "Preparing":
      return "Đang chuẩn bị";
    case "Shipping":
      return "Đang giao hàng";
    case "Completed":
      return "Hoàn thành";
    case "Cancelled":
      return "Đã hủy";
    default:
      return "Không xác định";
  }
};

const OrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [itemCheckout, setItemCheckout] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({});

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!order) {
        const orderDoc = await getDoc(doc(db, 'orders', id));
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() });
        } else {
          console.error("Order not found");
          navigate('/orders');
          return;
        }
      }
      
      const itemsPromises = order.item.map(item => 
        getDoc(doc(db, 'productFood', item.id))
      );
      const itemDocs = await Promise.all(itemsPromises);
      const items = itemDocs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItemCheckout(items);
      setLoading(false);
    };

    fetchOrderDetails();
  }, [id, order, navigate]);

  const handleCancelOrder = async () => {
    if (order.embed_data.status === "Pending" || order.embed_data.status === "Preparing") {
      try {
        const orderRef = doc(db, 'orders', order.id);
        await updateDoc(orderRef, {
          'embed_data.status': 'Cancelled'
        });
        setOrder({ ...order, embed_data: { ...order.embed_data, status: 'Cancelled' } });
        alert("Bạn đã hủy đơn hàng thành công.");
      } catch (error) {
        console.error("Error cancelling order:", error);
        alert("Có lỗi xảy ra khi hủy đơn hàng.");
      }
    } else {
      alert(`Bạn không thể hủy đơn hàng khi đơn hàng đang ở trạng thái ${translateStatus(order.embed_data.status)}.`);
    }
  };

  const handleCompleteOrder = async () => {
    if (order.embed_data.status === "Shipping") {
      try {
        const orderRef = doc(db, 'orders', order.id);
        await updateDoc(orderRef, {
          'embed_data.status': 'Completed'
        });
        setOrder({ ...order, embed_data: { ...order.embed_data, status: 'Completed' } });
        alert("Đơn hàng đã được đánh dấu là hoàn thành.");
      } catch (error) {
        console.error("Error completing order:", error);
        alert("Có lỗi xảy ra khi hoàn thành đơn hàng.");
      }
    } else {
      alert("Đã xảy ra lỗi nào đó");
    }
  };

  const handleRatingChange = async (itemId, star) => {
    try {
      setRatings(prevRatings => ({
        ...prevRatings,
        [itemId]: star,
      }));

      const itemRef = doc(db, 'productFood', itemId);
      const itemDoc = await getDoc(itemRef);
      const itemData = itemDoc.data();

      const currentRating = itemData.rate || 0;
      const currentRatingCount = itemData.rateCount || 0;

      const newRating = ((currentRating * currentRatingCount) + star) / (currentRatingCount + 1);
      const newRatingCount = currentRatingCount + 1;

      await updateDoc(itemRef, {
        rate: newRating.toFixed(1),
        rateCount: newRatingCount
      });

    } catch (error) {
      console.error("Error updating rating:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Quay lại
        </button>
        <h1>Chi tiết đơn hàng</h1>
      </div>
      <div className="order-detail-content">
        <div className="order-status-section">
          <h2>Trạng thái đơn hàng</h2>
          <div className={`status-container ${order.embed_data.status === "Cancelled" ? "cancelled" : ""}`}>
            <p className="status-text">{translateStatus(order.embed_data.status)}</p>
            <div className="icon-row">
              <HourglassEmpty className={["Pending", "Preparing", "Shipping", "Completed"].includes(order.embed_data.status) ? "active" : ""} />
              <div className={`line ${["Pending", "Preparing", "Shipping", "Completed"].includes(order.embed_data.status) ? "active" : ""}`} />
              <Archive className={["Preparing", "Shipping", "Completed"].includes(order.embed_data.status) ? "active" : ""} />
              <div className={`line ${["Preparing", "Shipping", "Completed"].includes(order.embed_data.status) ? "active" : ""}`} />
              <LocalShipping className={["Shipping", "Completed"].includes(order.embed_data.status) ? "active" : ""} />
              <div className={`line ${order.embed_data.status === "Completed" ? "active" : ""}`} />
              <CheckCircle className={order.embed_data.status === "Completed" ? "active" : ""} />
            </div>
          </div>
        </div>

        <div className="address-section">
          <h2>Địa chỉ giao hàng</h2>
          <p>{order.embed_data?.name} | {order.embed_data?.phone || 'Chưa có số điện thoại'}</p>
          <div className="address-area">
            <p>{order.embed_data?.address || "Chưa có thông tin về địa chỉ"}</p>
          </div>
        </div>

        <div className="order-items-section">
          <h2>Chi tiết đơn hàng</h2>
          {itemCheckout.map((item) => {
            const orderItem = order.item.find(o => o.id === item.id);
            return orderItem ? (
              <div key={item.id} className="order-item">
                <img src={item.image} alt={item.name} className="item-image" />
                <p className="item-name">{item.name}</p>
                <p className="item-quantity">x {orderItem.itemCount}</p>
                {order.embed_data.status === "Completed" && (
                  <div className="star-container">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        onClick={() => handleRatingChange(item.id, star)}
                        className={star <= (ratings[item.id] || 0) ? "active" : ""}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : null;
          })}
        </div>

        <div className="order-summary-section">
          <div className="summary-row">
            <span>Tổng số lượng đơn hàng</span>
            <span>{order.item.reduce((total, item) => total + item.itemCount, 0)}</span>
          </div>
          <div className="summary-row">
            <span>Ngày đặt</span>
            <span>{new Date(order.server_time).toLocaleString('vi-VN')}</span>
          </div>
          <div className="summary-row total">
            <span>Tổng tiền</span>
            <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.amount)}</span>
          </div>
        </div>

        <div className="notes-section">
          <h2>Ghi chú</h2>
          <textarea
            value={order.embed_data?.note || "Không có ghi chú nào cả..."}
            readOnly
          />
        </div>

        <div className="support-section">
          <h2>Cần hỗ trợ ?</h2>
          <a href="tel:0387142380" className="support-link"><Call /> Số điện thoại</a>
          <a href={`mailto:2024801030167@student.tdmu.edu.vn?subject=Yêu cầu hỗ trợ cho đơn hàng #${order.app_trans_id}`} className="support-link"><Mail /> Email</a>
          <a href="https://www.facebook.com/profile.php?id=100006771705823" target="_blank" rel="noopener noreferrer" className="support-link"><Users /> NamThanhStores Fanpage</a>
        </div>

        {(order.embed_data.status === "Pending" || order.embed_data.status === "Preparing") && (
          <button onClick={handleCancelOrder} className="cancel-button">
            Hủy đơn hàng
          </button>
        )}

        {order.embed_data.status === "Shipping" && (
          <button onClick={handleCompleteOrder} className="complete-button">
            Xác nhận đã nhận hàng
          </button>
        )}

        <div className="refund-policy">
          <a href="/refund-policy">Chính sách hoàn tiền của NamThanhStores</a>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
