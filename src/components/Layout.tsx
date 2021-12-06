import Footer from "./Footer";
import Header from "./Header";
import Welcome from "./Welcome";
import { useUserProfile } from "../services/UserProfileContext";
import { useState } from "react";
import Spinner from "./Spinner";

type Screen =
  | "home"
  | "create-craft-application"
  | "create-catering-application";

const Layout: React.FC = () => {
  const [screen, setScreen] = useState<Screen>("home");
  const { loaded, userProfile } = useUserProfile();

  let content;

  if (!loaded) {
    content = <Spinner />;
  } else {
    if (userProfile) {
      content = (
        <>
          <p>
            User logged in:
            {JSON.stringify(userProfile)}
          </p>
        </>
      );
    }
  }

  return (
    <div className="h-screen flex flex-col gap-1">
      <div>
        <Header />
      </div>
      <div className="flex-grow">
        {/* <Welcome /> */}
        {content}
      </div>
      <div>
        <Footer></Footer>
      </div>
    </div>
  );
};

export default Layout;
