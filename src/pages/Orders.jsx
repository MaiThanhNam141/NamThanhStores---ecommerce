import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import Logo from "../assets/logo.png";
import '../style/Order.css';

// Mock data for demonstration
const mockOrders = [
  {
    id: '241031_808711',
    amount: 1000000,
    app_trans_id: "241031_808711",
    app_user: "22IzlKFY9Jbmn7nhArGxCplKVXb2",
    embed_data: {
      address: "Hà nội",
      email: "supernanocheat@gmail.com",
      name: "Mai Thành Nam",
      phone: 123456789,
      status: "Cancelled"
    },
    item: [
      {
        id: "0QiYcN7NeK2pBPRRivh3",
        itemCount: 1
      }
    ],
    server_time: 1730338969219
  },
  // Add more mock orders with different statuses here
];

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating API call
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  const orderStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderOrderCard = (order) => (
    <div key={order.id} className="order-card">
      <h3 className="order-id">Đơn hàng #{order.app_trans_id}</h3>
      <p className="order-amount">Tổng tiền: {order.amount.toLocaleString()} VND</p>
      <p className="order-date">Ngày đặt: {formatDate(order.server_time)}</p>
      <div className="order-details">
        <p><strong>Tên:</strong> {order.embed_data.name}</p>
        <p><strong>Email:</strong> {order.embed_data.email}</p>
        <p><strong>Số điện thoại:</strong> {order.embed_data.phone}</p>
        <p><strong>Địa chỉ:</strong> {order.embed_data.address}</p>
      </div>
      <p className="order-status">Trạng thái: {order.embed_data.status}</p>
      <button className="view-details-btn">Xem chi tiết</button>
    </div>
  );

  return (
    <div className="order-container">
      <div className="logo-container">
        <img src={Logo} alt="Company Logo" className="logo" />
      </div>
      <h1 className="page-title">Đơn hàng của bạn</h1>
      {loading ? (
        <p className="loading">Đang tải đơn hàng...</p>
      ) : (
        <Tab.Group>
          <Tab.List className="tab-list">
            {orderStatuses.map((status) => (
              <Tab
                key={status}
                className={({ selected }) =>
                  `tab ${selected ? 'tab-selected' : ''}`
                }
              >
                {status}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            {orderStatuses.map((status) => (
              <Tab.Panel key={status}>
                <div className="order-list">
                  {orders
                    .filter((order) => order.embed_data.status === status)
                    .map(renderOrderCard)}
                </div>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      )}
    </div>
  );
};

export default Order;
