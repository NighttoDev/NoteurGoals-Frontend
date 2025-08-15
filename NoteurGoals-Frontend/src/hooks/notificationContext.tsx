// src/hooks/notificationContext.tsx

import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  ReactNode,
  useEffect,
} from "react";

// Định nghĩa cấu trúc của một thông báo
export interface Notification {
  id: string;
  type:
    | "friend_request"
    | "event_upcoming"
    | "event_ongoing"
    | "event_finished"
    | "new_message"; // <-- ĐÃ THÊM
  message: string;
  link: string;
  timestamp: Date;
  seen: boolean;
}

// Định nghĩa những gì Context sẽ cung cấp
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "timestamp" | "seen">
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  markAllAsSeen: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// Tên khóa để lưu trong localStorage
const LOCAL_STORAGE_KEY = "app_notifications";

// Tạo Provider component
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Khởi tạo state từ localStorage
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const storedItem = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedItem) {
        const parsedNotifications = JSON.parse(storedItem);
        return parsedNotifications.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
      }
    } catch (error) {
      console.error("Lỗi khi đọc thông báo từ localStorage:", error);
    }
    return [];
  });

  // Lưu state vào localStorage mỗi khi nó thay đổi
  useEffect(() => {
    try {
      const serializedNotifications = JSON.stringify(notifications);
      window.localStorage.setItem(LOCAL_STORAGE_KEY, serializedNotifications);
    } catch (error) {
      console.error("Lỗi khi lưu thông báo vào localStorage:", error);
    }
  }, [notifications]);

  const addNotification = useCallback(
    (notification: Omit<Notification, "timestamp" | "seen">) => {
      setNotifications((prev) => {
        const existingNotificationIndex = prev.findIndex(
          (n) => n.id === notification.id
        );

        if (existingNotificationIndex > -1) {
          const existingNotification = prev[existingNotificationIndex];
          if (
            existingNotification.message === notification.message &&
            existingNotification.type === notification.type
          ) {
            return prev;
          }
          const updatedNotifications = [...prev];
          updatedNotifications[existingNotificationIndex] = {
            ...notification,
            timestamp: new Date(),
            seen: false, // Đánh dấu là MỚI khi có cập nhật
          };
          return updatedNotifications;
        }

        const newNotification = {
          ...notification,
          timestamp: new Date(),
          seen: false,
        };
        const updatedNotifications = [...prev, newNotification];
        updatedNotifications.sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );
        return updatedNotifications;
      });
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  const markAllAsSeen = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => (n.seen ? n : { ...n, seen: true }))
    );
  }, []);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    markAllAsSeen,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
