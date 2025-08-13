import React, { useState, useEffect, useRef } from 'react';
import echo from '../../../services/echo';
import { getMessageHistory, sendMessage } from '../../../services/friendsService';
import "../../../assets/css/user/ChatWindow.css";

// --- INTERFACES (Không đổi) ---
interface Sender { user_id: number; name: string; avatar?: string; }
interface Message {
  id: number;
  content: string;
  sender_id: number;
  receiver_id: number;
  created_at: string;
  sender?: Sender;
}
interface ChatWindowProps {
  friend: { id: string; name:string; avatar?: string };
  currentUserId: string;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ friend, currentUserId, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let isMounted = true;
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

    const channelName = `chat.${Math.min(parseInt(currentUserId, 10), parseInt(friend.id, 10))}.${Math.max(parseInt(currentUserId, 10), parseInt(friend.id, 10))}`;

    echo.private(channelName)
      .listen('MessageSent', (messageData: Message) => {
        if (isMounted) {
            setMessages(prevMessages => {
                if (prevMessages.some(msg => msg.id === messageData.id)) {
                    return prevMessages.map(msg => msg.id === messageData.id ? messageData : msg);
                }
                return [...prevMessages, messageData];
            });
        }
      });

    return () => {
      isMounted = false;
      echo.leave(channelName);
    };
  }, [friend.id, currentUserId]);

  // === SỬA LỖI LẬT TIN NHẮN TẠI ĐÂY ===
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const messageContent = newMessage;
    setNewMessage('');
    setIsSending(true);

    // 1. Tạo tin nhắn tạm với sender_id là ID của user hiện tại trên frontend
    const tempId = Date.now();
    const optimisticMessage: Message = {
      id: tempId,
      content: messageContent,
      sender_id: parseInt(currentUserId, 10),
      receiver_id: parseInt(friend.id),
      created_at: new Date().toISOString(),
      sender: { user_id: parseInt(currentUserId), name: 'You', avatar: '' }
    };
    
    // 2. Hiển thị tin nhắn tạm này ngay lập tức. Nó sẽ luôn nằm bên phải.
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const response = await sendMessage(friend.id, messageContent);
      
      // 3. Cập nhật tin nhắn tạm bằng dữ liệu thật từ server
      // NHƯNG chỉ lấy những gì cần thiết (id, created_at)
      // và giữ lại sender_id đúng của tin nhắn tạm.
      setMessages(prev => prev.map(msg => {
          if (msg.id === tempId) {
            // Trả về một object mới bằng cách kết hợp:
            // - Tất cả thuộc tính của tin nhắn tạm (...msg)
            // - Ghi đè `id` và `created_at` bằng giá trị thật từ server.
            return { 
              ...msg, 
              id: response.data.id, 
              created_at: response.data.created_at 
            };
          }
          return msg;
        })
      );
      
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Could not send message.");
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <img src={friend.avatar || `https://i.pravatar.cc/30?u=${friend.id}`} alt="avatar" />
        <h3>{friend.name}</h3>
        <button className="chat-close-btn" onClick={onClose}>×</button>
      </div>
      <div className="chat-body">
        {isLoading ? (
          <div className="chat-loading">Loading messages...</div>
        ) : (
          messages.map((msg) => (
            <div 
              key={`${msg.id}-${msg.created_at}`}
              className={`chat-message ${msg.sender_id.toString() === currentUserId.toString() ? 'sent' : 'received'}`}
            >
              <p>{msg.content}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-footer" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={isSending}
          autoFocus
        />
        <button type="submit" disabled={isSending}>
          {isSending ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;