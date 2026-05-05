"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ForgotPasswordFormData, forgotPasswordSchema } from "./schema";
import TextInput from "@/components/ui/inputs/TextInput";
import { Button } from "../ui/button";
import api from "@/lib/axios";
import { AxiosError } from "axios";

const ForgotPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setServerError("");
      setSuccessMessage("");

      const res = await api.post("/auth/forgot-password", {
        email: data.email,
      });

      setSuccessMessage(
        res?.data?.message || "Password reset link sent to your email.",
      );
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setServerError(err.response?.data?.message || "Something went wrong.");
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
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-[#0F93A5] rounded-[32px] w-full h-14 cursor-pointer text-white font-bold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Sending..." : "Submit"}
        </Button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
