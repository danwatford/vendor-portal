import {
  useClientPrincipal,
  Logout,
} from "@aaronpowell/react-static-web-apps-auth";
import ProfileCaptureHOC from "./ProfileCaptureHOC";
import NewUserLanding from "./NewUserLanding";
import Footer from "./Footer";
import Header from "./Header";
import Welcome from "./Welcome";
// import { useUserProfile } from "./UserProfileContext";

const Layout: React.FC = () => {
  const { loaded: clientPrincipalLoaded, clientPrincipal } =
    useClientPrincipal();
  // const { loaded: userProfileLoaded, userProfile } = useUserProfile();

  // const [loaded, setLoaded] = useState(false);

  // useEffect(() => {
  //   setLoaded(clientPrincipalLoaded && userProfileLoaded);
  // }, [clientPrincipalLoaded, userProfileLoaded]);

  // let content;

  // if (!clientPrincipalLoaded) {
  //   content = <p>Loading app...</p>;
  // } else {
  //   if (clientPrincipal) {
  //     content = (
  //       <>
  //         <p>
  //           User logged in:
  //           {JSON.stringify(clientPrincipal)}
  //         </p>
  //         <Logout />
  //       </>
  //     );
  //   } else {
  //     content = <NewUserLanding />;
  //   }
  // }

  return (
    <div className="h-screen flex flex-col gap-1">
      <div>
        <Header />
      </div>
      <div className="flex-grow">
        <ProfileCaptureHOC>
          <Welcome />
        </ProfileCaptureHOC>
      </div>
      <div>
        <Footer></Footer>
      </div>
    </div>
  );
};

export default Layout;
