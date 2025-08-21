import Button from "@/components/atoms/button/button";
import { useRouter } from "next/navigation";

interface IHeaderProps {
  hasToken?: boolean;
  logoutHandler?: () => void;
  isHomePage?: boolean;
}
const Header: React.FC<IHeaderProps> = ({
  hasToken,
  logoutHandler,
  isHomePage,
}) => {
  const router = useRouter();
  return (
    <div className="flex flex-jow justify-between w-full">
      {isHomePage ? (
        <>
          <div>
            {hasToken && (
              <Button
                onClick={() => {
                  router.push("/user-images");
                }}
                type="submit"
                btnText="Images"
                className="rounded-[24px] bg-primary text-white hover:bg-blue-600"
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
              className="bg-transparent text-primary hover:rounded-[24px] hover:text-white hover:bg-blue-600 "
            />
            <Button
              onClick={() => {
                router.push("/registration");
              }}
              type="submit"
              btnText="Signup"
              className="rounded-[24px] bg-primary text-white hover:bg-blue-600"
            />
          </div>
        </>
      ) : (
        <Button
          onClick={() => {
            router.push("/");
          }}
          type="submit"
          btnText="Home"
          className="rounded-[24px] bg-primary text-white hover:bg-blue-600"
        />
      )}
    </div>
  );
};

export default Header;
