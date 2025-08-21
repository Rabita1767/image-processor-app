"use client";
import Button from "@/components/atoms/button/button";
import Input from "@/components/atoms/input/input";
import React, { useEffect, useState } from "react";
import { useLoginMutation } from "@/redux/services/api";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getUserIdFromToken } from "@/utils/util";
import socket from "@/socket/socket";
import Header from "@/components/molecules/header/header";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [login, { data, isLoading, isSuccess, isError, error }] =
    useLoginMutation();

  const handleEmail = (value: string) => {
    setEmail(value);
  };
  const handlePassword = (value: string) => {
    setPassword(value);
  };
  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }
    await login({ email, password });
  };
  useEffect(() => {
    if (!isSuccess) return;
    socket.disconnect();

    localStorage.setItem("accessToken", data?.data?.accessToken);
    if (data?.data?.accessToken) {
      const userId = getUserIdFromToken(data?.data?.accessToken);
      socket.io.opts.query = { userId: userId };
      socket.auth.token = data?.data?.accessToken;
      socket.connect();
      localStorage.setItem("userId", userId || "");
      // localStorage.removeItem("guestId");
    }
    router.push("/");
  }, [isSuccess]);

  useEffect(() => {
    if (!isError) return;
    console.log("Login error:", error);
    if ("data" in error) {
      toast.error(
        (error.data as { message?: string })?.message || "Login failed"
      );
    }
    setEmail("");
    setPassword("");
  }, [isError, error]);

  return (
    <div className="h-screen flex flex-col p-8 gap-10">
      <Header />
      <div>
        <h1 className="text-center text-2xl font-bold my-2 text-primary">
          Login
        </h1>
        <form
          onSubmit={handleRegistration}
          className="flex flex-col max-w-[45%] w-full mx-auto my-10 p-4 border-2 border-lightBlue rounded-lg"
        >
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
            btnText="Login"
            className="mt-[8px] bg-primary text-white text-center rounded-[24px]"
            type="submit"
          />
        </form>
      </div>
    </div>
  );
};

export default Login;
