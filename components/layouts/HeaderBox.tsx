"use client"

import React from 'react'
import { Bell, Search } from 'lucide-react'
import Link from 'next/link'

const HeaderBox: React.FC = () => {
  return (
    <header className='mt-4 w-full'>
      <div className='w-full flex h-12 gap-4 justify-end'>
        <div style={{ borderRadius: "8px" }} className='h-full bg-white w-90 rounded-lg flex items-center gap-2 px-2'>
          <Search className='text-gray-500' />
          <input type="text" placeholder='Search doctor or specialist' className='w-full h-full outline-none border-none bg-transparent' />
        </div>
        <div style={{ borderRadius: "6px" }} className='bg-white w-12 relative h-full rounded-lg grid place-items-center'>
          <Link href="#">
            <span className='size-4 bg-red-600 absolute top-1.5 right-2.5 text-[10px] font-semibold text-white grid place-items-center rounded-full'>0</span>
            <Bell size={20} />
          </Link>
        </div>
        <div style={{ borderRadius: "8px" }} className='flex gap-2 bg-white rounded-lg w-fit px-2 h-full items-center'>
          <div style={{ borderRadius: "6px" }} className='size-9 bg-[#0F93A5] text-white rounded-lg grid place-items-center'>
            <p className='uppercase font-bold text-lg'>st</p>
          </div>
          <div>
            <p className='text-[14px] font-semibold capitalize'>Samfrexz Taylor</p>
            <p className='text-xs'>Patient</p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default HeaderBox