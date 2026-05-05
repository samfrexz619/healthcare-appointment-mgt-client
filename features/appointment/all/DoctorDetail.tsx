import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { DoctorInfo } from '@/types/dashboard'
import AppointmentDateTime from '../AppointmentDateTime';



interface DoctorDetailProps {
  doctor: DoctorInfo;
}


const DoctorDetail: React.FC<DoctorDetailProps> = ({ doctor }) => {
  return (
    <>
      <section className='w-full flex justify-between'>
        <div className='flex gap-3'>
          <div className='relative w-fit'>
            <div className='size-14 bg-gray-200 rounded-lg'>

            </div>
            <div className='flex items-center w-11 justify-center gap-1 bg-white rounded-md p-1 absolute left-1/2 -translate-x-1/2 -bottom-1 shadow-sm'>
              <Image src="/images/icons/star.png" alt='start' width={10} height={10} className="w-2.5 h-2.5" />
              <span className='text-[10px] font-semibold'>{doctor.rating}</span>
            </div>
          </div>

          <div className='space-y-2 w-50'>
            <p>Dr. {doctor.name}</p>
            <div className='flex flex-col text-xs gap-2'>
              <p>{doctor.speciality}</p>
              {/* <i className='block size-2 bg-gray-600 rounded-full'></i> */}
              <p>{doctor.numOfExperience} years experience</p>
            </div>
          </div>
        </div>
        <AppointmentDateTime />

      </section>
      <section className=''>
        <div className='flex gap-8'>
          <div className='text-xs space-y-1'>
            <p className='text-gray-400'>Education</p>
            <p className=' text-black'>Phd in Clinical Psychology, UCLA</p>
          </div>
          <div className='text-xs space-y-1'>
            <p className='text-gray-400'>Certificate</p>
            <p className=' text-black'>Certified CBT Therapist, APA</p>
          </div>
        </div>
      </section>
      <div className='mt-5'>
        <p>Available Today:</p>
        <ul className=' mt-3 flex gap-6 items-center'>
          {doctor.onlineAvailability && (
            <li className="py-1 px-2 bg-gray-100 rounded-md w-fit flex items-center gap-2">
              <i className="block size-1.5 rounded-full bg-gray-500" />
              <span className="text-xs">Online Consultation</span>
            </li>
          )}
          {doctor.offlineAvailability && (
            <li className="py-1 px-2 bg-gray-100 rounded-md w-fit flex items-center gap-2">
              <i className="block size-1.5 rounded-full bg-gray-500" />
              <span className="text-xs">Offline at {doctor.hospitalName}</span>
            </li>
          )}

        </ul>
      </div>
      <section className="space-y-4">
        <p>Doctor's Reviews <span>({doctor.reviewMessages.length} Reviews)</span></p>
        {doctor.reviewMessages.map((review) => (
          <div key={review.id} className="w-full border border-gray-300 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="size-10 rounded-md bg-gray-400" />
              <div className="space-y-1">
                <p className="text-xs text-black font-bold">{review.reviewerName}</p>
                <div className="flex items-center text-xs gap-2">
                  <p>{review.reviewDate}</p>
                  <i className="size-1.5 bg-gray-500 rounded-full block" />
                  <Image src="/images/icons/star.png" alt="star" width={9} height={9} className="w-2.5 h-2.5" />
                  <p>{review.reviewerRating}</p>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs">{review.review}</p>
            </div>
          </div>
        ))}

      </section>
    </>
  )
}

export default DoctorDetail