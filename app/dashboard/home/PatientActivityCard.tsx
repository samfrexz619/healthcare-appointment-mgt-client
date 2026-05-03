import React from 'react'
import { PatientActivity } from '@/types/dashboard'
import { TrendingUp } from 'lucide-react'

const PatientActivityCard: React.FC<{ activity: PatientActivity }> = ({ activity }) => {

  return (
    <div key={activity.id} className='bg-white border border-gray-300 rounded-xl p-6 h-47 flex justify-between'>
      <div className='space-y-4'>
        <p className='text-lg'>{activity.title}</p>
        <h4 className='font-bold text-black text-2xl'>{activity.number}</h4>
        {activity.description && <div className='flex gap-2 items-center text-[#22A065]'>
          <TrendingUp />
          <p className='text-xs'>{activity.description}</p>
        </div>}
      </div>
      <div style={{ background: activity.bgColor, color: activity.color }} className='size-11 rounded-md grid place-items-center'>
        {activity.icon}
      </div>
    </div>
  )
}

export default PatientActivityCard