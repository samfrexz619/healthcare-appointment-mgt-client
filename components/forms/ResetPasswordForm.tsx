"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import TextInput from "@/components/ui/inputs/TextInput";
import { Button } from "../ui/button";
import api from "@/lib/axios";
import { ResetPasswordFormData, resetPasswordSchema } from "./schema";
import { AxiosError } from "axios";

const ResetPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setServerError("Invalid or missing token.");
      return;
    }

    try {
      setIsLoading(true);
      setServerError("");
      setSuccessMessage("");

      const res = await api.post("/auth/reset-password", {
        token,
        password: data.password,
      });

      setSuccessMessage(res?.data?.message || "Password reset successfully.");

      // Optional redirect after success
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setServerError(
          err?.response?.data.errors[0].msg ||
            "Reset failed. The link may be expired.",
        );
      } else {
        setServerError("Something went wrong.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="w-full mt-10" onSubmit={handleSubmit(onSubmit)}>
      {/* Success */}
      {successMessage && (
        <div className="w-full bg-green-50 border border-green-300 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
          {successMessage}
        </div>
      )}

      {/* Error */}
      {serverError && (
        <div className="w-full bg-red-50 border border-red-300 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
          {serverError}
        </div>
      )}

      {/* Password */}
      <div>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextInput
              id="password"
              type="password"
              label="New Password"
              value={field.value}
              onChange={field.onChange}
              error={errors.password?.message}
            />
          )}
        />
      </div>

      {/* Confirm Password */}
      <div className="mt-5">
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

      <div className="mt-5">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-[#0F93A5] rounded-[32px] w-full h-14 cursor-pointer text-white font-bold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </Button>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
