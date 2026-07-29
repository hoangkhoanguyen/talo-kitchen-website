import { APPItems, appMeta, initAppConfigs } from "./app";
import { initUIConfigs, UIItems, uiMeta } from "./ui";

export const adminConfigs = {
  ui: {
    items: UIItems,
    meta: uiMeta,
    initConfigs: initUIConfigs,
  },
  app: {
    items: APPItems,
    meta: appMeta,
    initConfigs: initAppConfigs,
  },
};
