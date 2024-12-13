import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, where, orderBy, limit, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Search } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import '../style/SearchScreen.css';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [titleResults, setTitleResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedType, setSelectedType] = useState('a');
  const [selectedImage, setSelectedImage] = useState(null);

  const navigate = useNavigate();
  const { addItemToCart } = useContext(CartContext);

  const handleSearch = (searchTerm) => {
    setSearchQuery(searchTerm);
    if (!searchTerm.trim() || searchTerm.length < 3) {
      setTitleResults([]);
      return;
    }
    searchFirebase(searchTerm);
  };


  const formatNumberWithDots = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleDetailScreen = (product) => {
    const simplifiedProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      discount: product.discount,
      desc: product.desc,
      rate: product.rate,
      rateCount: product.rateCount,
      type: product.type,
      target: product.target,
      goal: product.goal,
      netWeight: product.netWeight,
      quatity: product.quatity,
  };
    navigate('/detail', { state: { selectedItem: simplifiedProduct } });
  };

  const handleImagePress = (imageUri) => {
    setSelectedImage(imageUri);
  };

  const handleAddToCart = (item) => {
    addItemToCart(item);
    alert("Thêm thành công");
  };

  const searchFirebase = async (searchTerm) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'productFood'),
        orderBy('name'),
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff'), 
      );

      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTitleResults(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (selectedType === "a") {
      setFilteredResults(titleResults);
    } else {
      setFilteredResults(titleResults.filter(item => item.animal === selectedType));
    }
  }, [selectedType, titleResults]);

  const renderProduct = (item) => {
    const isDiscount = item.discount > 0;

    return (
      <div key={item.id} className="product-container">
        {isDiscount && <span className="sale">Sale {item.discount}%</span>}
        <img
          src={item.image}
          alt={item.name}
          className="product-image"
          onClick={() => handleImagePress(item.image)}
        />
        <h3 className="product-name" onClick={() => handleDetailScreen(item)}>{item.name}</h3>
        <button className="price-button" onClick={() => handleAddToCart(item)}>
          {isDiscount ? (
            <div className="price-container">
              <span className="original-price">{formatNumberWithDots(item.price)}</span>
              <span className="discount-price">
                {formatNumberWithDots(Math.floor(item.price * (1 - item.discount / 100)))} VND
              </span>
            </div>
          ) : (
            <span className="product-price">{formatNumberWithDots(item.price)} VND</span>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="search-screen">
      <div className="search-bar">
        <Search size={24} />
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      <div className="filter-container">
        <label htmlFor="animal-filter" className="filter-label">Lọc theo đối tượng chăn nuôi</label>
        <select
          id="animal-filter"
          className="filter-select"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="a">Tất cả</option>
          <option value="Bò">Bò</option>
          <option value="Gà">Gà</option>
          <option value="Heo">Heo</option>
          <option value="Dê">Dê</option>
          <option value="Cá">Cá</option>
        </select>
      </div>
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="product-grid">
          {(selectedType === "a" ? titleResults : filteredResults).map(renderProduct)}
        </div>
      )}
      {titleResults.length === 0 && !loading && (
        <p className="empty-text">Không có kết quả</p>
      )}
      {selectedImage && (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Selected product" />
        </div>
      )}
    </div>
  );
};

export default SearchScreen;

