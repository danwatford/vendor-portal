// import {
//   useClientPrincipal,
// } from "@aaronpowell/react-static-web-apps-auth";
// import ProfileCaptureHOC from "./ProfileCaptureHOC";
import Footer from "./Footer";
import Header from "./Header";
import Welcome from "./Welcome";
import {
  Logout,
  useClientPrincipal,
} from "@aaronpowell/react-static-web-apps-auth";
import { useEffect, useState } from "react";
import { useUserProfile } from "../services/UserProfileContext";
// import { useUserProfile } from "./UserProfileContext";

const Layout: React.FC = () => {
  const { loaded, userProfile } = useUserProfile();

  // const { loaded: userProfileLoaded, userProfile } = useUserProfile();

  // const [loaded, setLoaded] = useState(false);

  // useEffect(() => {
  //   setLoaded(clientPrincipalLoaded && userProfileLoaded);
  // }, [clientPrincipalLoaded, userProfileLoaded]);

  let content;

  if (!loaded) {
    content = <p>Loading app...</p>;
  } else {
    if (userProfile) {
      content = (
        <>
          <p>
            User logged in:
            {JSON.stringify(userProfile)}
          </p>
          <Logout />
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
        {/* <ProfileCaptureHOC> */}
        <Welcome />
        {content}
        {/* </ProfileCaptureHOC> */}
      </div>
      <div>
        <Footer></Footer>
      </div>
    </div>
  );
};

export default Layout;
