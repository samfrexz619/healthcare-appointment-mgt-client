import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="w-full bg-[#F7FAFC] h-screen">
      <header className="w-full sticky top-0 h-25 flex items-center border-b border-gray-300">
        <nav className="w-full xl:w-285 mx-auto h-full flex items-center justify-between">
          <Link href={'/'} className="flex flex-col items-center">
            <Image src="/images/icons/logo.svg" alt="logo" width={50} height={50} />
            <p className="text-xl font-bold text-[#0F93A5]">MediApp</p>
          </Link>

          <div className="flex gap-6 items-center h-full">
            <Link href={'/auth/login'} className="text-[#0F93A5] font-semibold cursor-pointer">
              Sign In
            </Link>
            <Link href={'/auth/sign-up'} className="block">
              <Button className="w-37 hover:shadow-lg transition-all duration-150 rounded-[32px] cursor-pointer font-bold bg-[#0F93A5] text-white h-12">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>
      <section className=" w-full xl:w-285 mx-auto py-20">
        <div className="bg-[#E3F0F3] h-12 text-[#0F93A5] font-semibold rounded-4xl flex px-2 items-center gap-4 w-112.5 justify-center mx-auto">
          <Activity />
          <p className="text-xl">Hospital Appointment Management</p>
        </div>
        <div className="py-10 w-150 mx-auto text-center">
          <h1 className="text-3xl font-bold">
            Modern care coordination, <span className="text-[#0F93A5]">simplified</span>.
          </h1>
          <p className="text-2xl text-gray-500">MediApp HAMS connects patients, doctors, and administrators in one secure platform — so your hospital runs on schedule, every day.</p>
          <Link href={'/auth/login'} className="block mt-10">
            <Button className="w-67.5 h-14 hover:shadow-lg transition-all duration-150 rounded-[32px] cursor-pointer font-bold text-lg bg-[#0F93A5] text-white">
              Login to your account
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
