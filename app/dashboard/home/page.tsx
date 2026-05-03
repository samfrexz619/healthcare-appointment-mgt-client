import { Button } from '@/components/ui/button';
import { Calendar, ChevronRight, ClipboardList, FileText, HeartPulse, MapPin, TrendingUp } from 'lucide-react';
import PatientActivityCard from './PatientActivityCard';
import Link from 'next/link';

const HomePage = () => {

  const patientActivities = [
    {
      id: 1,
      title: "Upcoming visits",
      description: "0% vs last week",
      icon: <Calendar />,
      number: 2,
      bgColor: "#E5F8FA",
      color: "#0F93A5"
    },
    {
      id: 2,
      title: "Past visits",
      description: "10% vs last week",
      icon: <ClipboardList />,
      number: 14,
      bgColor: "#E7EFFE",
      color: "#2574F3"
    },
    {
      id: 3,
      title: "Active prescriptions",
      // description: "4% vs last week",
      icon: <FileText />,
      number: 3,
      bgColor: "#FEF6E6",
      color: "#F59F0A"
    },
    {
      id: 4,
      title: "Wellness score",
      description: "8% vs last week",
      icon: <HeartPulse />,
      number: 86,
      bgColor: "#E6F9F0",
      color: "#22A065"
    },
  ];

  const recommededDoctors = [
    {
      id: 1,
      name: "Dr. Amelia Hart",
      specialty: "Cardiology",
    },
    {
      id: 2,
      name: "Dr. Amelia Hart",
      specialty: "Pediatrics",
    },
    {
      id: 3,
      name: "Dr. Amelia Hart",
      specialty: "Orthopedics",
    },
  ]
  return (
    <section className='my-10 h-full'>
      <div className='w-full flex justify-between'>
        <div className=''>
          <h4 className='font-bold text-2xl font-mono'>Welcome back, <span className='text-[#0F93A5] capitalize'>Samfrexz</span></h4>
          <p className='text-gray-500'>Here's your health summary and upcoming visits.</p>
        </div>
        <Button className='bg-[#0F93A5] text-white hover:bg-[#0D7D8C] cursor-pointer px-5 rounded-lg h-14'>
          <Calendar />
          <span className='font-bold text-lg'>Book an Appointment</span>
        </Button>
      </div>
      <section className='mt-16 grid grid-cols-2 gap-8'>
        {
          patientActivities.map(activity => (
            <PatientActivityCard key={activity.id} activity={activity} />
          ))
        }
      </section>
      <section className='mt-16 w-full'>
        <div className='bg-white border border-gray-300 space-y-4 rounded-xl p-6 h-50'>
          <section className='w-full flex justify-between'>
            <div>
              <h4 className='text-2xl font-medium'>Upcoming appointments</h4>
              <p className='text-gray-500'>Your next scheduled visits</p>
            </div>
            <Link href="#" className='flex gap-2'>
              <span> View all</span>
              <ChevronRight />
            </Link>
          </section>
          <section className='border border-gray-300 w-full rounded-xl p-4 flex justify-between'>
            <div className='flex gap-2'>
              <div className='size-10 rounded-full grid place-items-center bg-[#DCF1F9]'>
                <h4 className='uppercase font-medium text-[#1F627A]'>ah</h4>
              </div>
              <div>
                <div className='flex gap-2 items-center'>
                  <p className='text-[14px] font-medium'>Dr. Amelia Hart</p>
                  <div className='w-[120px] border border-[#C4E8D5] text-[#22A065] bg-[#E6F9F0] rounded-4xl flex items-center justify-center gap-2 py-1'>
                    <i className='block size-2 rounded-full bg-[#22A065]'></i>
                    <p className='text-xs capitalize'>confirmed</p>
                  </div>
                </div>
                <p className='text-xs'>Cardiology · Follow-up — hypertension</p>

              </div>
            </div>
            <div className='text-[14px] space-y-1'>
              <p className='text-black font-semibold'>Sun, May 3</p>
              <div className='flex gap-2 items-center'>
                <MapPin size={14} />
                <p>09:30 · C-204</p>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className='mt-16 w-full pb-10'>
        <div className='bg-white border border-gray-300 space-y-4 rounded-xl p-6'>
          <div>
            <h4 className='text-2xl font-medium'>Recommended doctors</h4>
            <p className='text-gray-500'>Available today</p>
          </div>

          <section className='space-y-5 mt-5'>
            {
              recommededDoctors.map(doctor => (
                <div key={doctor.id} className='w-full flex justify-between'>
                  <div className='flex gap-2'>
                    <div className='size-10 grid place-items-center bg-[#DDE8F9] rounded-full'>
                      <p className='text-[#1E477B] uppercase'>df</p>
                    </div>
                    <div>
                      <p className='text-[14px] text-black font-medium'>{doctor.name}</p>
                      <p className='text-gray-400 text-xs'>{doctor.specialty}</p>
                    </div>
                  </div>
                  <Link href="#">
                    <Button className='bg-[#F7FAFC] cursor-pointer border border-gray-400 h-10 text-black w-20 font-semibold hover:bg-[#0F93A5] hover:text-white'>Book</Button>
                  </Link>
                </div>
              ))
            }
          </section>
        </div>
      </section>
    </section>
  );
}

export default HomePage;
