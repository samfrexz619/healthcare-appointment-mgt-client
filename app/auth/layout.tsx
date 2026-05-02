
import AuthSlides from "@/components/layouts/AuthSlides";
import { Metadata } from "next";



export const metadata: Metadata = {
  title: "Authentication Page",
  description: "This is the authentication page for users to log in or sign up.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="w-full flex">
      <aside className="w-1/2 bg-[#F7FAFC] hidden md:block h-screen">

        <AuthSlides />
      </aside>
      <aside className="w-full md:w-1/2 py-10">
        {children}
      </aside>
    </main>
  );
}