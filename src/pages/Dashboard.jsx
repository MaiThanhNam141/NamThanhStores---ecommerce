import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Link, Outlet } from 'react-router-dom';
import Logo from "../assets/logo.png";
import Sidebar from '../component/Sidebar';
import { auth } from "../firebase/config"
import { signOut } from '@firebase/auth';
import '../style/Login.css'

const Dashboard = () => {
  const { currentUser, dispatch } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch({ type: "LOGOUT" });
      console.log("Done");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ display: 'flex', backgroundColor: '#f7f7f7', color: '#F9FAFB', overflow: 'hidden', paddingTop: '2px' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: '3px' }}>
        {/* Navbar */}
        <div style={{ width: '100%', backgroundColor: '#DEFFD3', color: '#3E3E3E', height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', borderRadius: 5 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <img src={Logo} alt="Logo" style={{ height: '2.5rem' }} />
              <span style={{ marginLeft: '1rem', fontSize: '1.125rem', fontWeight: 'bold' }}>Trang chủ</span>
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            {currentUser && (
              <>
                <Link to="/cart">
                  🛒 <span style={{ backgroundColor: '#ff4500', color: '#000', borderRadius: '50%', padding: '2px 6px', fontSize: '12px',  position: 'relative',top: '-10px', left: '-5px' }}>{cartCount}</span>
                </Link>
                <span style={{ padding: '10px 20px' }}>{currentUser.email}</span>
                <button
                  onClick={handleLogout}
                  class="btn"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#87bc9d',
                    border: '1px solid #87bc9d',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                }}
                >
                  Đăng xuất
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '1.5rem', backgroundColor: '#f7f7f7', height: '100vh' }}>
          <Outlet /> {/* This will render the nested routes */}
        </div>
      </div>
    </div >
  );
};

export default Dashboard;
