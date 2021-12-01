import { useEffect, useState } from "react";
import {
  useClientPrincipal,
  Logout,
} from "@aaronpowell/react-static-web-apps-auth";
import NewUserLanding from "./NewUserLanding";
// import { useUserProfile } from "./UserProfileContext";

const Layout: React.FC = () => {
  const { loaded: clientPrincipalLoaded, clientPrincipal } =
    useClientPrincipal();
  // const { loaded: userProfileLoaded, userProfile } = useUserProfile();

  // const [loaded, setLoaded] = useState(false);

  // useEffect(() => {
  //   setLoaded(clientPrincipalLoaded && userProfileLoaded);
  // }, [clientPrincipalLoaded, userProfileLoaded]);

  let content;

  if (!clientPrincipalLoaded) {
    content = <p>Loading app...</p>;
  } else {
    if (clientPrincipal) {
      content = (
        <>
          <p>
            User logged in:
            {JSON.stringify(clientPrincipal)}
          </p>
          <Logout />
        </>
      );
    } else {
      content = <NewUserLanding />;
    }
  }

  return content;
};

export default Layout;
