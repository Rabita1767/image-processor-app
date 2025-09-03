import Button from "@/components/atoms/button/button";
import Input from "@/components/atoms/input/input";
import { IRegistrationPayload } from "@/types/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface IregistrationProps {
  userName: string;
  setUserName: React.Dispatch<React.SetStateAction<string>>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: (data: IRegistrationPayload) => Promise<void>;
}

const RegistrationSection: React.FC<IregistrationProps> = ({
  userName,
  setUserName,
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
}) => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const handleUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };
  const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };
  const handleRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ userName, email, password });
  };

  return (
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
  );
};

export default RegistrationSection;
