"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
import { authService } from "@/lib/services/authService";
import { initSocket, getSocket } from "@/lib/socket";

export interface NotificationItem {
  id: string;
  message: string;
  type?: "success" | "info" | "error";
  timestamp: Date;
  isRead: boolean;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_verified: boolean;
  [key: string]: unknown;
}

interface AppContextType {
  user: UserProfile | null;
  isLoadingUser: boolean;
  notifications: NotificationItem[];
  toasts: NotificationItem[]; // separate — only for floating toast
  unreadCount: number;
  addNotification: (
    n: Omit<NotificationItem, "id" | "timestamp" | "isRead">,
  ) => void;
  removeNotification: (id: string) => void;
  dismissToast: (id: string) => void; // removes from toast only, keeps in list
  clearNotifications: () => void;
  markAllRead: () => void;
  markOneRead: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside AppProvider");
  return ctx;
};

const PUBLIC_AUTH_ROUTES = [
  "/",
  "/auth/login",
  "/auth/sign-up",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
];

const isPublicRoute = (pathname: string) =>
  PUBLIC_AUTH_ROUTES.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname === route || pathname.startsWith(`${route}/`);
  });

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isPublicPath = isPublicRoute(pathname);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(!isPublicPath);
  const [hasCheckedUser, setHasCheckedUser] = useState(isPublicPath);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<NotificationItem[]>([]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const addNotification = useCallback(
    (n: Omit<NotificationItem, "id" | "timestamp" | "isRead">) => {
      const item: NotificationItem = {
        ...n,
        id: crypto.randomUUID(),
        timestamp: new Date(),
        isRead: false,
      };
      // Add to persistent notification list
      setNotifications((prev) => [item, ...prev]);
      // Also add to toasts for floating display
      setToasts((prev) => [item, ...prev]);
    },
    [],
  );

  // Only removes from bell list
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Only removes from floating toast — notification stays in list
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setToasts([]);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const markOneRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoadingUser(true);
        setHasCheckedUser(false);
        const res = await authService.me();
        const profile = res.profile || {};
        const userData = res.user || {};

        const fullUser: UserProfile = {
          first_name: profile.first_name || userData.first_name || "",
          last_name: profile.last_name || userData.last_name || "",
          email: userData.email || profile.email || "",
          role: userData.role || profile.role || "",
          is_verified: userData.is_verified ?? profile.is_verified ?? false,
          id: userData.id || profile.id || "",
          ...profile,
          ...userData,
        };

        if (!isMounted) return;

        setUser(fullUser);

        // Save to localStorage
        localStorage.setItem("user_first_name", fullUser.first_name);
        localStorage.setItem("user_last_name", fullUser.last_name);
        localStorage.setItem("user_role", fullUser.role);

        initSocket(userData.id || profile.id || "");
        const socket = getSocket();

        if (socket) {
          socket.on("appointment:booked", (data: { message: string }) => {
            addNotification({ message: data.message, type: "success" });
          });
          socket.on("appointment:cancelled", (data: { message: string }) => {
            addNotification({ message: data.message, type: "error" });
          });
          socket.on("appointment:rescheduled", (data: { message: string }) => {
            addNotification({ message: data.message, type: "info" });
          });
        }
      } catch (err) {
        console.error("Failed to load user:", err);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setHasCheckedUser(true);
          setIsLoadingUser(false);
        }
      }
    };

    if (isPublicPath) {
      return;
    }

    load();

    return () => {
      isMounted = false;
      const socket = getSocket();
      if (socket) {
        socket.off("appointment:booked");
        socket.off("appointment:cancelled");
        socket.off("appointment:rescheduled");
      }
    };
  }, [addNotification, isPublicPath]);

  const contextUser = isPublicPath ? null : user;
  const contextIsLoadingUser = isPublicPath
    ? false
    : isLoadingUser || (!hasCheckedUser && !user);

  return (
    <AppContext.Provider
      value={{
        user: contextUser,
        isLoadingUser: contextIsLoadingUser,
        notifications,
        toasts,
        unreadCount,
        addNotification,
        removeNotification,
        dismissToast,
        clearNotifications,
        markAllRead,
        markOneRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
