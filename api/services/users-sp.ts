import { UserListItem } from "../interfaces/SpListItems";
import { User } from "../interfaces/user";
import { applyToItemsByFilter, createItem, updateItem } from "./sp";

const vendorSiteUrl: string = process.env.VENDORS_SITE;
const vendorContactsListGuid: string = process.env.VENDORS_CONTACTS_LIST_GUID;

export const getUser = async (userId: string): Promise<User> => {
  const users = await getUsersByFilters(`UserId eq '${userId}'`);
  if (users?.length) {
    return users[0];
  } else {
    return undefined;
  }
};

export const createUserListItem = async (user: User): Promise<User> => {
  const addResult = await createItem<UserListItem>(
    vendorSiteUrl,
    vendorContactsListGuid,
    userToListItem(user)
  );
  return listItemToUser(addResult.data);
};

export const updateUserListItem = async (user: User): Promise<User> => {
  const listItem = userToListItem(user);
  await updateItem(vendorSiteUrl, vendorContactsListGuid, listItem);
  return user;
};

export const getUsersByFilters = async (filter?: string): Promise<User[]> => {
  return applyToItemsByFilter<UserListItem, User[]>(
    vendorSiteUrl,
    vendorContactsListGuid,
    (items: UserListItem[]) => {
      return Promise.resolve(
        items.map((item) => {
          return {
            userId: item.UserId,
            identityProvider: item.IdentityProvider,
            email: item.ContactEmail,
            firstName: item.ContactFirstName,
            lastName: item.ContactLastName,
            displayName: item.Title,
            dbId: item.ID,
          };
        })
      );
    },
    filter
  );
};

const listItemToUser = (item: UserListItem): User => {
  return {
    userId: item.UserId,
    identityProvider: item.IdentityProvider,
    email: item.ContactEmail,
    firstName: item.ContactFirstName,
    lastName: item.ContactLastName,
    displayName: item.Title,
    dbId: item.ID,
  };
};

const userToListItem = (user: User): UserListItem => {
  return {
    ID: user.dbId,
    Title: user.displayName,
    UserId: user.userId,
    IdentityProvider: user.identityProvider,
    ContactEmail: user.email,
    ContactFirstName: user.firstName,
    ContactLastName: user.lastName,
  };
};
