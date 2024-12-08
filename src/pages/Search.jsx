import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from "../assets/logo.png";
import '../style/Search.css';

// Mock data for demonstration
const mockProducts = [
  { id: 1, name: "Áo thun nam", price: 150000, image: "https://example.com/aothun.jpg" },
  { id: 2, name: "Quần jean nữ", price: 350000, image: "https://example.com/quanjean.jpg" },
  { id: 3, name: "Giày thể thao", price: 500000, image: "https://example.com/giay.jpg" },
  // Add more mock products here
];

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulating API call with delay
    const fetchProducts = async () => {
      setLoading(true);
      // In a real application, you would make an API call here
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      const filteredProducts = mockProducts.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setProducts(filteredProducts);
      setLoading(false);
    };

    fetchProducts();
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="product-search-container">
      <div className="logo-container">
        <img src={Logo} alt="Company Logo" className="logo" />
      </div>
      <h1 className="page-title">Tìm kiếm sản phẩm</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Nhập tên sản phẩm..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>
      {loading ? (
        <p className="loading">Đang tải sản phẩm...</p>
      ) : (
        <div className="product-list">
          {products.length > 0 ? (
            products.map(product => (
              <div key={product.id} className="product-card">
                <img src={product.image} alt={product.name} className="product-image" />
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">{product.price.toLocaleString()} VND</p>
                <Link to={`/product/${product.id}`} className="view-product-btn">
                  Xem chi tiết
                </Link>
              </div>
            ))
          ) : (
            <p className="no-results">Không tìm thấy sản phẩm phù hợp.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
