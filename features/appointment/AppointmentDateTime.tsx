"use client";

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import clsx from 'clsx';
import { RevieBookingModal } from './RevieBookingModal';
import { DoctorInfo } from '@/types/dashboard';





interface AppointmentDateTimeProps {
  doctor: DoctorInfo
}


const AppointmentDateTime: React.FC<AppointmentDateTimeProps> = ({ doctor }) => {

  function getNextDays(count = 7) {
    const today = new Date()

    return Array.from({ length: count }, (_, i) => {
      const d = new Date()
      d.setDate(today.getDate() + i)

      return {
        fullDate: d,
        day: d.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase(),
        date: d.getDate(),
        month: d.toLocaleDateString('en-GB', { month: 'short' }),
      }
    })
  }

  const timeSlots = [
    { time: '09:00', disabled: false },
    { time: '09:30', disabled: false },
    { time: '10:00', disabled: false },
    { time: '10:30', disabled: true },
    { time: '11:00', disabled: false },
    { time: '11:30', disabled: false },
    { time: '14:00', disabled: false },
    { time: '14:30', disabled: false },
    { time: '15:00', disabled: true },
    { time: '15:30', disabled: false },
    { time: '16:00', disabled: false },
  ]

  const dates = getNextDays(7)

  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [visitType, setVisitType] = useState<'in-person' | 'video' | null>(null)
  const [reason, setReason] = useState('')
  const [showReviewModal, setShowReviewModal] = useState(false)

  const isValid =
    selectedDate &&
    selectedTime &&
    visitType &&
    reason.trim().length > 0;

  const handleClose = () => {
    setOpen(false)
    setShowReviewModal(false)
  }


  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button className='h-12 bg-[#0F93A5] text-white rounded-[40px] px-4'>
            Book Appointment
          </Button>
        </SheetTrigger>
        <SheetContent showCloseButton={true} onInteractOutside={(e) => e.preventDefault()} className='min-w-150 bg-white border-none overflow-y-scroll pt-6 pb-10'>
          <SheetHeader className=''>
            <SheetTitle className='text-2xl font-bold text-black'>
              Book Appointment
            </SheetTitle>
            <SheetDescription>
              Please select date and time to book appointment with your doctor.
            </SheetDescription>
          </SheetHeader>
          <section className='px-6 space-y-4'>
            <div style={{ borderRadius: "8px" }} className='w-full border border-gray-300 p-4'>
              <p>Date & time</p>
              <div className="flex gap-3 overflow-x-auto py-2">
                {dates.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(d.fullDate)}
                    style={{ borderRadius: "6px" }}
                    className={clsx(
                      'min-w-20 rounded-xl border p-2 text-center transition',
                      selectedDate?.toDateString() === d.fullDate.toDateString()
                        ? 'border-[#0F93A5] bg-[#E6F6F8]'
                        : 'border-gray-200'
                    )}
                  >
                    <p className="text-xs text-gray-500">{d.day}</p>
                    <p className="text-lg font-semibold">{d.date}</p>
                    <p className="text-xs text-gray-400">{d.month}</p>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ borderRadius: "8px" }} className='w-full border border-gray-300 p-4'>
              <p>Available time slots</p>
              <div className="flex flex-wrap gap-3 py-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    style={{ borderRadius: "6px" }}
                    disabled={slot.disabled}
                    onClick={() => setSelectedTime(slot.time)}
                    className={clsx(
                      'px-4 py-2 rounded-xl border text-sm',
                      slot.disabled && 'opacity-40 cursor-not-allowed',
                      selectedTime === slot.time
                        ? 'border-[#0F93A5] bg-[#E6F6F8]'
                        : 'border-gray-200'
                    )}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>

            </div>

            <h2 className="text-2xl font-semibold">Visit details</h2>
            <div style={{ borderRadius: "8px" }} className='w-full border border-gray-300 p-4'>

              <h3 className="mb-3 font-medium">Visit type</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setVisitType('in-person')}
                  style={{ borderRadius: "6px" }}
                  className={clsx(
                    'rounded-2xl border p-4 text-left',
                    visitType === 'in-person'
                      ? 'border-[#0F93A5] bg-[#E6F6F8]'
                      : 'border-gray-200'
                  )}
                >
                  <p className="font-semibold">In-person</p>
                  <p className="text-sm text-gray-500">Visit the clinic</p>
                </button>

                <button
                  onClick={() => setVisitType('video')}
                  style={{ borderRadius: "6px" }}
                  className={clsx(
                    'rounded-2xl border p-4 text-left',
                    visitType === 'video'
                      ? 'border-[#0F93A5] bg-[#E6F6F8]'
                      : 'border-gray-200'
                  )}
                >
                  <p className="font-semibold">Video consultation</p>
                  <p className="text-sm text-gray-500">From anywhere</p>
                </button>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-2 font-medium">Reason for visit</h3>
              <textarea
                maxLength={500}
                value={reason}
                style={{ borderRadius: "6px" }}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border p-4 focus:border-[#0F93A5] outline-none"
                placeholder="Briefly describe your symptoms..."
              />
              <p className="text-sm text-gray-400">{reason.length}/500</p>
            </div>

            <div>
              <Button
                style={{ borderRadius: "40px" }}
                disabled={!isValid}
                className={clsx(
                  'w-full h-12 mt-6 text-white',
                  isValid
                    ? 'bg-[#0F93A5]'
                    : 'bg-gray-300 cursor-not-allowed'
                )}
                onClick={() => {
                  // console.log({
                  //   selectedDate,
                  //   selectedTime,
                  //   visitType,
                  //   reason,
                  // })
                  setOpen(false)
                  setShowReviewModal(true)
                }}
              >
                Continue
              </Button>
            </div>
          </section>
        </SheetContent>
      </Sheet>
      {showReviewModal && <RevieBookingModal
        doctor={doctor}
        date={selectedDate!}
        time={selectedTime!}
        visitType={visitType!}
        reason={reason}
        onBack={handleClose}
      />}
    </>
  )
}

export default AppointmentDateTime