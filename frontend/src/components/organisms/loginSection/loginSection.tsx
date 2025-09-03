import Button from "@/components/atoms/button/button";
import Input from "@/components/atoms/input/input";
import { IloginPayload } from "@/types/types";
import { Loader2, Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface ILoginProps {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: (data: IloginPayload) => Promise<void>;
  isLoading: boolean;
}

const LoginSection: React.FC<ILoginProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  isLoading,
}) => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <div>
      <h1 className="text-center text-[20px] tab:text-2xl font-bold my-2 text-primary">
        Login
      </h1>
      <form
        onSubmit={handleRegistration}
        className="flex flex-col max-w-full tab:max-w-[60%] pc:max-w-[45%] w-full mx-auto my-10 p-4 border-2 border-lightBlue rounded-lg"
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
          <div className="relative">
            <Input
              type={showPassword ? "password" : "text"}
              onChange={handlePassword}
              value={password}
              placeholder="Enter your password"
              className="w-full mx-auto my-[8px]"
              isRequired
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          </div>
        </div>
        <Button
          btnText={isLoading ? <Loader2 /> : "Login"}
          className="mt-[8px] bg-primary text-white rounded-[24px]"
          type="submit"
        />
        <p
          className="text-center mt-[8px] cursor-pointer text-blue-500 hover:underline"
          onClick={() => router.push("/registration")}
        >
          Don't have an account? Signup
        </p>
      </form>
    </div>
  );
};

export default LoginSection;
