import { sp } from "@pnp/sp-commonjs/presets/all";
import { Web } from "@pnp/sp-commonjs/webs";
import { IItemAddResult, IItemUpdateResult } from "@pnp/sp-commonjs/items";
import { SPFetchClient } from "@pnp/nodejs-commonjs";
import { ListItem } from "../interfaces/SpListItems";

const siteUrl: string = process.env.VENDORS_SITE!;
const clientId: string = process.env.VENDORS_CLIENT_ID!;
const clientSecret: string = process.env.VENDORS_CLIENT_SECRET!;

sp.setup({
  sp: {
    fetchClientFactory: () => {
      return new SPFetchClient(siteUrl, clientId, clientSecret);
    },
  },
});

export const createItem = async <T>(
  site: string,
  listGuid: string,
  item: T
): Promise<IItemAddResult> => {
  const web = Web(site);
  const list = web.lists.getById(listGuid);
  return list.usingCaching().items.add(item);
};

export const updateItem = async <T extends ListItem>(
  site: string,
  listGuid: string,
  itemId: number,
  item: T
): Promise<IItemUpdateResult> => {
  const web = Web(site);
  const list = web.lists.getById(listGuid);
  return list.usingCaching().items.getById(itemId).update(item);
};

const getPagedItemsdByFilter = async <T>(
  site: string,
  listGuid: string,
  filter?: string
) => {
  const web = Web(site);
  let itemsQuery = web.lists.getById(listGuid).items;
  if (filter) {
    itemsQuery = itemsQuery.filter(filter);
  }

  return await itemsQuery.usingCaching().getPaged<T[]>();
};

export const applyToPagedItemsdByFilter = async <T, U>(
  site: string,
  listGuid: string,
  callback: (items: T[]) => Promise<U>,
  filter?: string,
  doPaging: boolean = true
): Promise<U> => {
  let retVal: U;
  let pagedItems = await getPagedItemsdByFilter<T>(site, listGuid, filter);
  retVal = await callback(pagedItems.results);

  while (doPaging && pagedItems.hasNext) {
    pagedItems = await pagedItems.getNext();
    retVal = await callback(pagedItems.results);
  }
  return retVal;
};

export const applyToItemsByFilter = async <T, U>(
  site: string,
  listGuid: string,
  callback: (items: T[]) => Promise<U>,
  filter?: string
) => {
  return applyToPagedItemsdByFilter(site, listGuid, callback, filter, false);
};
