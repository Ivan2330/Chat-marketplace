// ОНОВЛЕНИЙ Chat.jsx з адаптивністю, юзернеймами, часом і аватарками
import React, { useEffect, useState, useRef } from 'react';
import './Chat.styles.css';
import { IoChevronBack } from "react-icons/io5";
import smallMonn from "../../assets/icon-moon-small.png";
import iconStar from '../../assets/iconstar.png';
import iconExpert from '../../assets/icon-girl.png';
import buttonSend from '../../assets/icon-send.png';
import { useParams, useNavigate } from "react-router-dom";

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "–";
  const date = new Date(timestamp);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = date.toLocaleDateString();
  return isToday ? `Today, ${time}` : `${formattedDate} ${time}`;
};

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [wsClosed, setWsClosed] = useState(false);
  const [allChats, setAllChats] = useState([]);
  const [showChatList, setShowChatList] = useState(true);
  const ws = useRef(null);
  const timerRef = useRef(null);

  const startTimer = () => {
    setTimeLeft((prev) => (prev !== null ? prev : 5));
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev !== null && prev > 1) return prev - 1;
        clearInterval(timerRef.current);
        setIsBlocked(true);
        return 0;
      });
    }, 60000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const connectWebSocket = (chatId, token, userRole) => {
    if (!chatId || !token) return;
    ws.current = new WebSocket(`ws://localhost:8000/ws/chat/${chatId}?token=${token}`);
    setWsClosed(false);

    ws.current.onopen = () => {
      setIsBlocked(false);
      if (userRole === "client") startTimer();
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.error) {
        alert(data.error);
        if (role === "client") setIsBlocked(true);
        stopTimer();
        return;
      }
      if (data.text) {
        setMessages((prev) => [...prev, data]);
      }
    };

    ws.current.onclose = () => {
      setIsBlocked(role === "client");
      setWsClosed(true);
      stopTimer();
    };
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`http://localhost:8000/chats/message/${chatId}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  const fetchUserAndChats = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8000/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await res.json();
      setUser(userData);
      setUserId(userData._id);
      setRole(userData.role);

      const chatsRes = await fetch("http://localhost:8000/chats/init", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const chatsData = await chatsRes.json();
      setAllChats(Array.isArray(chatsData) ? chatsData : [chatsData]);

      fetchMessages();
      connectWebSocket(chatId, token, userData.role);
    } catch (err) {
      console.error("Initialization failed", err);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || isBlocked || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    const msg = { text: input, sender_id: userId, chat_id: chatId };
    ws.current.send(JSON.stringify(msg));
    setInput('');
  };

  useEffect(() => {
    fetchUserAndChats();
    return () => {
      if (ws.current) ws.current.close();
      stopTimer();
    };
  }, [chatId]);

  return (
    <div className="chat-app-container">
      <div className="chat-layout">
        <div className={`chat_list_panel ${!showChatList ? 'hidden-on-mobile' : ''}`}>
          {allChats
            .sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0))
            .map(chat => {
              const other = chat.participants.find(p => p !== userId);
              const isAdmin = role === 'admin';
              const username = isAdmin ? chat.participants.find(p => p !== userId) : other;
              return (
                <div
                  key={chat._id}
                  className={`conversation_item ${chat._id === chatId ? 'active' : ''}`}
                  onClick={() => {
                    navigate(`/chat/${chat._id}`);
                    setShowChatList(false);
                  }}
                >
                  <div className="conversation_info">
                    <div className="container-icon-text">
                      <img src={iconExpert} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                      <span className="expert_name" style={{ marginLeft: 12 }}>{username}</span>
                      <span className="last_message_time">{formatTimestamp(chat.last_message_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        <div className={`chat_window ${showChatList ? 'hidden-on-mobile' : ''}`}>
          <div className="chat_window_header">
            <IoChevronBack className="back_icon" onClick={() => setShowChatList(true)} />
            <div className="header_info">
              <h3 className="exper-name">Chat</h3>
              <div className="container-dot">
                <span className="status_dot online"></span>
                <span className="status_text online">Online</span>
              </div>
            </div>
            <img src={smallMonn} alt="smallMonn" style={{ width: 36, height: 36 }} />
          </div>

          <div className="chats_display">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message_bubble_wrapper ${msg.sender_id === userId ? 'my_message' : 'their_message'}`}>
                <div className="message_content">
                  <p className="message_text">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="inputtext_container">
            <span className="container-star-chat">
              <img src={iconStar} alt="iconStar" style={{width: 24, height: 24}}/>
            </span>
            <input
              type="text"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
              disabled={isBlocked}
            />
            <button onClick={sendMessage} disabled={isBlocked}>
              <img src={buttonSend} alt="buttonSend" style={{width: 24, height: 24}}/>
            </button>
          </div>

          {wsClosed && role === "client" && timeLeft === 0 && (
            <div className="reconnect">
              <button onClick={() => connectWebSocket(chatId, localStorage.getItem("accessToken"), role)}>🔁 Reconnect</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
