import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import '../style/Payment.css';
import Swal from 'sweetalert2';

const MySwal = Swal.mixin({
    customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
    },
    buttonsStyling: false,
    width: '600px', 
});

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedItems, totalPrice, totalQuantity } = location.state || {};
    const { currentUser } = useContext(AuthContext);
    const { clearCart } = useContext(CartContext);

    const [user, setUser] = useState(currentUser);
    const [itemCheckout, setItemCheckout] = useState(selectedItems);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('zalo');
    const [provinces, setProvinces] = useState([]);

    const shippingFee = paymentMethod === 'cash' ? 10000 : 0;
    const totalAmount = totalPrice + shippingFee;

    useEffect(() => {
        if (!selectedItems || !totalPrice || !totalQuantity) {
            navigate('/cart');
            return;
        }

        fetchProvinces();
    }, [currentUser, navigate, selectedItems, totalPrice, totalQuantity]);

    const fetchProvinces = async () => {
        try {
            const response = await fetch('https://provinces.open-api.vn/api/p/');
            const data = await response.json();
            setProvinces(data);
        } catch (error) {
            console.error('Error fetching provinces:', error);
        }
    };

    const fetchDistricts = async (provinceCode) => {
        try {
            const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            const data = await response.json();
            return data.districts;
        } catch (error) {
            console.error('Error fetching districts:', error);
            return [];
        }
    };

    const fetchWards = async (districtCode) => {
        try {
            const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            const data = await response.json();
            return data.wards;
        } catch (error) {
            console.error('Error fetching wards:', error);
            return [];
        }
    };

    const validatePhoneNumber = (phone) => {
        const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
        return phoneRegex.test(phone);
    };

    const handleAddressInput = async () => {
        const { value: formValues } = await MySwal.fire({
            title: 'Nhập thông tin giao hàng',
            html: `
            <div style="text-align: left;">
                <label for="swal-name" style="display: block; margin-bottom: 5px;">Họ và Tên</label>
                <input id="swal-name" class="swal2-input" placeholder="Nhập họ và tên" style="width: 95%; margin-bottom: 15px; margin-left: 15px;">
                
                <label for="swal-phone" style="display: block; margin-bottom: 5px;">Số điện thoại</label>
                <input id="swal-phone" class="swal2-input" placeholder="Nhập số điện thoại" style="width: 95%; margin-bottom: 15px; margin-left: 15px;">
                
                <label for="swal-province" style="display: block; margin-bottom: 5px;">Tỉnh</label>
                <select id="swal-province" class="swal2-select" style="width: 95%; margin-bottom: 15px; margin-left: 15px;">
                    <option value="">Chọn tỉnh</option>
                </select>
                
                <label for="swal-district" style="display: block; margin-bottom: 5px;">Quận/Huyện</label>
                <select id="swal-district" class="swal2-select" style="width: 95%; margin-bottom: 15px; margin-left: 15px;" disabled>
                    <option value="">Chọn quận/huyện</option>
                </select>
                
                <label for="swal-ward" style="display: block; margin-bottom: 5px;">Phường/Xã</label>
                <select id="swal-ward" class="swal2-select" style="width: 95%; margin-bottom: 15px; margin-left: 15px;" disabled>
                    <option value="">Chọn phường/xã</option>
                </select>
                
                <label for="swal-address" style="display: block; margin-bottom: 5px;">Địa chỉ chi tiết</label>
                <textarea id="swal-address" class="swal2-textarea" placeholder="Nhập số nhà, tên đường" style="width: 95%; margin-left: 15px;"></textarea>
            </div>
            `,
            focusConfirm: false,
            didOpen: () => {
                const provinceSelect = document.getElementById('swal-province');
                const districtSelect = document.getElementById('swal-district');
                const wardSelect = document.getElementById('swal-ward');

                provinces.forEach(province => {
                    const option = document.createElement('option');
                    option.value = province.code;
                    option.textContent = province.name;
                    provinceSelect.appendChild(option);
                });

                provinceSelect.addEventListener('change', async (e) => {
                    districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
                    wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
                    districtSelect.disabled = false;
                    wardSelect.disabled = true;

                    const districts = await fetchDistricts(e.target.value);
                    districts.forEach(district => {
                        const option = document.createElement('option');
                        option.value = district.code;
                        option.textContent = district.name;
                        districtSelect.appendChild(option);
                    });
                });

                districtSelect.addEventListener('change', async (e) => {
                    wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
                    wardSelect.disabled = false;

                    const wards = await fetchWards(e.target.value);
                    wards.forEach(ward => {
                        const option = document.createElement('option');
                        option.value = ward.code;
                        option.textContent = ward.name;
                        wardSelect.appendChild(option);
                    });
                });
            },
            preConfirm: () => {
                const name = document.getElementById('swal-name').value;
                const phone = document.getElementById('swal-phone').value;
                const province = document.getElementById('swal-province').options[document.getElementById('swal-province').selectedIndex].text;
                const district = document.getElementById('swal-district').options[document.getElementById('swal-district').selectedIndex].text;
                const ward = document.getElementById('swal-ward').options[document.getElementById('swal-ward').selectedIndex].text;
                const addressDetail = document.getElementById('swal-address').value;

                if (!name || !phone || !province || !district || !ward || !addressDetail) {
                    Swal.showValidationMessage('Vui lòng điền đầy đủ thông tin');
                    return false;
                }

                if (!validatePhoneNumber(phone)) {
                    Swal.showValidationMessage('Số điện thoại không hợp lệ');
                    return false;
                }

                return { name, phone, province, district, ward, addressDetail };
            }
        });

        if (formValues) {
            const { name, phone, province, district, ward, addressDetail } = formValues;
            const fullAddress = `${addressDetail}, ${ward}, ${district}, ${province}`;
            setUser(prevUser => ({
                ...prevUser,
                name,
                phone,
                address: fullAddress
            }));
        }
    };

    const handlePayment = async () => {
        if (!user?.name || !user?.phone || !user?.address || !itemCheckout || !selectedItems || !totalAmount || !totalQuantity) {
            alert("Vui lòng cung cấp đầy đủ thông tin trước khi thanh toán!");
            return;
        }

        try {
            setLoading(true);
            const firebaseFunctionURL = 'https://us-central1-namthanhstores.cloudfunctions.net/createPayment';
            const response = await fetch(firebaseFunctionURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: totalAmount,
                    items: selectedItems,
                    email: user.email,
                    address: user.address,
                    name: user.name,
                    phone: user.phone,
                    note: note || 'Không có ghi chú',
                    userid: user.uid,
                })
            });

            const responseData = await response.json();

            if (response.ok && responseData?.order_url) {
                window.open(responseData.order_url, '_blank');
                clearCart();
                navigate('/payment-callback', { state: { app_trans_id: responseData.app_trans_id } });
            } else {
                console.error("Error creating payment:", responseData);
                alert("Không thể tạo đơn hàng. Vui lòng thử lại!");
            }
        } catch (error) {
            console.error("Error handling payment:", error);
            alert("Đã xảy ra lỗi khi xử lý thanh toán!");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="payment-container">
            <div className="payment-header">
                <button onClick={() => navigate(-1)} className="back-button">
                    ← Quay lại
                </button>
                <h1>Xác nhận đơn hàng</h1>
            </div>
            <div className="payment-content">
                <div className="address-section">
                    <h2>Địa chỉ giao hàng</h2>
                    <p>{user?.name || "Tên người dùng"} | {user?.phone || 'Chưa có số điện thoại'}</p>
                    <div className="address-area" onClick={handleAddressInput}>
                        <p>{user?.address || "Chưa có thông tin về địa chỉ"}</p>
                    </div>
                </div>
                <div className="order-details">
                    <h2>Chi tiết đơn hàng</h2>
                    {itemCheckout.map((item) => (
                        <div key={item.id} className="order-item">
                            <img src={item.image} alt={item.name} className="item-image" />
                            <p className="item-name">{item.name}</p>
                            <p className="item-quantity">x {item.itemCount}</p>
                        </div>
                    ))}
                </div>
                <div className="order-summary">
                    <div className="summary-row">
                        <span>Tổng số lượng đơn hàng</span>
                        <span>{totalQuantity}</span>
                    </div>
                    <div className="summary-row">
                        <span>Giá trị đơn hàng</span>
                        <span>{formatCurrency(totalPrice)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Phí vận chuyển</span>
                        <span>{formatCurrency(shippingFee)}</span>
                    </div>
                    <div className="summary-row total">
                        <span>Tổng tiền cần thanh toán</span>
                        <span>{formatCurrency(totalAmount)}</span>
                    </div>
                    {paymentMethod === 'cash' && (
                        <p className="shipping-note">* Sẽ phụ thu phí ship 10.000đ khi chọn phương thức thanh toán bằng tiền mặt.</p>
                    )}
                </div>
                <div className="notes-section">
                    <h2>Ghi chú</h2>
                    <textarea
                        placeholder="Nhập ghi chú cho đơn hàng của bạn..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>
                <div className="payment-method">
                    <h2>Phương thức thanh toán</h2>
                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                        <option value="zalo">Trả trước bằng Zalo</option>
                        <option value="cash">Tiền mặt</option>
                    </select>
                </div>
                <button className="payment-button" onClick={handlePayment} disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Thanh toán'}
                </button>
            </div>
        </div>
    );
};

export default Payment;

