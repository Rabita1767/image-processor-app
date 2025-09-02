import Image from "next/image";
import Header from "../molecules/header/header";
import noDataIcon from "@/app/assets/images/no-data.png";
import { useEffect, useState } from "react";
import socket from "@/socket/socket";

interface IlayoutProps {
  children: React.ReactNode;
  noData?: boolean;
  isHomePage?: boolean;
}

const LayoutTemplate: React.FC<IlayoutProps> = ({
  children,
  noData,
  isHomePage,
}) => {
  const [hasToken, setHasToken] = useState(false);
  const [guestId, setGuestId] = useState<string>("");

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    setHasToken(false);
    socket.disconnect();
    socket.io.opts.query = { userId: guestId };
    socket.auth = { ...socket.auth, token: "" };
    window.location.href = "/";
  };
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setHasToken(true);
    }
  }, []);

  useEffect(() => {
    const guestId = localStorage.getItem("guestId") || "guest";
    setGuestId(guestId);
  }, []);
  return (
    <>
      <Header
        logoutHandler={handleLogout}
        hasToken={hasToken}
        isHomePage={isHomePage}
      />
      {noData ? (
        <div className="flex justify-center mobile:mt-[25%] tab:mt-[7%]">
          <Image src={noDataIcon} alt="No Data" height={320} width={320} />{" "}
        </div>
      ) : (
        children
      )}
    </>
  );
};

export default LayoutTemplate;
