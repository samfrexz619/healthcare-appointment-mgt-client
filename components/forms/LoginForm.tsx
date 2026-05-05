"use client";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { LoginFormData, loginSchema } from "./schema";
import TextInput from "@/components/ui/inputs/TextInput";
import Link from "next/link";
import { Button } from "../ui/button";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/lib/services/authService";
import { AxiosError } from "axios";

const LoginForm = () => {
  const router = useRouter();

  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError(null);
    try {
      await authService.login(data.email, data.password);
      router.push("/dashboard/home");
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const message = err?.response?.data?.message;
        setServerError(message);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    
  };

  return (
    <form className="w-full mt-10" onSubmit={handleSubmit(onSubmit)}>
      {/* Server error */}
      {serverError && (
        <div className="w-full bg-red-50 border border-red-300 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
          {serverError}
        </div>
      )}

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

      <div className="mt-5">
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
        <div className="w-full text-right mt-2">
          <Link
            href="/auth/forgot-password"
            className="text-[#0F93A5] font-semibold"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <div className="mt-5">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-[#0F93A5] rounded-[32px] w-full h-14 cursor-pointer text-white font-bold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
        <p className="text-center mt-2">
          Don't have an account?{" "}
          <Link href="/auth/sign-up" className="text-[#0F93A5] font-semibold">
            Sign up
          </Link>
        </p>
      </div>

      <div className="mt-12">
        <div className="w-full flex gap-2 items-center">
          <i className="w-1/2 h-px bg-gray-400 block" />
          <span className="text-gray-400">OR</span>
          <i className="w-1/2 h-px bg-gray-400 block" />
        </div>

        <div
          onClick={handleGoogleLogin}
          className="border px-5 border-gray-400 rounded-xl h-16 mt-8 flex items-center gap-7 justify-center cursor-pointer hover:bg-gray-50 transition"
        >
          <Image
            src="/images/icons/googleIcon.svg"
            width={30}
            height={30}
            alt="google icon"
          />
          <p className="text-lg font-semibold">Sign in with Google</p>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
