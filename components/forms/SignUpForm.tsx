"use client";
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from "react-hook-form";
import { signUpSchema, SignUpFormData } from './schema';
import TextInput from '@/components/ui/inputs/TextInput';
import Link from 'next/link';
import { Button } from '../ui/button';

const SignUpForm = () => {

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  })

  return (
    <form className='w-full mt-10'>
      <div>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextInput
              id="text"
              type="text"
              label="Full Name"
              value={field.value}
              onChange={field.onChange}
              error={errors.name?.message}
            />
          )}
        />
      </div>
      <div className='mt-5'>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextInput
              id="email"
              type="email"
              label="Email"
              value={field.value}
              onChange={field.onChange}
              error={errors.email?.message}
            />
          )}
        />
      </div>

      <div className='mt-5'>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextInput
              id="password"
              type="password"
              label="Password"
              value={field.value}
              onChange={field.onChange}
              error={errors.password?.message}
            />
          )}
        />
      </div>

      <div className='mt-5'>
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <TextInput
              id="confirmPassword"
              type="password"
              label="Confirm Password"
              value={field.value}
              onChange={field.onChange}
              error={errors.confirmPassword?.message}
            />
          )}
        />
      </div>
      <div className='mt-10'>
        <Button className='bg-[#0F93A5] rounded-[32px] w-full h-14 cursor-pointer text-white font-bold'>
          Sign Up
        </Button>
        <p className='text-center mt-2'>Already have an account?  <Link href={'/auth/login'} className='text-[#0F93A5] font-semibold'>Sign In</Link></p>
      </div>
      <div>

      </div>
    </form>
  );
}

export default SignUpForm;
