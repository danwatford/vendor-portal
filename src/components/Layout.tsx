import Footer from "./Footer";
import Header from "./Header";
import Welcome from "./Welcome";
import { useUserProfile } from "../services/UserProfileContext";

const Layout: React.FC = () => {
  const { loaded, userProfile } = useUserProfile();

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
        <Welcome />
        {content}
      </div>
      <div>
        <Footer></Footer>
      </div>
    </div>
  );
};

export default Layout;
