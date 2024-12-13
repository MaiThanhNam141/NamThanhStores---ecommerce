import React, { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { ChevronLeft, Star } from 'lucide-react';
import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import '../style/DetailScreen.css';

const DetailScreen = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedItem } = location.state || {};
    const { addItemToCart } = useContext(CartContext);
    const [commentInput, setCommentInput] = useState('');
    const [comments, setComments] = useState([]);
    const [userDataMap, setUserDataMap] = useState({});
    const [loading, setLoading] = useState(true);

    const handleAddToCart = () => {
        addItemToCart(selectedItem);
        alert("Thêm thành công");
    };

    const formatNumberWithDots = (number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const fetchUserData = async (userId) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                return userDoc.data();
            } else {
                console.log("Người dùng không tồn tại:", userId);
            }
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu user:", error);
        }
        return null;
    };

    useEffect(() => {
        const fetchCommentsUsers = async () => {
            try {
                const userMap = { ...userDataMap };
                const promises = comments.map(async (item) => {
                    const userId = item.user.id;
                    if (!userMap[userId]) {
                        const userData = await fetchUserData(userId);
                        userMap[userId] = userData;
                    }
                });
                await Promise.all(promises);

                setUserDataMap(userMap);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        const fetchComments = async () => {
            if (!selectedItem?.id) return;

            try {
                setLoading(true);

                const productDoc = await getDoc(doc(db, "productFood", selectedItem.id));
                if (productDoc.exists()) {
                    const productData = productDoc.data();
                    setComments(productData.comments || []);
                } else {
                    console.error("Sản phẩm không tồn tại");
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu comments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
        fetchCommentsUsers();
    }, []);

    const handleSendComment = async () => {
        setLoading(true);
        try {
            if (commentInput.trim().length >= 5) {
                if (!auth.currentUser) {
                    if (window.confirm('Bạn cần đăng nhập để bình luận. Bạn có muốn đăng nhập không?')) {
                        navigate('/login');
                    }
                    setLoading(false);
                    return;
                }

                const newComment = {
                    user: doc(db, 'users', auth.currentUser.uid),
                    contentComment: commentInput,
                    date: Timestamp.now(),
                };

                setComments((prev) => [
                    ...prev,
                    newComment,
                ])

                await updateDoc(doc(db, 'productFood', selectedItem.id), {
                    comments: arrayUnion(newComment),
                });

                setCommentInput('');
                alert("Bình luận thành công");

                // Refetch comments
                const productDoc = await getDoc(doc(db, "productFood", selectedItem.id));
                if (productDoc.exists()) {
                    const productData = productDoc.data();
                    setComments(productData.comments || []);
                }
            } else {
                alert("Bình luận quá ngắn");
            }
        } catch (error) {
            console.error("Lỗi khi bình luận: ", error);
            alert("Bình luận thất bại");
        } finally {
            setLoading(false);
        }
    };


    if (!selectedItem) {
        return <div>Loading...</div>;
    }

    return (
        <div className="detail-screen">
            <div className="header">
                <button onClick={() => navigate(-1)} className="back-button">
                    <ChevronLeft size={30} />
                </button>
                <h1>Chi tiết sản phẩm</h1>
            </div>
            <div className="container">
                <img src={selectedItem.image} alt={selectedItem.name} className="product-image" />
                <h2 className="product-name">{selectedItem.name}</h2>
                {selectedItem.discount > 0 ? (
                    <div className="price-container">
                        <span className="old-price">
                            {formatNumberWithDots(selectedItem.price)} VND
                        </span>
                        <span className="discounted-price">
                            {formatNumberWithDots(selectedItem.price * (1 - selectedItem.discount / 100))} VND
                        </span>
                    </div>
                ) : (
                    <p className="price">{formatNumberWithDots(selectedItem.price)} VND</p>
                )}
                <p className="rating-text">Đánh giá: {selectedItem.rate}/5 <Star size={16} fill="#FFA500" color="#FFA500" /></p>
                <p className="rating-text">Tổng số lượt đánh giá: {selectedItem.rateCount}</p>
                <p className="description">{selectedItem.desc}</p>

                <div className="details-container">
                    <p className="detail">Loại: {selectedItem.type}</p>
                    <p className="detail">Đối tượng: {selectedItem.target}</p>
                    <p className="detail">Mục tiêu: {selectedItem.goal}</p>
                    <p className="detail">Khối lượng tịnh: {selectedItem.netWeight} kg</p>
                    <p className="detail">Số lượng tồn kho: {selectedItem.quatity}</p>
                </div>
                <div className="comment-section">
                    <h3>Bình luận</h3>
                    {loading ? (
                        <div className="loading">Đang tải dữ liệu bình luận...</div>
                    ) : comments.length > 0 ? (
                        <div className="comment-list">
                            {comments.map((item, index) => {
                                const userId = item.user.id;
                                const user = userDataMap[userId];
                                const defaultAvatar = "https://imgs.search.brave.com/XiXv5coz4nZmkXewWH22TlENSx4FtG0y5KgNxSEGH0Y/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/dmVjdG9yc3RvY2su/Y29tL2kvcHJldmll/dy0xeC81NS82Ny9u/by1pbWFnZS1hdmFp/bGFibGUtcGljdHVy/ZS12ZWN0b3ItMzE1/OTU1NjcuanBn";

                                return (
                                    <div key={index} className="comment-item">
                                        <img
                                            src={user?.photoURL || defaultAvatar} // Sử dụng ảnh từ userData hoặc ảnh mặc định
                                            alt="User"
                                            className="comment-photo"
                                            onError={(e) => e.target.src = defaultAvatar} // Nếu ảnh không tải được, sử dụng ảnh mặc định
                                        />
                                        <div className="comment-content">
                                            <p className="comment-display-name">
                                                {user?.name || user?.displayName}
                                            </p>
                                            <p className="comment-text">
                                                {item.contentComment}
                                            </p>
                                            <p className="comment-date">
                                                {item.date ? new Date(item.date.seconds * 1000).toLocaleString() : "Ngày hiển thị"}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="no-comment-text">Chưa có bình luận nào.</p>
                    )}
                    <textarea
                        className="comment-input"
                        placeholder="Viết bình luận..."
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        className="submit-comment-button"
                        onClick={handleSendComment}
                        disabled={loading || commentInput.trim().length < 5}
                    >
                        {loading ? "Đang gửi..." : "Gửi bình luận"}
                    </button>
                </div>

                <button className="add-to-cart-button" onClick={handleAddToCart}>
                    Thêm vào giỏ hàng
                </button>
            </div>
        </div>
    );
};

export default DetailScreen;

