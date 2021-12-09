import Welcome from "./Home";
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

  let content = null;
  if (!loaded) {
    content = (
      <div className="flex flex-col h-screen bg-bfw-yellow">
        <div className="flex-grow" />
        <Spinner />
        <div className="flex-grow" />
      </div>
    );
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

  return content;
};

export default Layout;
