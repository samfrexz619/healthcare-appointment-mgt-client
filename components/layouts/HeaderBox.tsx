"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, Search, X, Check } from "lucide-react";
import { useAppContext } from "@/lib/context/AppContext";

const typeStyles = {
  success: {
    bg: "bg-green-50 border-green-200",
    dot: "bg-green-500",
    text: "text-green-700",
    unread: "bg-green-100",
  },
  error: {
    bg: "bg-red-50 border-red-200",
    dot: "bg-red-500",
    text: "text-red-700",
    unread: "bg-red-100",
  },
  info: {
    bg: "bg-blue-50 border-blue-200",
    dot: "bg-blue-500",
    text: "text-blue-700",
    unread: "bg-blue-100",
  },
};

const HeaderBox: React.FC = () => {
  const {
    user,
    isLoadingUser,
    notifications,
    unreadCount,
    removeNotification,
    clearNotifications,
    markAllRead,
    markOneRead,
  } = useAppContext();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleBellClick = () => {
    setOpen((prev) => !prev);
  };

  const initials = user
    ? `${user.first_name?.[0] ?? user.email?.[0] ?? ""}${
        user.last_name?.[0] ?? ""
      }`.toUpperCase()
    : "??";

  const fullName = user
    ? `${
        user.first_name || user.last_name
          ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
          : (user.email ?? user.role ?? "User")
      }`
    : "Loading...";

  return (
    <header className="mt-4 w-full">
      <div className="w-full flex h-12 gap-4 justify-end relative">
        {/* Search */}
        <div
          style={{ borderRadius: "8px" }}
          className="h-full bg-white w-90 rounded-lg flex items-center gap-2 px-3"
        >
          <Search className="text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search doctor or specialist"
            className="w-full h-full outline-none border-none bg-transparent text-sm"
          />
        </div>

        {/* Bell + Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={handleBellClick}
            style={{ borderRadius: "8px" }}
            className="bg-white w-12 h-12 rounded-lg grid place-items-center cursor-pointer relative"
          >
            {unreadCount > 0 && (
              <span className="size-4 bg-red-600 absolute top-1.5 right-2 text-[10px] font-semibold text-white grid place-items-center rounded-full">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
            <Bell size={20} />
          </button>

          {open && (
            <div className="absolute right-0 top-14 w-84 bg-white shadow-xl border border-gray-100 rounded-xl z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">Notifications</p>
                </div>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-[#0F93A5] hover:underline flex items-center gap-1"
                    >
                      <Check size={12} />
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-xs text-gray-400 hover:text-red-500 transition"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              {/* List */}
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell size={28} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No notifications yet</p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {notifications.map((n) => {
                    const style = typeStyles[n.type ?? "info"];
                    return (
                      <div
                        key={n.id}
                        onClick={() => markOneRead(n.id)}
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                          n.isRead ? "bg-white" : style.unread
                        } hover:bg-gray-50`}
                      >
                        {/* Dot */}
                        <div className="mt-1.5 shrink-0">
                          <span
                            className={`block size-2 rounded-full ${
                              n.isRead ? "bg-gray-300" : style.dot
                            }`}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm ${
                              n.isRead
                                ? "text-gray-500 font-normal"
                                : "text-gray-800 font-medium"
                            }`}
                          >
                            {n.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {n.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(n.id);
                          }}
                          className="shrink-0 text-gray-300 hover:text-gray-500 transition mt-0.5"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User */}
        <div
          style={{ borderRadius: "8px" }}
          className="flex gap-2 bg-white rounded-lg w-fit px-2 h-full items-center"
        >
          <div
            style={{ borderRadius: "6px" }}
            className="size-9 bg-[#0F93A5] text-white rounded-lg grid place-items-center"
          >
            <p className="uppercase font-bold text-sm">{initials}</p>
          </div>
          <div>
            <p className="text-[14px] font-semibold capitalize">{fullName}</p>
            <p className="text-xs text-gray-400 capitalize">
              {user?.role ?? ""}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderBox;
