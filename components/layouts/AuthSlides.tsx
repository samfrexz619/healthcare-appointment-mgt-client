"use client"
import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import Link from 'next/link';


const AuthSlides = () => {
  const slides = [
    {
      id: 1,
      text: "Find a lot of specialist doctors in one place",
      image: "/images/slides/slide1.png"
    },
    {
      id: 2,
      text: "Get advice only from a doctor you believe in.",
      image: "/images/slides/slide2.png"
    },
    {
      id: 3,
      text: "Book appointments at your convenience.",
      image: "/images/slides/slide3.png"
    },
  ]
  return (
    <div className='h-full'>
      <Link href="/auth/login" className='px-10 pt-8 block pb-6'>
        <Image src="/images/icons/logo.svg" alt="company logo" width={50} height={50} />
        <p className='text-xl font-bold text-[#407CE2]'>MediApp</p>
      </Link>
      <Swiper modules={[Pagination, Autoplay]}
        slidesPerView={1}
        spaceBetween={20}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        loop={true}>
        {slides.map(slide => (
          <SwiperSlide key={slide.id}>
            <div className="flex flex-col items-center text-center pb-10">
              <Image
                src={slide.image}
                alt={slide.text}
                width={300}
                height={250}
                className="object-contain"
              />
              <p className="mt-4 text-xl font-semibold">{slide.text}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default AuthSlides;
