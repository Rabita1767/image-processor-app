import Image from "next/image";
import Header from "../molecules/header/header";
import noDataIcon from "@/app/assets/images/no-data.png";

interface IlayoutProps {
  children: React.ReactNode;
  noData?: boolean;
  isHomePage?: boolean;
  hasToken?: boolean;
  handleLogout?: () => void;
}

const LayoutTemplate: React.FC<IlayoutProps> = ({
  children,
  noData,
  isHomePage,
  hasToken,
  handleLogout,
}) => {
  return (
    <>
      <Header
        logoutHandler={handleLogout}
        hasToken={hasToken}
        isHomePage={isHomePage}
      />
      {noData ? <Image src={noDataIcon} alt="No Data" /> : children}
    </>
  );
};

export default LayoutTemplate;
