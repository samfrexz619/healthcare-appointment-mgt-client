"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'
import { FileText, Home, User2, Calendar, Bell } from 'lucide-react';
import Image from 'next/image';



const SideNav: React.FC = () => {
  const navLinks = [
    {
      id: 1,
      path: '/dashboard/home',
      routeName: 'Home',
      icon: <Home />
    },
    {
      id: 2,
      path: '/dashboard/appointments',
      routeName: 'Appointments',
      icon: <Calendar />
    },
    {
      id: 3,
      path: '/dashboard/profile',
      routeName: 'Profile',
      icon: <User2 />
    },
    {
      id: 4,
      path: '/dashboard/history',
      routeName: 'History',
      icon: <FileText />

    },
    {
      id: 5,
      path: '/dashboard/notifications',
      routeName: 'Notifications',
      icon: <Bell />

    },
  ];

  const pathname = usePathname();
  // console.log(pathname);

  return (
    <aside className='w-61.75 h-screen p-4'>
      <nav style={{ borderRadius: "10px" }} className='w-full h-full bg-white rounded-lg py-5'>
        <Link href="/dashboard/home" className="flex w-fit px-4 flex-col items-center">
          <Image src="/images/icons/logo.svg" alt="logo" width={50} height={50} className="w-12.5 h-12.5" loading="eager" />
          <p className="text-xl font-bold text-[#0F93A5]">MediApp</p>
        </Link>

        <ul className='pt-14 w-full space-y-5'>
          {navLinks.map(link => (
            <li key={link.id} className={`h-12 transition-all duration-300 ease-in-out flex hover:bg-[#0F93A5]/20 ${link.path === pathname ? 'bg-[#0F93A5] text-white' : 'bg-transparent'}`}>
              {link.path === pathname && <i className='block h-full w-0.5 bg-[#09B0B7]' />}
              <Link href={link.path} className='flex h-full gap-4 w-full px-4 items-center'>
                {link.icon}
                <h6>{link.routeName}</h6>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default SideNav