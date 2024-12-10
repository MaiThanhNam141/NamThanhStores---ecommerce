import { useContext } from 'react';
import { Navigate, Route, Routes, BrowserRouter } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Homepage from './pages/Homepage.jsx';
import Chat from './pages/Chat.jsx';
import Product from './pages/Products.jsx';
import Orders from './pages/Orders.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';
import Search from './pages/Search.jsx';
import Cart from './pages/Cart.jsx'

import { AuthContext } from './context/AuthContext.jsx';
import Payment from './pages/Payment.jsx';
import PaymentCallback from './pages/PaymentCallback.jsx';

function App() {
  const { currentUser } = useContext(AuthContext);

  const RequireAuth = ({ children }) => {
    return currentUser ? children : <Navigate to="/login" />;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>}>
          <Route index element={<Homepage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="orders" element={<Orders />} />
          <Route path="order-detail/:id" element={<OrderDetail />} />
          <Route path="products" element={<Product />} />
          <Route path="support" element={<Chat />} />
          <Route path='search' element={<Search />} />
          <Route path='cart' element={<Cart />} />
          <Route path='payment' element={<Payment />} />
          <Route path='payment-callback' element={<PaymentCallback />} />
        </Route>
        
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
