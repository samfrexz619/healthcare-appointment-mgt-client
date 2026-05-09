"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
// import { Button } from '@/components/ui/button'
import { DoctorInfo } from "@/types/dashboard";
import AppointmentDateTime from "../AppointmentDateTime";
import { reviewService } from "@/lib/services/reviewService";

interface DoctorDetailProps {
  doctor: DoctorInfo;
}

interface Review {
  _id: string;
  patient_id: {
    first_name: string;
    last_name: string;
  };
  rating: number;
  comment: string;
  created_at: string;
}

const DoctorDetail: React.FC<DoctorDetailProps> = ({ doctor }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!doctor?._id) return;

    let isMounted = true;

    const load = async () => {
      setIsLoading(true);

      // clear previous reviews immediately
      setReviews([]);

      try {
        const res = await reviewService.getDoctorReviews(doctor._id);

        // only update if still current request
        if (isMounted) {
          setReviews(res.reviews);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load reviews:", err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [doctor?._id]);
  return (
    <>
      <section className="w-full flex justify-between">
        <div className="flex gap-3">
          <div className="relative w-fit">
            <div className="size-14 bg-gray-200 rounded-lg"></div>
            <div className="flex items-center w-11 justify-center gap-1 bg-white rounded-md p-1 absolute left-1/2 -translate-x-1/2 -bottom-1 shadow-sm">
              <Image
                src="/images/icons/star.png"
                alt="start"
                width={10}
                height={10}
                className="w-2.5 h-2.5"
              />
              <span className="text-[10px] font-semibold">{doctor.rating}</span>
            </div>
          </div>

          <div className="space-y-2 w-50">
            <p>
              Dr. {doctor.first_name} {doctor.last_name}
            </p>
            <div className="flex flex-col text-xs gap-2">
              <p>{doctor.specialisation}</p>
              {/* <i className='block size-2 bg-gray-600 rounded-full'></i> */}
              <p>{doctor.experience_years} years experience</p>
            </div>
          </div>
        </div>
        <AppointmentDateTime doctor={doctor} />
      </section>
      <section className="">
        <div className="flex gap-8">
          <div className="text-xs space-y-1">
            <p className="text-gray-400">Education</p>
            <p className=" text-black">{doctor.education}</p>
          </div>
          <div className="text-xs space-y-1">
            <p className="text-gray-400">Certificate</p>
            <p className=" text-black">{doctor.certification}</p>
          </div>
        </div>
      </section>
      <div className="mt-5">
        <p>Available Today:</p>
        <ul className=" mt-3 flex gap-6 items-center">
          {doctor?.availability_types?.includes("Online") && (
            <li className="py-1 px-2 bg-gray-100 rounded-md w-fit flex items-center gap-2">
              <i className="block size-1.5 rounded-full bg-gray-500" />
              <span className="text-xs">Online Consultation</span>
            </li>
          )}
          {doctor?.availability_types?.includes("In-Person") && (
            <li className="py-1 px-2 bg-gray-100 rounded-md w-fit flex items-center gap-2">
              <i className="block size-1.5 rounded-full bg-gray-500" />
              <span className="text-xs">Offline at {doctor.clinic_name}</span>
            </li>
          )}
        </ul>
      </div>
      <section className="space-y-4">
        <p>
          Doctor's Reviews <span>({reviews.length} Reviews)</span>
        </p>
        {reviews.map((review) => (
          <div
            key={review._id}
            className="w-full border border-gray-300 rounded-lg p-4"
          >
            <div className="flex gap-3">
              <div className="size-10 rounded-md bg-gray-400" />
              <div className="space-y-1">
                <p className="text-xs text-black font-bold">
                  {review.patient_id
                    ? `${review.patient_id.first_name} ${review.patient_id.last_name}`
                    : "Anonymous Patient"}
                </p>
                <div className="flex items-center text-xs gap-2">
                  <p>
                    {" "}
                    {new Date(review.created_at)
                      .toISOString()
                      .replace("T", " ")
                      .slice(0, 16)}
                  </p>

                  <i className="size-1.5 bg-gray-500 rounded-full block" />
                  <Image
                    src="/images/icons/star.png"
                    alt="star"
                    width={9}
                    height={9}
                    className="w-2.5 h-2.5"
                  />
                  <p>{review.rating}</p>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs">{review.comment}</p>
            </div>
          </div>
        ))}
      </section>
    </>
  );
};

export default DoctorDetail;
