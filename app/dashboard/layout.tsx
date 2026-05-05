import { Metadata } from "next";
import HeaderBox from "@/components/layouts/HeaderBox";
import SideNav from "@/components/layouts/SideNav";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "../globals.css"

export const metadata: Metadata = {
  title: "Healthcare Dashboard",
  description: "This is the dashboard page for authenticated users.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  return (
    <main className="w-full flex bg-[#F0F1F5] h-screen">
      <SideNav />
      <article className="flex-1 px-6 xl:max-w-7xl h-screen overflow-y-auto">
        <HeaderBox />
        {children}
      </article>
    </main>
  );
}