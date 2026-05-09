"use client";
import { AppProvider } from "@/lib/context/AppContext";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppProvider>{children}</AppProvider>;
}
