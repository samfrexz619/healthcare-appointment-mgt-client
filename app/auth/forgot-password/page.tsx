import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const ForgotPasswordPage = () => {
  return (
    <section className='w-full px-8 sm:px-3 sm:w-[400px] mx-auto h-[500px] py-20'>
      <Link
        href="/auth/login"
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#0F93A5] transition hover:text-[#0C7E8D]"
      >
        <ArrowLeft size={18} />
        Back to login
      </Link>
      <h6 className='text-center text-xl font-bold'>Forgot Password</h6>
      <ForgotPasswordForm />
    </section>
  );
}

export default ForgotPasswordPage;
