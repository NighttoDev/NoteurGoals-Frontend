import React, { useState, useEffect, useRef } from 'react';
import echo from '../../../services/echo'; // Giả sử echo.ts nằm trong src/services/
import { getMessageHistory, sendMessage } from '../../../services/friendsService'; // Giả sử friendsService.ts nằm trong src/services/
import "../../../assets/css/user/ChatWindow.css"; // <-- ĐƯỜNG DẪN CSS ĐÃ ĐƯỢC SỬA

// Interface cho một đối tượng tin nhắn
interface Message {
  id: number;
  content: string;
  sender_id: number;
  receiver_id: number;
  created_at: string;
  sender: {
    user_id: number;
    name: string; // Tên này sẽ là display_name từ backend
    avatar?: string; // Tên này sẽ là avatar_url từ backend
  }
}

// Interface cho các props mà component này sẽ nhận
interface ChatWindowProps {
  friend: { id: string; name:string; avatar?: string };
  currentUserId: string; // ID của người dùng đang đăng nhập
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ friend, currentUserId, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hàm để tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect chính: Lấy tin nhắn cũ và Lắng nghe tin nhắn mới
  useEffect(() => {
    let isMounted = true;

    // 1. Lấy lịch sử chat từ API
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

    // 2. Lắng nghe kênh riêng tư qua Laravel Echo
    const user1 = Math.min(parseInt(currentUserId, 10), parseInt(friend.id, 10));
    const user2 = Math.max(parseInt(currentUserId, 10), parseInt(friend.id, 10));
    const channelName = `chat.${user1}.${user2}`;

    echo.private(channelName)
      .listen('MessageSent', (messageData: any) => { // Nhận dữ liệu từ broadcastWith
        if (isMounted) {
          const newMessage: Message = {
              ...messageData,
              sender: { // Ánh xạ lại cấu trúc sender từ broadcastWith
                  user_id: messageData.sender.user_id,
                  name: messageData.sender.name,
                  avatar: messageData.sender.avatar,
              }
          };
          setMessages(prevMessages => [...prevMessages, newMessage]);
        }
      });

    // 3. Dọn dẹp: rời khỏi kênh khi component bị đóng (unmount)
    return () => {
      isMounted = false;
      echo.leave(channelName);
    };
  }, [friend.id, currentUserId]);


  // Hàm xử lý khi người dùng gửi tin nhắn
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
      sender: { user_id: parseInt(currentUserId), name: 'You', avatar: '' }
    };

    setMessages(prev => [...prev, optimisticMessage]);
    const messageContent = newMessage;
    setNewMessage('');

    try {
      const response = await sendMessage(friend.id, messageContent);
      setMessages(prev => prev.map(msg => msg.id === tempId ? response.data : msg));
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Could not send message. Please try again.");
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
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
              key={`${msg.id}-${msg.created_at}`} // Thêm created_at để đảm bảo key duy nhất
              className={`chat-message ${msg.sender_id.toString() === currentUserId ? 'sent' : 'received'}`}
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
          autoFocus
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatWindow;