import Footer from "./Footer";
import Header from "./Header";
import Welcome from "./Welcome";
import { useUserProfile } from "../services/UserProfileContext";
import { useCallback, useState } from "react";
import Spinner from "./Spinner";
import CraftApplicationForm from "./forms/CraftApplicationForm";

type Screen =
  | "home"
  | "create-craft-application"
  | "create-catering-application";

const Layout: React.FC = () => {
  const [screen, setScreen] = useState<Screen>("home");
  const { loaded, userProfile } = useUserProfile();

  const onCreateCraftApplicationClicked = useCallback(() => {
    setScreen("create-craft-application");
  }, []);

  const onCreateCateringApplicationClicked = useCallback(() => {
    setScreen("create-catering-application");
  }, []);

  let content;
  if (!loaded) {
    content = <Spinner />;
  } else {
    if (!userProfile) {
      switch (screen) {
        case "home":
          content = (
            <Welcome
              createCraftApplicationClickedHandler={
                onCreateCraftApplicationClicked
              }
              createCateringApplicationClickedHandler={
                onCreateCateringApplicationClicked
              }
            />
          );
          break;
        case "create-craft-application":
          content = <CraftApplicationForm />;
          break;
        case "create-catering-application":
          break;
      }
    }
  }

  return (
    <div className="h-screen flex flex-col gap-1">
      <div>
        <Header />
      </div>
      <div className="flex-grow m-auto px-2 w-full max-w-lg">{content}</div>
      <div>
        <Footer></Footer>
      </div>
    </div>
  );
};

export default Layout;
