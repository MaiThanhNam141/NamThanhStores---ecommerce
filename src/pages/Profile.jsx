import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";
import Logo from "../assets/logo.png";
import Swal from 'sweetalert2';
import loadingGif from '../assets/loading.gif';
import '../style/Profile.css'

const Profile = () => {
    const { currentUser, dispatch } = useContext(AuthContext);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const handleSignOut = async () => {
        setLoading(true);
        Swal.fire({
            title: 'Đang đăng xuất...',
            html: `<img src="${loadingGif}" alt="Loading" style="width: 350px; height: 150px;" />`,
            showConfirmButton: false,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            await signOut(auth);
            dispatch({ type: "LOGOUT" });
            Swal.fire({
                title: 'Đăng xuất thành công!',
                icon: 'success',
                confirmButtonText: 'OK',
            });
            navigate("/login");
        } catch (error) {
            console.error("Logout error: ", error);
            Swal.fire({
                title: 'Đăng xuất thất bại!',
                text: 'Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTrackOrder = () => {
        // Implement order tracking functionality
        console.log("Track order clicked");
    };

    const handleUpdateProfile = () => {
        // Implement profile update functionality
        console.log("Update profile clicked");
    };

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="logo-container">
                    <img src={Logo} alt="Company Logo" className="logo" />
                </div>
                <h1 className="profile-title">Thông tin cá nhân</h1>
                <div className="user-avatar">
                    <img src={currentUser?.photoURL || 'default-avatar.png'} alt="User Avatar" />
                </div>
                <div className="user-info">
                    <p><strong>Email:</strong> {currentUser?.email}</p>
                    <p><strong>Tên hiển thị:</strong> {currentUser?.displayName || 'Chưa cập nhật'}</p>
                    <p><strong>Tên:</strong> {currentUser?.name || 'Chưa cập nhật'}</p>
                    <p><strong>Số điện thoại:</strong> {currentUser?.phone || 'Chưa cập nhật'}</p>
                    <p><strong>Địa chỉ:</strong> {currentUser?.address || 'Chưa cập nhật'}</p>
                </div>
                <div className="button-group">
                    <button onClick={handleTrackOrder} className="profile-button">
                        Theo dõi đơn hàng
                    </button>
                    <button onClick={handleUpdateProfile} className="profile-button">
                        Cập nhật thông tin
                    </button>
                    <button onClick={handleSignOut} className="profile-button logout-button">
                        Đăng xuất
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
