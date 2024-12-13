import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getDatabase, ref, push, onValue, off } from "firebase/database";
import { getAuth } from "firebase/auth";
import { Send } from 'lucide-react';
import '../style/Chat.css';
import logo from '../assets/logo.png';
import AIImage from '../assets/AIImage.png';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingResponse, setLoadingResponse] = useState(false);
    const [isHumanSupport, setIsHumanSupport] = useState(false);
    const messagesEndRef = useRef(null);
    const auth = getAuth();
    const user = auth.currentUser;

    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_REACT_APP_GEMINI_API);

    useEffect(() => {
        if (!isHumanSupport || !user) return;

        const db = getDatabase();
        const messagesRef = ref(db, `conversations/${user.uid}/messages`);
        const onValueChange = onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const formattedMessages = Object.keys(data)
                    .map(key => ({ id: key, ...data[key], avatar: AIImage }))
                    .sort((a, b) => a.timestamp - b.timestamp);
                setMessages(formattedMessages);
            }
        });

        return () => off(messagesRef, 'value', onValueChange);
    }, [isHumanSupport, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleGenerateContent = async (message) => {
        try {
            setLoadingResponse(true);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(`
                Act as a friendly, supportive, and slightly humorous customer service representative from NamThanhStores, a Vietnamese livestock and poultry feed store. 
                Use an informal tone, making the conversation feel casual and approachable. Refer to yourself as "tớ" and the customer as "cậu." 
                Always show empathy, understanding, and support while keeping the tone positive and uplifting. If the customer has a concern, offer solutions or guide them to available resources.
                Avoid sounding robotic or scripted. Make it feel like a natural.
                **Customer Message:** ${message}
            `);
            return result.response.text();
        } catch (e) {
            console.error(e);
            return "Lỗi: Có vẻ tin nhắn của bạn đã vi phạm chính sách an toàn của NamThanhStores. Vui lòng thử lại với nội dung khác.";
        } finally {
            setLoadingResponse(false);
        }
    };

    const sendMessage = async () => {
        if (newMessage.trim().length < 5) {
            alert("Tin nhắn quá ngắn!");
            return;
        }
        try {
            const userMessage = { id: Math.random().toString(), text: newMessage, sender: "You", avatar: null, timestamp: Date.now() };
            setMessages(prevMessages => [...prevMessages, userMessage]);
            setNewMessage('');

            if (isHumanSupport && user) {
                const db = getDatabase();
                const messagesRef = ref(db, `conversations/${user.uid}/messages`);
                push(messagesRef, userMessage);
            } else {
                const response = await handleGenerateContent(newMessage);
                const resMessage = { id: Math.random().toString(), text: response, sender: 'NamThanhStores Chatbot', avatar: AIImage };
                setMessages(prevMessages => [...prevMessages, resMessage]);
            }
        } catch (error) {
            console.error("Lỗi khi gửi tin nhắn:", error);
        }
    };

    const handleChangeSupport = async () => {
        try {
            if (!user) {
                alert("Hãy đăng nhập để sử dụng tính năng này");
                return;
            }
            setIsHumanSupport(!isHumanSupport);

            if (!isHumanSupport) { // Chuyển sang người thật
                const db = getDatabase();
                const conversationRef = ref(db, `conversations/${user.uid}`);
                alert("Đang gửi yêu cầu hỗ trợ, vui lòng chờ...");

                await push(conversationRef, {
                    customerName: user.displayName || "Người dùng ẩn danh",
                    messages,
                });

                alert("Yêu cầu hỗ trợ đã được gửi.");
            } else {
                alert("Đã chuyển về chế độ chatbot.");
            }
        } catch (error) {
            console.error("handleChangeSupport: ", error);
        }
    }

    const isCurrentUser = useCallback((sender) => sender === "You", []);

    return (
        <div className="chat-bot-screen">
            <div className="title">
                <img src={logo} alt="Logo" className="title-avatar" />
                <p className="disclaimer">NamThanhStores ChatBot có thể mắc sai sót, vì vậy, hãy xác minh lại các câu trả lời trước khi hoàn toàn tin tưởng</p>
                <div className="support-switch">
                    <span>Chuyển sang người thật hỗ trợ</span>
                    <label className="switch">
                        <input type="checkbox" checked={isHumanSupport} onChange={handleChangeSupport} />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>

            <div className="message-list">
                {messages.map((item) => (
                    <div key={item.id} className={`message-container ${isCurrentUser(item.sender) ? 'current-user-message' : ''}`}>
                        {!isCurrentUser(item.sender) && (
                            <div className="sender-info">
                                <img className="avatar" src={item?.avatar} alt="Avatar" />
                                <span className="sender-name">{item?.sender}</span>
                            </div>
                        )}
                        <p className="message-text">{item.text}</p>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-container">
                <input
                    type="text"
                    className="message-input"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn ở đây..."
                />
                <button className="send-button" onClick={sendMessage} disabled={loadingResponse}>
                    {loadingResponse ? (
                        <div className="loading-indicator"></div>
                    ) : (
                        <Send size={24} />
                    )}
                </button>
            </div>
        </div>
    );
};

export default Chat;

