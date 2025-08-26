"use client";
import React, { useEffect, useState } from "react";
import { useSignupMutation } from "@/redux/services/api";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import LayoutTemplate from "@/components/templates/layoutTemplate";
import RegistrationSection from "@/components/organisms/registrationSection/registrationsection";
import { IRegistrationPayload } from "@/types/types";

const Registration = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [signup, { isLoading, isSuccess, isError, error }] =
    useSignupMutation();
  const handleRegistration = async (data: IRegistrationPayload) => {
    if (!data.userName || !data.email || !data.password) {
      toast.error("Please fill all fields");
      return;
    }
    await signup(data);
  };
  useEffect(() => {
    if (isSuccess) {
      toast.success("Account Registration Successful");
      router.push("/login");
      setUserName("");
      setEmail("");
      setPassword("");
    }
  }, [isSuccess]);

  useEffect(() => {
    if (!isError) return;
    if ("data" in error) {
      toast.error(
        (error.data as { message?: string })?.message || "Registration failed"
      );
    }
    setUserName("");
    setEmail("");
    setPassword("");
  }, [isError, error]);

  return (
    <div className="h-screen flex flex-col p-8 gap-10">
      <LayoutTemplate
        children={
          <RegistrationSection
            userName={userName}
            setUserName={setUserName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onSubmit={handleRegistration}
          />
        }
      />
    </div>
  );
};

export default Registration;
