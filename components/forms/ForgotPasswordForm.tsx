"use client";
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from "react-hook-form";
import { ForgotPasswordFormData, forgotPasswordSchema } from './schema';
import TextInput from '@/components/ui/inputs/TextInput';
import { Button } from '../ui/button';

const ForgotPasswordForm = () => {

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  return (
    <form className='w-full mt-10'>
      <div>
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
        <Button className='bg-[#0F93A5] rounded-[32px] w-full h-14 cursor-pointer text-white font-bold'>
          Submit
        </Button>

      </div>

    </form>
  );
}

export default ForgotPasswordForm;
