"use client";

import React, { useEffect, useState } from "react";
import { useLoginMutation } from "@/redux/services/api";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getUserIdFromToken } from "@/utils/util";
import socket from "@/socket/socket";
import LoginSection from "@/components/organisms/loginSection/loginSection";
import LayoutTemplate from "@/components/templates/layoutTemplate";
import { IloginPayload } from "@/types/types";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [login, { data, isLoading, isSuccess, isError, error }] =
    useLoginMutation();

  const handleRegistration = async (data: IloginPayload) => {
    if (!data.email || !data.password) {
      toast.error("Please fill all fields");
      return;
    }
    await login(data);
  };
  useEffect(() => {
    if (!isSuccess) return;
    socket.disconnect();

    if (data?.result?.accessToken) {
      const userId = getUserIdFromToken(data?.result?.accessToken);
      socket.io.opts.query = { userId: userId };
      socket.auth = { ...socket.auth, token: data?.result?.accessToken };
      socket.connect();
      localStorage.setItem("userId", userId || "");
      // localStorage.removeItem("guestId");
    }
    router.push("/");
  }, [isSuccess]);

  useEffect(() => {
    if (!isError) return;
    if ("data" in error) {
      toast.error(
        (error.data as { message?: string })?.message || "Login failed"
      );
    }
    setEmail("");
    setPassword("");
  }, [isError, error]);

  return (
    <div className="h-screen flex flex-col p-8 gap-10 ">
      <LayoutTemplate
        children={
          <LoginSection
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onSubmit={handleRegistration}
            isLoading={isLoading}
          />
        }
      />
    </div>
  );
};

export default Login;
