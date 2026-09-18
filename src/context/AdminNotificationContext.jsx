import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const AdminNotificationContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
  : import.meta.env.DEV
  ? "http://localhost:5000"
  : window.location.origin;

export function AdminNotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("new_order", (payload) => {
      const notification = { ...payload, id: `${payload.orderId}-${Date.now()}`, read: false };

      setNotifications((prev) => [notification, ...prev].slice(0, 30));
      setUnreadCount((c) => c + 1);

      setToasts((prev) => [...prev, notification]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== notification.id));
      }, 6000);

      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        const n = new Notification("New order placed 🥛", {
          body: `${payload.customerName} ordered ${payload.itemsSummary} — ₹${payload.totalAmount}`,
        });
        n.onclick = () => window.focus();
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  const requestPermission = async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AdminNotificationContext.Provider
      value={{ notifications, unreadCount, markAllRead, permission, requestPermission, toasts, dismissToast }}
    >
      {children}
    </AdminNotificationContext.Provider>
  );
}

export const useAdminNotifications = () => useContext(AdminNotificationContext);
