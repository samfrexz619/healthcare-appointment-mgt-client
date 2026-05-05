import Image from 'next/image'
import React from 'react'
import { DoctorInfo } from '@/types/dashboard'
import { cn } from '@/lib/utils'

interface CategoryCardProp {
  info: DoctorInfo;
  isActive?: boolean;
  onClick?: () => void;
}

const CategoryCard: React.FC<CategoryCardProp> = (props) => {
  const { info, isActive, onClick } = props
  return (
    <div onClick={onClick} role='button' style={{ borderRadius: "6px" }} className={cn(
      "border cursor-pointer rounded-xl p-4",
      isActive
        ? "border-[#0F93A5]"
        : "border-gray-200"
    )}>
      <div className='flex gap-3'>
        <div className='relative'>
          <div className='size-12 bg-gray-200 rounded-lg'>

          </div>
          <div className='flex items-center w-11 justify-center gap-1 bg-white rounded-md p-1 absolute left-1/2 -translate-x-1/2 -bottom-2 shadow-sm'>
            <Image src="/images/icons/star.png" alt='start' width={10} height={10} className="w-2.5 h-2.5" />
            <span className='text-[10px] font-semibold'>{info.rating}</span>
          </div>
        </div>
        <div className='space-y-2'>
          <p>Dr. {info.name}</p>
          <div className='flex items-center text-xs gap-2'>
            <p className=''>{info.speciality}</p>
            <i className='block size-2 bg-gray-600 rounded-full'></i>
            <p className=''>{info.numOfExperience} years experience</p>
          </div>
        </div>
      </div>

      <div className='mt-5'>
        <p>Available Today:</p>
        <ul className='space-y-3 mt-3'>
          {info.onlineAvailability && <li className='py-1 px-2 bg-gray-100 rounded-md w-fit flex items-center gap-2'>
            <i className='block size-1.5 rounded-full bg-gray-500'></i>
            <span className='text-xs'>Online Consultation</span>
          </li>}
          <li className='py-1 px-2 bg-gray-100 rounded-md w-fit flex items-center gap-2'>
            <i className='block size-1.5 rounded-full bg-gray-500'></i>
            <span className='text-xs'>Offline at {info.hospitalName}</span>
          </li>
        </ul>
      </div>
      <div className='mt-5 space-y-3'>
        <i className='w-full h-px bg-gray-300 block'></i>
        <div className='flex justify-between'>
          <p>fee consultation</p>
          <p className='font-bold'>£{info.consultationFee}</p>
        </div>
      </div>
    </div>
  )
}

export default CategoryCard