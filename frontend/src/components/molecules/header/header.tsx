import Button from "@/components/atoms/button/button";
import { useRouter } from "next/navigation";

interface IHeaderProps {
  hasToken?: boolean;
  logoutHandler: () => void;
}
const Header: React.FC<IHeaderProps> = ({ hasToken, logoutHandler }) => {
  const router = useRouter();
  return (
    <div className="flex flex-jow justify-between w-full">
      <div>
        {hasToken && (
          <Button
            onClick={() => {
              router.push("/user-images");
            }}
            type="submit"
            btnText="Images"
            className="rounded-[24px] bg-primary text-white"
          />
        )}
      </div>
      <div className="flex flex-row justify-end gap-4">
        <Button
          onClick={
            hasToken
              ? logoutHandler
              : () => {
                  router.push("/login");
                }
          }
          type="submit"
          btnText={hasToken ? "Logout" : "Login"}
          className="bg-transparent text-[black] hover:rounded-[24px] hover:text-white"
        />
        <Button
          onClick={() => {
            router.push("/registration");
          }}
          type="submit"
          btnText="Signup"
          className="rounded-[24px] bg-primary text-white"
        />
      </div>
    </div>
  );
};

export default Header;
