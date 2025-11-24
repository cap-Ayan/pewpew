import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { format } from "date-fns";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Hash, Search, Bell, LogOut, Settings, Send, Smile, Paperclip, MoreVertical, Menu, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import axios from "axios";
import Login from "./pages/Login";
import Register from "./pages/Register";

const socket = io("http://pewpew-1.onrender.com", {
  transports: ["websocket"],
  autoConnect: false,
});

function ChatApp({ user, onLogout }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentChannel, setCurrentChannel] = useState("general");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [file, setFile] = useState(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
      socket.emit("user_connected", user._id);
    }

    function onLoadHistory(history) {
      setChat(history);
    }

    function onReceiveMessage(data) {
      setIsTyping(false);
      setChat((prev) => [...prev, data]);
    }

    function onTypingStatus(status) {
      setIsTyping(status);
    }

    function onUpdateUserList(users) {
      setOnlineUsers(users);
    }

    socket.on("load_history", onLoadHistory);
    socket.on("receive_message", onReceiveMessage);
    socket.on("typing_status", onTypingStatus);
    socket.on("update_user_list", onUpdateUserList);

    return () => {
      socket.off("load_history", onLoadHistory);
      socket.off("receive_message", onReceiveMessage);
      socket.off("typing_status", onTypingStatus);
      socket.off("update_user_list", onUpdateUserList);
    };
  }, [user]);

  useEffect(() => {
    socket.emit("join_channel", currentChannel);
  }, [currentChannel]);

  const handleChannelSwitch = (channel) => {
    setCurrentChannel(channel);
    socket.emit("join_channel", channel);
    setShowSidebar(false);
  };

  const handleEmojiClick = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
  };

  const handleFileSelect = (e) => {
    setFile(e.target.files[0]);
  };

  const sendMessage = async () => {
    if (message.trim() || file) {
      socket.emit("stop_typing", currentChannel);

      let attachment = null;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        try {
          const res = await axios.post("http://localhost:8000/api/upload", formData);
          attachment = res.data;
        } catch (err) {
          console.error("Upload failed", err);
        }
      }

      const newMsg = {
        text: message,
        time: new Date().toISOString(),
        sender: user.username,
        channel: currentChannel,
        attachment,
      };

      socket.emit("send_message", newMsg);
      setChat((prev) => [...prev, newMsg]);
      setMessage("");
      setFile(null);
      setShowEmojiPicker(false);
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit("typing", currentChannel);
    setTimeout(() => {
      socket.emit("stop_typing", currentChannel);
    }, 2000);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  return (
    <div className="flex h-screen bg-bg-dark text-text-main font-sans overflow-hidden">
      {/* Sidebar - Mobile Overlay */}
      {showSidebar && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setShowSidebar(false)}></div>
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 w-72 bg-bg-card border-r border-border transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out z-30 flex flex-col`}>
        {/* User Profile Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img src={user.avatar} alt="Me" className="w-10 h-10 rounded-full bg-gray-700 object-cover" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-bg-card"></div>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{user.username}</h3>
              <span className="text-xs text-green-500">Online</span>
            </div>
          </div>
          <button onClick={onLogout} className="text-text-muted hover:text-white transition-colors p-2 rounded-lg hover:bg-bg-dark">
            <LogOut size={18} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Channels */}
          <div>
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 px-2">Channels</h4>
            <div className="space-y-1">
              {["general", "random", "help"].map((channel) => (
                <button
                  key={channel}
                  onClick={() => handleChannelSwitch(channel)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-all ${currentChannel === channel
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-muted hover:bg-bg-dark hover:text-white'
                    }`}
                >
                  <Hash size={18} className="mr-3 opacity-70" />
                  <span className="font-medium capitalize">{channel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Online Users */}
          <div>
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 px-2 flex justify-between items-center">
              <span>Online Users</span>
              <span className="bg-bg-dark px-2 py-0.5 rounded-full text-[10px]">{onlineUsers.length}</span>
            </h4>
            <div className="space-y-2">
              {onlineUsers.map((u) => (
                <div key={u._id} className="flex items-center px-3 py-1.5 rounded-lg hover:bg-bg-dark/50 transition-colors cursor-pointer group">
                  <div className="relative mr-3">
                    <img src={u.avatar} alt={u.username} className="w-8 h-8 rounded-full bg-gray-700 object-cover" />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-bg-card"></div>
                  </div>
                  <span className="text-sm text-text-muted group-hover:text-white transition-colors">{u.username}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-bg-dark">
        {/* Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-border bg-bg-dark/95 backdrop-blur supports-[backdrop-filter]:bg-bg-dark/60 sticky top-0 z-10">
          <div className="flex items-center">
            <button onClick={() => setShowSidebar(true)} className="lg:hidden mr-4 text-text-muted hover:text-white">
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center">
                <Hash size={20} className="text-text-muted mr-2" />
                <span className="capitalize">{currentChannel}</span>
              </h2>
              <p className="text-xs text-text-muted hidden sm:block">Topic: Discuss anything related to {currentChannel}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-text-muted">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search messages..."
                className="bg-bg-card border border-border rounded-full px-4 py-1.5 pl-10 text-sm text-white focus:outline-none focus:border-primary w-48 transition-all"
              />
              <Search size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            </div>
            <button className="hover:text-white transition-colors"><Bell size={20} /></button>
            <button className="hover:text-white transition-colors"><MoreVertical size={20} /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={chatContainerRef}>
          {chat.map((msg, i) => {
            const isMe = msg.sender === user.username;
            const showAvatar = !isMe && (i === 0 || chat[i - 1].sender !== msg.sender);

            return (
              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${!showAvatar && !isMe ? 'ml-10' : ''}`}>
                {!isMe && showAvatar && (
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender}`}
                    alt={msg.sender}
                    className="w-8 h-8 rounded-full mr-2 self-end mb-1 shadow-sm"
                  />
                )}
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[70%]`}>
                  {!isMe && showAvatar && <span className="text-xs text-text-muted ml-1 mb-1">{msg.sender}</span>}
                  <div className={`message-bubble ${isMe ? 'me' : 'other'}`}>
                    {msg.attachment && (
                      <div className="mb-2">
                        {msg.attachment.type?.startsWith("image/") ? (
                          <img src={msg.attachment.url} alt="attachment" className="max-w-full rounded-lg max-h-60 object-cover" />
                        ) : (
                          <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-400 hover:underline">
                            <Paperclip size={16} className="mr-1" />
                            {msg.attachment.name}
                          </a>
                        )}
                      </div>
                    )}
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-text-muted mt-1 px-1 opacity-70">
                    {format(new Date(msg.time), "h:mm a")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-bg-dark relative">
          {showEmojiPicker && (
            <div className="absolute bottom-20 right-4 z-50">
              <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
            </div>
          )}

          <div className="max-w-4xl mx-auto relative">
            {isTyping && (
              <div className="absolute -top-6 left-0 text-xs text-primary font-medium animate-pulse flex items-center">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mr-1.5"></span>
                Someone is typing...
              </div>
            )}

            {file && (
              <div className="absolute -top-10 left-0 bg-bg-card border border-border px-3 py-1 rounded-lg flex items-center text-xs text-white">
                <span className="truncate max-w-[200px]">{file.name}</span>
                <button onClick={() => setFile(null)} className="ml-2 text-red-400 hover:text-red-300"><X size={14} /></button>
              </div>
            )}

            <div className="flex items-end bg-bg-card border border-border rounded-2xl p-2 shadow-sm focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="p-2 text-text-muted hover:text-primary transition-colors rounded-full hover:bg-bg-dark"
              >
                <Paperclip size={20} />
              </button>
              <textarea
                className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-text-muted resize-none py-2 px-2 max-h-32 min-h-[40px]"
                placeholder={`Message #${currentChannel}...`}
                rows={1}
                value={message}
                onChange={handleTyping}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2 transition-colors rounded-full hover:bg-bg-dark ${showEmojiPicker ? 'text-primary' : 'text-text-muted hover:text-primary'}`}
              >
                <Smile size={20} />
              </button>
              <button
                onClick={sendMessage}
                disabled={!message.trim() && !file}
                className={`p-2 ml-1 rounded-xl transition-all ${message.trim() || file
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-hover'
                  : 'bg-bg-dark text-text-muted cursor-not-allowed'
                  }`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("Failed to parse user from local storage", e);
      localStorage.removeItem("user");
      return null;
    }
  });

  const handleLogout = () => {
    socket.disconnect();
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login setUser={(u) => {
          localStorage.setItem("user", JSON.stringify(u));
          setUser(u);
        }} /> : <Navigate to="/chat" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/chat" />} />
        <Route path="/chat" element={user ? <ChatApp user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={user ? "/chat" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
