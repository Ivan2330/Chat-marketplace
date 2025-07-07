import React, { useEffect, useState, useRef } from 'react';
import './Chat.styles.css';
import { IoChevronBack } from "react-icons/io5";
import smallMonn from "../../assets/icon-moon-small.png";
import iconStar from '../../assets/iconstar.png';
import iconExpert from '../../assets/icon-girl.png';
import buttonSend from '../../assets/icon-send.png';
import { useParams, useNavigate } from "react-router-dom";
import { API_URL, WS_URL } from '../../../config';

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "–";
  const date = new Date(timestamp);
  const time = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedDate = date.toLocaleDateString();
  return `${formattedDate}, ${time}`;
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
  const bottomRef = useRef();

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = (initialMinutes) => {
    stopTimer();
    setTimeLeft(initialMinutes);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev > 1) return prev - 1;
        clearInterval(timerRef.current);
        setIsBlocked(true);
        return 0;
      });
    }, 60000);
  };

  const fetchFreshUser = async () => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const userData = await res.json();
    setUser(userData);
    setTimeLeft(userData.minutes_left);
    setUserId(userData._id);
    setRole(userData.role);
    return userData;
  };

  const connectWebSocket = async (chatId, token, userRole) => {
    const updatedUser = await fetchFreshUser();
    if (!chatId || !token) return;
    if (ws.current) ws.current.close();
    ws.current = new WebSocket(`${WS_URL}/ws/chat/${chatId}?token=${token}`);
    setWsClosed(false);

    ws.current.onopen = () => {
      setIsBlocked(false);
      if (updatedUser.role === "client") startTimer(updatedUser.minutes_left);
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.error) {
        alert(data.error);
        if (updatedUser.role === "client") setIsBlocked(true);
        stopTimer();
        return;
      }
      if (data.text) {
        setMessages(prev => [...prev, data]);
      }
    };

    ws.current.onclose = () => {
      setIsBlocked(updatedUser.role === "client");
      setWsClosed(true);
      stopTimer();
    };
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/chats/message/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const userData = await fetchFreshUser();

      const chatsRes = await fetch(`${API_URL}/chats/init`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const chatsData = await chatsRes.json();
      const chatsArray = Array.isArray(chatsData) ? chatsData : [chatsData];

      const chatsWithLastText = await Promise.all(
        chatsArray.map(async chat => {
          try {
            const msgRes = await fetch(`${API_URL}/chats/message/${chat._id}`);
            const msgs = await msgRes.json();
            const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1].text : '';
            return { ...chat, last_message_text: lastMsg };
          } catch {
            return { ...chat, last_message_text: '' };
          }
        })
      );

      setAllChats(chatsWithLastText);
      await fetchMessages();
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
      setMessages([]);
    };
  }, [chatId]);

  useEffect(() => {
    const handleUnload = () => stopTimer();
    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("blur", stopTimer);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("blur", stopTimer);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <div className="chat-page-glow"></div>
      <div className="chat-app-container">
        <div className="chat-layout">
          <div className={`chat_list_panel ${!showChatList ? 'hidden-on-mobile' : ''}`}>
            {allChats
              .sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0))
              .map(chat => {
                const other = chat.usernames?.find(name => name !== user?.username);
                return (
                  <div
                    key={chat._id}
                    className={`conversation_item ${chat._id === chatId ? 'active' : ''}`}
                    onClick={() => {
                      navigate(`/chat/${chat._id}`);
                      setShowChatList(false);
                    }}
                  >
                    <div className="container-icon-text">
                      <img src={iconExpert} alt="avatar" className="img-expert" />
                      <div className="container-text-expert">
                        <div className="top_row">
                          <span className="expert_name">{other}</span>
                          <span className="last_message_time">{formatTimestamp(chat.last_message_at)}</span>
                        </div>
                        <p className="last_message">{chat?.last_message_text || 'No messages yet.'}</p>
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
                <h3 className="expert-name">Chat</h3>
                <div className="container-dot">
                  <span className="status_dot online"></span>
                  <span className="status_text online">Online</span>
                </div>
              </div>
              {role === "client" && timeLeft !== null && (
                <span className="time-left">⏳ {timeLeft} min</span>
              )}
              <img src={smallMonn} alt="moon" style={{ width: 36, height: 36 }} />
            </div>

            <div className="chats_display">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message_bubble_wrapper ${msg.sender_id === userId ? 'my_message' : 'their_message'}`}>
                  <div className="message_content">
                    <p className="message_text">{msg.text}</p>
                    <span className="message_time">{formatTimestamp(msg.timestamp)}</span>
                  </div>
                </div>
              ))}
              <div ref={bottomRef}></div>
            </div>

            <div className="inputtext_container">
              <span className="container-star-chat">
                <img src={iconStar} alt="iconStar" />
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
                <img src={buttonSend} alt="Send" />
              </button>
            </div>

            {wsClosed && role === "client" && timeLeft === 0 && (
              <div className="reconnect">
                <button onClick={() => connectWebSocket(chatId, localStorage.getItem("accessToken"), role)}>
                  🔁 Reconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
