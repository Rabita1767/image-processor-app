"use client";
import Button from "@/components/atoms/button/button";
import Input from "@/components/atoms/input/input";
import React, { useEffect, useState } from "react";
import { useSignupMutation } from "@/redux/services/api";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Header from "@/components/molecules/header/header";

const Registration = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [signup, { isLoading, isSuccess, isError, error }] =
    useSignupMutation();
  const handleUserName = (value: string) => {
    setUserName(value);
  };
  const handleEmail = (value: string) => {
    setEmail(value);
  };
  const handlePassword = (value: string) => {
    setPassword(value);
  };
  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !email || !password) {
      alert("Please fill all fields");
      return;
    }
    await signup({ userName, email, password });
  };
  useEffect(() => {
    if (isSuccess) {
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
      <Header />
      <div>
        <h1 className="text-center text-[20px] tab:text-2xl font-bold my-4">
          Registration
        </h1>
        <form
          onSubmit={handleRegistration}
          className="flex flex-col max-w-full tab:max-w-[60%] pc:max-w-[45%] w-full mx-auto my-10 p-4 border-2 border-gray-300 rounded-lg"
        >
          <div>
            <p>Username</p>
            <Input
              type="text"
              onChange={handleUserName}
              value={userName}
              placeholder="Enter your username"
              className="w-full mx-auto my-[8px]"
              isRequired
            />
          </div>
          <div>
            <p>Email</p>
            <Input
              type="text"
              onChange={handleEmail}
              value={email}
              placeholder="Enter your email"
              className="w-full mx-auto my-[8px]"
              isRequired
            />
          </div>
          <div>
            <p>Password</p>
            <Input
              type="password"
              onChange={handlePassword}
              value={password}
              placeholder="Enter your password"
              className="w-full mx-auto my-[8px]"
              isRequired
            />
          </div>
          <Button
            btnText="Signup"
            className="mt-[8px] bg-primary text-white text-center rounded-[24px]"
            type="submit"
          />
          <p
            className="text-center mt-[8px] cursor-pointer text-blue-500 hover:underline"
            onClick={() => router.push("/login")}
          >
            Already have an account? Login
          </p>
        </form>
      </div>
    </div>
  );
};

export default Registration;
