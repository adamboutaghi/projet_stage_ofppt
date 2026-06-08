import { useState, useEffect, useCallback, useRef } from "react";
import AxiosClient from "../services/AxiosClient";
import { useAuth } from "../contexts/AuthContext";

const POLL_INTERVAL_MS = 30000;

export function useNotifications(enabled = true) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  const fetchNotifications = useCallback(async () => {
    if (!enabled || !user) return;
    try {
      const res = await AxiosClient.get("/notifications");
      if (!mountedRef.current) return;
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count ?? 0);
    } catch {
      // silencieux si non authentifié
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [enabled, user]);

  useEffect(() => {
    mountedRef.current = true;
    if (!enabled || !user) {
      setNotifications([]);
      setUnreadCount(0);
      return undefined;
    }

    setLoading(true);
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [enabled, user, fetchNotifications]);

  const markAsRead = useCallback(async (id) => {
    try {
      await AxiosClient.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await AxiosClient.post("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
