import { Cookie } from "@azure/functions";
import { parse } from "cookie";
import { createHmac } from "crypto";
import { User } from "../interfaces/user";
import { isUserValid } from "./users-validate";

const MAX_COOKIE_AGE_SECONDS = 60 * 60 * 12;

// If we have a user id included in a cookie, use it to look up the user's profile.
// If the minimum profile fields that are populated by the identity provider are present
// then we can consider the user identified.
export const getUserFromCookie = async (cookie: string): Promise<User> => {
  if (cookie) {
    const cookies = parse(cookie);
    const vendorPortalUserCookie = cookies.vendorPortalUser;
    const [_, user] = userFromCookie(vendorPortalUserCookie);
    if (isUserValid(user)) {
      return user;
    }
  }
  return undefined;
};

export const createInvalidUserCookie = (): Cookie => {
  return {
    name: "vendorPortalUser",
    value: "NA",
    secure: true,
    httpOnly: true,
    sameSite: "Strict",
  };
};

export const createUserCookie = (userId: string, user: User): Cookie => {
  const hexEncodedCookieValue = Buffer.from(
    JSON.stringify({
      userId,
      user,
    })
  ).toString("hex");

  const hmac = createHmac("sha256", process.env.COOKIE_SECRET);
  hmac.update(hexEncodedCookieValue);
  const hash = hmac.digest("hex");

  return {
    name: "vendorPortalUser",
    value: hash + hexEncodedCookieValue,
    secure: true,
    httpOnly: true,
    sameSite: "Strict",
    maxAge: MAX_COOKIE_AGE_SECONDS,
  };
};

const userFromCookie = (cookieValue: string): [userId: string, user: User] => {
  if (!cookieValue || cookieValue.length < 65) {
    return [null, null];
  }

  console.log("userFromCookie: " + cookieValue);

  const hash = cookieValue.substring(0, 64);
  const hexEncodedValue = cookieValue.substring(64);
  if (!hash || !hexEncodedValue) {
    return [null, null];
  }

  const hmac = createHmac("sha256", process.env.COOKIE_SECRET);
  hmac.update(hexEncodedValue);
  const calculatedHash = hmac.digest("hex");

  if (hash === calculatedHash) {
    const { userId, user } = JSON.parse(
      Buffer.from(hexEncodedValue, "hex").toString()
    );
    return [userId, user];
  } else {
    return null;
  }
};
