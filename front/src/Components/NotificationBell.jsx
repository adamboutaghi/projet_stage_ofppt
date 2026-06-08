import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck, Calendar } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import { useAuth } from "../contexts/AuthContext";
import { buildScheduleUrl } from "../utils/notificationNavigation";

function NotificationTypeBadge({ type, label }) {
  const classes =
    type === "schedule_published"
      ? "bg-green-100 text-green-700"
      : type === "schedule_created"
      ? "bg-blue-100 text-blue-700"
      : "bg-orange-100 text-orange-700";

  return (
    <span
      className={`text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full ${classes}`}
    >
      {label}
    </span>
  );
}

function NotificationItem({ notification, onSelect, schedulePath }) {
  const { id, type, type_label, title, message, is_read, created_at_formatted, semaine_id } =
    notification;
  const clickable = Boolean(schedulePath && semaine_id);

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(notification)}
        className={`w-full text-left px-4 py-3 hover:bg-orange-50/80 transition-colors duration-150 ${
          !is_read ? "bg-orange-50/40" : ""
        } ${clickable ? "cursor-pointer" : ""}`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 p-2 rounded-lg flex-shrink-0 ${
              !is_read ? "bg-orange-100" : "bg-gray-100"
            }`}
          >
            <Calendar
              className={`w-4 h-4 ${!is_read ? "text-orange-600" : "text-gray-400"}`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <NotificationTypeBadge type={type} label={type_label} />
              {!is_read && (
                <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 animate-pulse" />
              )}
            </div>
            <p className="font-medium text-blue-950 text-sm leading-snug">{title}</p>
            {message && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{message}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">{created_at_formatted}</p>
          </div>
          {is_read && <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />}
        </div>
      </button>
    </li>
  );
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  } = useNotifications(true);

  const schedulePath = buildScheduleUrl(user?.role, null)?.split("?")[0] ?? null;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleItemClick = (n) => {
    if (!n.is_read) markAsRead(n.id);
    const url = buildScheduleUrl(user?.role, n.semaine_id);
    if (url) {
      setOpen(false);
      navigate(url);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} non lues` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell
          className={`w-5 h-5 transition-colors duration-200 ${
            unreadCount > 0 ? "text-orange-600" : ""
          } ${open ? "scale-110" : ""}`}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-orange-600 rounded-full animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="notification-panel-enter absolute right-0 mt-2 w-[min(100vw-2rem,380px)] bg-white rounded-2xl shadow-2xl border border-orange-100 z-[60] overflow-hidden"
          role="dialog"
          aria-label="Liste des notifications"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-orange-100 bg-gradient-to-r from-blue-50 to-orange-50">
            <h3 className="font-semibold text-blue-950">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-[min(70vh,400px)] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-8">Chargement...</p>
            ) : notifications.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-8">Aucune notification</p>
            ) : (
              <>
                <p className="px-4 py-2 text-[10px] uppercase tracking-wide text-gray-400 bg-gray-50/80 border-b border-orange-50">
                  Historique ({notifications.length})
                </p>
                <ul className="divide-y divide-orange-50">
                  {notifications.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onSelect={handleItemClick}
                      schedulePath={schedulePath}
                    />
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
