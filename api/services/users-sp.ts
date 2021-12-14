import { PersistedUserListItem, UserListItem } from "../interfaces/SpListItems";
import { PersistedUser, User } from "../interfaces/user";
import { applyToItemsByFilter, createItem, updateItem } from "./sp";

const vendorSiteUrl: string = process.env.VENDORS_SITE!;
const vendorContactsListGuid: string = process.env.VENDORS_CONTACTS_LIST_GUID!;

export const getUser = async (
  userId: string
): Promise<PersistedUser | null> => {
  const users = await getUsersByFilters(`UserId eq '${userId}'`);
  if (users?.length) {
    return users[0];
  } else {
    return null;
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

export const updateUserListItem = async (
  user: PersistedUser
): Promise<User> => {
  const listItem = userToListItem(user);
  await updateItem(vendorSiteUrl, vendorContactsListGuid, user.dbId, listItem);
  return user;
};

export const getUsersByFilters = async (
  filter?: string
): Promise<PersistedUser[]> => {
  return applyToItemsByFilter<PersistedUserListItem, PersistedUser[]>(
    vendorSiteUrl,
    vendorContactsListGuid,
    (items: UserListItem[]) => {
      return Promise.resolve(items.map(listItemToUser));
    },
    filter
  );
};

const listItemToUser = (item: PersistedUserListItem): PersistedUser => {
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
    Title: user.displayName,
    UserId: user.userId,
    IdentityProvider: user.identityProvider,
    ContactEmail: user.email,
    ContactFirstName: user.firstName,
    ContactLastName: user.lastName,
  };
};
