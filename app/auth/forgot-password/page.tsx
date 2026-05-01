import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm';
import React from 'react';

const ForgotPasswordPage = () => {
  return (
    <section className='w-full px-8 sm:px-3 sm:w-[400px] mx-auto h-[500px] py-20'>
      <h6 className='text-center text-xl font-bold'>Forgot Password</h6>
      <ForgotPasswordForm />
    </section>
  );
}

export default ForgotPasswordPage;
