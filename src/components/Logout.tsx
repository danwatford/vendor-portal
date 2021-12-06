import { DefaultButton } from "@fluentui/react";

const Logout: React.FC = () => {
  return (
    <>
      <DefaultButton text="Sign Out" href="/api/logout" />
    </>
  );
};

export default Logout;
