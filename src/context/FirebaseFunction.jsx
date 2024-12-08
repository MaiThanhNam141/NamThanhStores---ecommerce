import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc, getDocs, collection } from "firebase/firestore";

// Lấy người dùng hiện tại
export const getCurrentUser = () => {
    return auth.currentUser;
};

// Lấy thông tin người dùng
export const getUserInfo = async () => {
    try {
        const user = getCurrentUser();
        if (user) {
            const userRef = doc(db, 'users', user.uid);
            const snapshot = await getDoc(userRef);
            return snapshot.exists() ? snapshot.data() : null;
        }
    } catch (error) {
        console.error("Firebase getUserInfo: ", error);
    }
};

// Lấy tài liệu trong một collection
export const getDocumentRef = async (collectionName) => {
    try {
        const snapshot = await getDocs(collection(db, collectionName));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("handleFirestore:", error);
    }
};

// Cập nhật thông tin người dùng
export const setUserInfo = async (userDocData) => {
    try {
        const user = getCurrentUser();
        if (user) {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, userDocData);
        }
    } catch (error) {
        console.error("Firebase setUserInfo: ", error);
    }
};

// Cập nhật thông tin người dùng
export const updateUserInfo = async (userDocData) => {
    try {
        const user = getCurrentUser();
        if (user) {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, userDocData);
        }
    } catch (error) {
        console.error("Firebase updateUserInfo: ", error);
    }
};

// Lấy sản phẩm được chọn để thanh toán
export const fetchItemsCheckout = async (selectedItems) => {
    try {
        const items = await Promise.all(
            selectedItems.map(async (selectedItem) => {
                const docRef = doc(db, 'productFood', selectedItem.id.toString());
                const docSnapshot = await getDoc(docRef);
                return { id: docSnapshot.id, ...docSnapshot.data() };
            })
        );

        return items;
    } catch (error) {
        console.error("Fetch items checkout error: ", error);
    }
};

// Cập nhật đơn hàng theo ID
export const updateOrderWithID = async (id, data, status) => {
    try {
        const orderRef = doc(db, 'orders', id);
        await updateDoc(orderRef, {
            embed_data: {
                ...data,
                status
            }
        });
        return true;
    } catch (error) {
        console.error("Error update order: ", error);
        return false;
    }
};

// Lấy tham chiếu người dùng
export const getUserRef = () => {
    try {
        const user = getCurrentUser();
        if (user) {
            return doc(db, 'users', user.uid);
        }
    } catch (error) {
        console.error(error);
        return null;
    }
};

// Cập nhật đánh giá sản phẩm
export const updateRateProduct = async (rate, rateCount, id) => {
    try {
        const productRef = doc(db, 'productFood', id);
        await updateDoc(productRef, {
            rate,
            rateCount
        });
    } catch (error) {
        console.error("Error update order: ", error);
    }
};

// Gửi phản hồi đơn hàng
export const feedbackOrder = async (id, rate, comment) => {
    try {
        const orderRef = doc(db, 'orders', id);
        await updateDoc(orderRef, {
            rate,
            comment
        });
        return true;
    } catch (error) {
        console.error("Error update order: ", error);
        return false;
    }
};
