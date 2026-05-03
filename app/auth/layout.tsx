import AuthSlides from "@/components/layouts/AuthSlides";
import { Metadata } from "next";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Authentication Page",
  description:
    "This is the authentication page for users to log in or sign up.",
};

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (token) {
    redirect("/dashboard/home");
  }
  return (
    <main className="w-full flex">
      <aside className="w-1/2 bg-[#F7FAFC] hidden md:block h-screen">
        <AuthSlides />
      </aside>
      <aside className="w-full md:w-1/2 py-10">{children}</aside>
    </main>
  );
}
