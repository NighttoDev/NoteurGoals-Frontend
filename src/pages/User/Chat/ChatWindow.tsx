// src/components/User/Chat/ChatWindow.tsx

import React, { useState, useEffect, useRef } from "react";
import echo from "../../../services/echo";
import "../../../assets/css/user/ChatWindow.css";
import {
  getMessageHistory,
  sendMessage,
} from "../../../services/friendsService";
import { useNotifications } from "../../../hooks/notificationContext"; // Nhập hook

interface Message {
  id: number;
  content: string;
  sender_id: number;
  receiver_id: number;
  created_at: string;
  sender: {
    user_id: number;
    name: string;
    avatar?: string;
  };
}

interface ChatWindowProps {
  friend: { id: string; name: string; avatar?: string };
  currentUserId: string;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  friend,
  currentUserId,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { removeNotification } = useNotifications(); // Lấy hàm xóa thông báo

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let isMounted = true;

    // Khi mở cửa sổ chat, xóa thông báo tin nhắn mới từ người này
    const notificationId = `new-message-${friend.id}`;
    removeNotification(notificationId);

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await getMessageHistory(friend.id);
        if (isMounted) {
          setMessages(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch message history:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchHistory();

    const user1 = Math.min(
      parseInt(currentUserId, 10),
      parseInt(friend.id, 10)
    );
    const user2 = Math.max(
      parseInt(currentUserId, 10),
      parseInt(friend.id, 10)
    );
    const channelName = `chat.${user1}.${user2}`;

    echo.private(channelName).listen("MessageSent", (messageData: any) => {
      if (isMounted) {
        const newMessageData: Message = {
          ...messageData,
          sender: {
            user_id: messageData.sender.user_id,
            name: messageData.sender.name,
            avatar: messageData.sender.avatar,
          },
        };
        setMessages((prevMessages) => [...prevMessages, newMessageData]);
      }
    });

    return () => {
      isMounted = false;
      echo.leave(channelName);
    };
  }, [friend.id, currentUserId, removeNotification]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempId = Date.now();
    const optimisticMessage: Message = {
      id: tempId,
      content: newMessage,
      sender_id: parseInt(currentUserId),
      receiver_id: parseInt(friend.id),
      created_at: new Date().toISOString(),
      sender: { user_id: parseInt(currentUserId), name: "You", avatar: "" },
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    const messageContent = newMessage;
    setNewMessage("");

    try {
      const response = await sendMessage(friend.id, messageContent);
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? response.data.message : msg))
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <img
          src={friend.avatar || `https://i.pravatar.cc/30?u=${friend.id}`}
          alt="avatar"
        />
        <h3>{friend.name}</h3>
        <button className="chat-close-btn" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="chat-body">
        {isLoading ? (
          <div className="chat-loading">
            <div className="chat-loading-spinner"></div>
            <div className="chat-loading-text">Loading conversation...</div>
          </div>
        ) : (
          <div className="chat-body-content">
            {messages.map((msg) => (
              <div
                key={`${msg.id}-${msg.created_at}`}
                className={`chat-message ${
                  msg.sender_id.toString() === currentUserId
                    ? "sent"
                    : "received"
                }`}
              >
                <p>{msg.content}</p>
                <span className="timestamp">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <form className="chat-footer" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          autoFocus
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !newMessage.trim()}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
