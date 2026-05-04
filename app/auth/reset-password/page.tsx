import ResetPasswordForm from "@/components/forms/ResetPasswordForm";
import React from "react";

const ResetPasswordPage = () => {
  return (
    <section className="w-full px-8 sm:px-3 sm:w-[400px] mx-auto h-[500px] py-20">
      <h6 className="text-center text-xl font-bold">Reset Password</h6>
      <ResetPasswordForm />
    </section>
  );
};

export default ResetPasswordPage;
