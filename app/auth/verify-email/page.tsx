"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link.");
        return;
      }

      try {
        setStatus("loading");

        await api.get(`/auth/verify-email?token=${token}`);

        setStatus("success");
        setMessage("Email verified successfully. You can now log in.");
      } catch (err: unknown) {
        setStatus("error");
        setMessage(
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Verification failed. The link may be expired.",
        );
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="w-full max-w-md mx-auto mt-20 text-center">
      {status === "loading" && (
        <div className="text-gray-600 text-lg font-medium">
          Verifying your email...
        </div>
      )}

      {status === "success" && (
        <div className="w-full bg-green-50 border border-green-300 text-green-700 text-sm rounded-lg px-4 py-6">
          <p className="text-lg font-semibold mb-2">Success</p>
          <p>{message}</p>

          <Button
            onClick={() => router.push("/auth/login")}
            className="mt-6 bg-[#407CE2] rounded-[32px] w-full h-12 text-white font-bold"
          >
            Go to Login
          </Button>
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="w-full bg-red-50 border border-red-300 text-red-600 text-sm rounded-lg px-4 py-6">
          <p className="text-lg font-semibold mb-2">Error</p>
          <p>{message}</p>

          <Link
            href="/auth/login"
            className="inline-block mt-6 text-[#407CE2] font-semibold"
          >
            Back to Login
          </Link>
        </div>
      )}
    </div>
  );
}
