
// src/components/User/Chat/ChatWindow.tsx

import React, { useState, useEffect, useRef } from "react";
import echo from "../../../services/echo";
import "../../../assets/css/User/ChatWindow.css";
import {
  getMessageHistory,
  sendMessage,
} from "../../../services/friendsService";
import { useNotificationsOptional } from "../../../hooks/notificationContext"; // Optional hook

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

// Normalize any raw message payload into the Message shape used by the UI
const normalizeMessage = (raw: any): Message | null => {
  if (!raw) return null;
  // Some backends return { message: {...} }
  const m = raw.message ?? raw;
  const id = Number(m.id ?? m.message_id ?? Date.now());
  const content = String(m.content ?? m.text ?? m.body ?? "");
  const created_at = String(m.created_at ?? m.createdAt ?? new Date().toISOString());

  // sender/receiver might be nested or flat
  const sender_id = Number(
    m.sender_id ?? m.senderId ?? m.sender?.id ?? m.sender?.user_id ?? m.user_id
  );
  const receiver_id = Number(
    m.receiver_id ?? m.receiverId ?? m.receiver?.id ?? m.receiver?.user_id
  );
  const sender = {
    user_id: Number(m.sender?.user_id ?? m.sender?.id ?? m.user_id ?? sender_id),
    name: String(m.sender?.name ?? m.sender_name ?? m.name ?? ""),
    avatar: m.sender?.avatar ?? m.sender_avatar ?? undefined,
  };

  if (!content || Number.isNaN(sender_id) || Number.isNaN(receiver_id)) {
    return null;
  }

  return { id, content, sender_id, receiver_id, created_at, sender };
};

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
  // Notifications context might not be available in some routes; make it safe
  const notifCtx = useNotificationsOptional();
  const removeNotificationSafe: (id: string) => void = notifCtx?.removeNotification ?? (() => {});
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let isMounted = true;

    if (!friend?.id || !currentUserId) {
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    // Khi mở cửa sổ chat, xóa thông báo tin nhắn mới từ người này
    const notificationId = `new-message-${friend.id}`;
    removeNotificationSafe(notificationId);

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await getMessageHistory(friend.id);
        if (isMounted) {
          const data = Array.isArray(response.data)
            ? response.data
            : Array.isArray(response.data?.messages)
            ? response.data.messages
            : [];
          const normalized = data
            .map((m: any) => normalizeMessage(m))
            .filter(Boolean) as Message[];
          setMessages(normalized);
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

    const me = Number.parseInt(String(currentUserId), 10);
    const other = Number.parseInt(String(friend.id), 10);
    if (Number.isNaN(me) || Number.isNaN(other)) {
      return () => {
        isMounted = false;
      };
    }
    const user1 = Math.min(me, other);
    const user2 = Math.max(me, other);
    const channelName = `chat.${user1}.${user2}`;

    try {
      echo.private(channelName).listen("MessageSent", (messageData: any) => {
        if (!isMounted) return;
        const normalized = normalizeMessage(messageData);
        if (normalized) {
          setMessages((prevMessages) => (Array.isArray(prevMessages) ? [...prevMessages, normalized] : [normalized]));
        }
      });
    } catch (err) {
      console.error("Echo subscription failed:", err);
    }

    return () => {
      isMounted = false;
      try {
        echo.leave(channelName);
      } catch {}
    };

  }, [friend?.id, currentUserId, removeNotificationSafe]);

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
      sender: { user_id: parseInt(currentUserId), name: "You", avatar: friend?.avatar || "" },
    };

    setMessages((prev) => (Array.isArray(prev) ? [...prev, optimisticMessage] : [optimisticMessage]));
    const messageContent = newMessage;
    setNewMessage("");

    try {
      const response = await sendMessage(friend.id, messageContent);
      const serverMsg = normalizeMessage(response?.data ?? response);
      if (!serverMsg) return; // keep optimistic if response malformed
      setMessages((prev) =>
        (Array.isArray(prev) ? prev : []).map((msg) => (msg.id === tempId ? serverMsg : msg))
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => (Array.isArray(prev) ? prev.filter((msg) => msg.id !== tempId) : []));
    }
  };

  const renderMessages = () => {
    try {
      const list = Array.isArray(messages) ? messages : [];
      return list
        .filter(Boolean)
        .map((msg: any, idx: number) => {
          const senderId = msg?.sender_id ?? msg?.sender?.user_id;
          const isSent = senderId != null && String(senderId) === String(currentUserId);
          const key = msg?.id != null ? `${msg.id}-${msg?.created_at ?? idx}` : `m-${idx}`;
          const createdAt = msg?.created_at ? new Date(msg.created_at) : null;
          const time = createdAt && !isNaN(createdAt.getTime())
            ? createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "";
          return (
            <div key={key} className={`chat-message ${isSent ? "sent" : "received"}`}>
              <p>{msg?.content ?? ""}</p>
              <span className="timestamp">{time}</span>
            </div>
          );
        });
    } catch (err) {
      console.error("Render messages failed:", err, { messages });
      return (
        <div className="chat-loading-text">Unable to render messages.</div>
      );
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <img
          src={(friend && friend.avatar) || `https://i.pravatar.cc/30?u=${friend?.id ?? "_"}`}
          alt="avatar"
        />
        <h3>{friend?.name ?? "Friend"}</h3>
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
            {renderMessages()}
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
