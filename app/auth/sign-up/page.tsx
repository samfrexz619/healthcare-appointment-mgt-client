import React from 'react';
import SignUpForm from '@/components/forms/SignUpForm';

const SignUpPage = () => {
  return (
    <section className='w-full px-8 sm:px-3 sm:w-[400px] mx-auto h-[500px]'>

      <h6 className='text-center text-xl font-bold'>Sign Up</h6>
      <SignUpForm />
    </section>
  );
}

export default SignUpPage;
