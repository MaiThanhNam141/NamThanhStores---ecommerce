import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import {  ShoppingCart } from 'lucide-react';
import '../style/Order.css';

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

const OrderList = ({ orders }) => {
  return (
      <div className="order-list">
          {orders.length > 0 ? (
              orders.map((item) => (
                  <Link 
                      key={item.id} 
                      to={`/order-detail/${item.id}`} 
                      state={{ order: item }} 
                      className="order-item"
                  >
                      <p>Mã đơn hàng: {item.id}</p>
                      <p>Trạng thái: {translateStatus(item.embed_data.status)}</p>
                      <p>
                          Tổng tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.amount)}
                      </p>
                  </Link>
              ))
          ) : (
              <div className="empty-container">
                  <ShoppingCart size={50} color="red" />
                  <p className="empty-text">Bạn không có đơn hàng nào ở đây cả</p>
              </div>
          )}
      </div>
  );
};


const OrderedPanel = () => {
    const [allOrders, setAllOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const uid = auth.currentUser.uid;
                const ordersRef = collection(db, 'orders');
                const q = query(ordersRef, where('app_user', '==', uid));
                const querySnapshot = await getDocs(q);
                const orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllOrders(orders);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const filterOrdersByStatus = (status) => {
        return status === ''
            ? allOrders
            : allOrders.filter(order => order.embed_data?.status === status);
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="ordered-panel">
            <Tabs>
                <TabList>
                    <Tab>Tất cả đơn hàng</Tab>
                    <Tab>Đang chờ xác nhận</Tab>
                    <Tab>Đang chuẩn bị</Tab>
                    <Tab>Đang giao hàng</Tab>
                    <Tab>Giao thành công</Tab>
                    <Tab>Đã hủy</Tab>
                </TabList>

                <TabPanel>
                    <OrderList orders={filterOrdersByStatus('')} />
                </TabPanel>
                <TabPanel>
                    <OrderList orders={filterOrdersByStatus('Pending')} />
                </TabPanel>
                <TabPanel>
                    <OrderList orders={filterOrdersByStatus('Preparing')} />
                </TabPanel>
                <TabPanel>
                    <OrderList orders={filterOrdersByStatus('Shipping')} />
                </TabPanel>
                <TabPanel>
                    <OrderList orders={filterOrdersByStatus('Completed')} />
                </TabPanel>
                <TabPanel>
                    <OrderList orders={filterOrdersByStatus('Cancelled')} />
                </TabPanel>
            </Tabs>
        </div>
    );
};

export default OrderedPanel;

