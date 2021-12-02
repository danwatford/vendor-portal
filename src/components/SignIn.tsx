import { DefaultButton } from "@fluentui/react";

const SignIn: React.FC = () => {
  return (
    <>
      <h2>Sign in using your account from one of these services</h2>
      <div>
        <DefaultButton text="Office 365" href="/.auth/login/aad" />
        <DefaultButton text="Twitter" href="/.auth/login/twitter" />
        <DefaultButton text="Facebook" href="/.auth/login/facebook" />
        <DefaultButton text="B2C" href="/.auth/login/b2cauth" />
      </div>
    </>
  );
};

export default SignIn;
