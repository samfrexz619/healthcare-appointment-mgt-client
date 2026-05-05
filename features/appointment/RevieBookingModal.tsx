"use client"
import { Button } from '@/components/ui/button';
import { DoctorInfo } from '@/types/dashboard';
import React from 'react'



interface ReviewBookingProps {
  doctor: DoctorInfo;
  date: Date
  time: string
  visitType: 'in-person' | 'video'
  reason: string
  onBack: () => void;
}


export const RevieBookingModal: React.FC<ReviewBookingProps> = (props) => {

  const { doctor, date, time, visitType, reason, onBack } = props;

  const formattedDate = date?.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })


  return (
    <div className='overlay-review'>
      <div style={{ borderRadius: "12px" }} className='bg-white h-125 w-150 p-5'>
        <h4 className='text-xl font-bold'>Confirm Appointment</h4>
        <div style={{ borderRadius: "18px" }} className='mt-3 border border-gray-300 p-4'>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-[#D9EEF2] flex items-center justify-center font-semibold">
                AH
              </div>

              <div>
                <p className="font-semibold text-lg">{doctor.name}</p>
                <p className="text-sm text-gray-500">
                  {doctor.speciality}
                </p>
              </div>
            </div>

            <div className="bg-[#0F93A5] text-white px-4 py-1 rounded-full text-sm font-medium">
              £{doctor.consultationFee}
            </div>
          </div>

          <div className="border-t border-gray-300 mt-4 pt-4 space-y-3">
            <Row label="Date" value={formattedDate} />
            <Row label="Time" value={time} />
            <Row
              label="Type"
              value={visitType === 'in-person' ? 'In-person visit' : 'Video consultation'}
            />
            <Row label="Reason" value={reason} />
          </div>
        </div>
        {/* Info Banner */}
        <div style={{ borderRadius: "10px" }} className="bg-[#EEF4FF] mt-5 border border-[#C7D7FE] text-sm rounded-xl p-2 flex gap-3">
          <span className="text-blue-500">ℹ️</span>
          <p>
            You can reschedule or cancel up to 4 hours before your appointment
            without any fee.
          </p>
        </div>

        <div className="flex items-center gap-5 justify-between mt-7" style={{ pointerEvents: 'auto' }}>
          <button onClick={() => {
            console.log('Back button clicked');
            onBack();
          }}
            className="text-gray-600 w-1/2 h-12 px-6 flex cursor-pointer items-center gap-2"
            style={{ pointerEvents: 'auto' }}
          >
            ← Back
          </button>

          <Button
            className="bg-[#0F93A5] w-1/2 text-white px-6 h-12 rounded-full flex items-center gap-2 justify-center font-bold"
            style={{ pointerEvents: 'auto' }}
          >
            ✓ Confirm booking
          </Button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-right max-w-[60%]">
        {value}
      </span>
    </div>
  )
}