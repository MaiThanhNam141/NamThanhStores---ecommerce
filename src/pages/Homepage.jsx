import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { getDocumentRef } from "../context/FirebaseFunction";
import "../style/Homepage.css"; // Import CSS

const Homepage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sliderImages, setSliderImages] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    const { addItemToCart } = useContext(CartContext);

    useEffect(() => {
        fetchProducts();
        fetchSliderImages();
    }, []);

    useEffect(() => {
        if (sliderImages.length > 0) {
            const interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
            }, 3000);

            return () => clearInterval(interval);
        }
    }, [sliderImages]);

    const fetchSliderImages = async () => {
        try {
            const snapshot = await getDocumentRef("SliderImages");
            if (snapshot) {
                const imageUrls = snapshot.map((image) => image.urlImages);
                setSliderImages(imageUrls);
            }
        } catch (error) {
            console.error("Error fetching slider images:", error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const snapshot = await getDocumentRef("productFood");
            if (snapshot) {
                setProducts(snapshot);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (item) => {
        addItemToCart(item);
        alert("Thêm thành công vào giỏ hàng");
    };

    return (
        <div className="home-screen">
            {/* Slider Section */}
            <div
                style={{
                    width: "80%",
                    height: "40vw",
                    overflow: "hidden",
                    position: "relative",
                }}
            >
                {sliderImages.length > 0 && (
                    <img
                        src={sliderImages[currentSlide]}
                        alt={`Slide ${currentSlide}`}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                    />
                )}
            </div>

            {/* Product Section */}
            <div style={{ padding: "20px" }}>
                <h2 style={{ color: "#333" }}>Danh sách sản phẩm</h2>
                {loading ? (
                    <p>Đang tải sản phẩm...</p>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "10px",
                        }}
                    >
                        {products.map((product) => (
                            <div
                                key={product.id}
                                style={{
                                    border: "1px solid #ddd",
                                    borderRadius: "8px",
                                    padding: "10px",
                                    width: "calc(25% - 10px)", // 4 cột
                                    backgroundColor: "#fff",
                                    height:'500px',
                                    alignItems:'center',
                                }}
                            >
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    style={{
                                        width: "100%",
                                        height: "60%",
                                        objectFit: "cover",
                                        borderRadius: "4px",
                                    }}
                                />
                                <h3 style={{ color: "#333", fontSize: "16px" }}>
                                    {product.name}
                                </h3>
                                <p style={{ color: "#333", marginBottom: "5px" }}>
                                    Giá: {product.price.toLocaleString()}đ
                                </p>
                                {product.discount > 0 && (
                                    <p style={{ color: "red" }}>
                                        Giảm giá: {product.discount}% - Giá còn:{" "}
                                        {(product.price * (1 - product.discount / 100)).toLocaleString()}
                                        đ
                                    </p>
                                )}
                                <button
                                    onClick={() => handleAddToCart(product)}
                                    style={{
                                        padding: "8px 16px",
                                        backgroundColor: "#007bff",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "4px",
                                        textAlign: 'center',
                                        cursor: "pointer",
                                    }}
                                >
                                    Thêm vào giỏ
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Homepage;
