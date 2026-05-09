"use client";

import { useEffect } from "react";
import { useAppContext, NotificationItem } from "@/lib/context/AppContext";
import { X } from "lucide-react";

const toastStyles = {
  success: "border-l-4 border-green-500 bg-white",
  error: "border-l-4 border-red-500   bg-white",
  info: "border-l-4 border-blue-500  bg-white",
};

const dotStyles = {
  success: "bg-green-500",
  error: "bg-red-500",
  info: "bg-blue-500",
};

const Toast = ({
  notification,
  onDismiss,
}: {
  notification: NotificationItem;
  onDismiss: (id: string) => void;
}) => {
  useEffect(() => {
    // Auto dismiss toast after 5s — notification stays in bell list
    const timer = setTimeout(() => onDismiss(notification.id), 5000);
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  const style = toastStyles[notification.type ?? "info"];
  const dot = dotStyles[notification.type ?? "info"];

  return (
    <div
      className={`w-80 shadow-lg rounded-xl p-4 flex items-start gap-3 animate-slide-in ${style}`}
    >
      <span className={`mt-1 size-2 rounded-full shrink-0 ${dot}`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {notification.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      <button
        onClick={() => onDismiss(notification.id)}
        className="text-gray-300 hover:text-gray-600 transition mt-0.5"
      >
        <X size={14} />
      </button>
    </div>
  );
};

const NotificationToast = () => {
  const { toasts, dismissToast } = useAppContext();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      <div className="pointer-events-auto space-y-3">
        {toasts.map((n) => (
          <Toast key={n.id} notification={n} onDismiss={dismissToast} />
        ))}
      </div>
    </div>
  );
};

export default NotificationToast;
