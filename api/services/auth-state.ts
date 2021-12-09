import { createHmac, Hmac } from "crypto";

export type AuthStateType = "login";

export type LoginAuthState = {
  type: AuthStateType;
  postAuthRedirectUrl: string;
};

export type AuthState = LoginAuthState;

export const encodeAuthState = (authState: AuthState): string => {
  const authStateJsonHex = Buffer.from(JSON.stringify(authState)).toString(
    "hex"
  );
  const hmac = getHmac();
  hmac.update(authStateJsonHex);
  const hash = hmac.digest("hex");
  return hash + authStateJsonHex;
};

export const decodeAuthState = (encodedAuthState: string): AuthState => {
  if (!encodedAuthState || encodedAuthState.length < 65) {
    return null;
  }

  const hash = encodedAuthState.substring(0, 64);
  const hexEncodedValue = encodedAuthState.substring(64);
  if (!hash || !hexEncodedValue) {
    return null;
  }

  const hmac = getHmac();
  hmac.update(hexEncodedValue);
  const calculatedHash = hmac.digest("hex");

  if (hash === calculatedHash) {
    return JSON.parse(Buffer.from(hexEncodedValue, "hex").toString());
  } else {
    return null;
  }
};

const getHmac = (): Hmac => {
  return createHmac("sha256", process.env.COOKIE_SECRET);
};
